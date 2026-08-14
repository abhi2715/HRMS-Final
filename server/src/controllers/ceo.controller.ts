import { Request, Response } from 'express';
import Task from '../models/Task.model';
import User from '../models/User.model';
import Team from '../models/Team.model';
import AuditLog from '../models/AuditLog.model';
import { TaskStatus, UserRole } from '../../../shared/types/enums';

/**
 * CEO Controller
 *
 * Provides aggregated strategic data for the CEO dashboard.
 * All data comes from real MongoDB queries — zero fabricated stats.
 */

export const getCeoDashboard = async (req: Request, res: Response) => {
  try {
    // ── Organization Overview ───────────────────────────────────
    const [totalEmployees, activeEmployees, totalTeams, totalTasks] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Team.countDocuments({ isActive: true }),
      Task.countDocuments(),
    ]);

    // ── Task Overview (by status) ───────────────────────────────
    const taskStatusAgg = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const taskByStatus: Record<string, number> = {
      [TaskStatus.BACKLOG]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.REVIEW]: 0,
      [TaskStatus.COMPLETED]: 0,
    };
    for (const entry of taskStatusAgg) {
      taskByStatus[entry._id] = entry.count;
    }

    // Overdue tasks count
    const overdueCount = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: TaskStatus.COMPLETED },
    });

    // ── Team Comparison ─────────────────────────────────────────
    const teams = await Team.find({ isActive: true }).select('_id name').lean();

    const teamComparison = await Promise.all(
      teams.map(async (team) => {
        const teamTasks = await Task.aggregate([
          { $match: { team: team._id } },
          {
            $group: {
              _id: null,
              totalTasks: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', TaskStatus.COMPLETED] }, 1, 0] },
              },
              overdue: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $lt: ['$dueDate', new Date()] },
                        { $ne: ['$status', TaskStatus.COMPLETED] },
                        { $ne: ['$dueDate', null] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              avgProgress: { $avg: '$progress' },
            },
          },
        ]);

        const stats = teamTasks[0] || { totalTasks: 0, completed: 0, overdue: 0, avgProgress: 0 };

        return {
          teamId: team._id,
          teamName: team.name,
          totalTasks: stats.totalTasks,
          completed: stats.completed,
          overdue: stats.overdue,
          avgProgress: Math.round(stats.avgProgress || 0),
        };
      })
    );

    // ── Important Alerts ────────────────────────────────────────
    const alerts: string[] = [];

    if (overdueCount > 0) {
      alerts.push(`${overdueCount} task${overdueCount > 1 ? 's are' : ' is'} overdue`);
    }

    // Teams without managers
    const unmanagedTeams = await Team.countDocuments({ isActive: true, manager: { $exists: false } });
    const unmanagedTeamsNull = await Team.countDocuments({ isActive: true, manager: null });
    const totalUnmanaged = unmanagedTeams + unmanagedTeamsNull;
    if (totalUnmanaged > 0) {
      alerts.push(`${totalUnmanaged} team${totalUnmanaged > 1 ? 's have' : ' has'} no assigned manager`);
    }

    // Inactive users
    const inactiveCount = totalEmployees - activeEmployees;
    if (inactiveCount > 0) {
      alerts.push(`${inactiveCount} user account${inactiveCount > 1 ? 's are' : ' is'} deactivated`);
    }

    // High-priority unfinished tasks
    const urgentTasks = await Task.countDocuments({
      priority: 'urgent',
      status: { $ne: TaskStatus.COMPLETED },
    });
    if (urgentTasks > 0) {
      alerts.push(`${urgentTasks} urgent task${urgentTasks > 1 ? 's need' : ' needs'} attention`);
    }

    // ── Recent Activity ─────────────────────────────────────────
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(15)
      .populate('performedBy', 'firstName lastName')
      .populate('targetUser', 'firstName lastName')
      .populate('targetTeam', 'name')
      .lean();

    // ── Response ────────────────────────────────────────────────
    res.json({
      orgOverview: {
        totalEmployees,
        activeEmployees,
        totalTeams,
        totalTasks,
      },
      taskOverview: {
        total: totalTasks,
        byStatus: taskByStatus,
        overdue: overdueCount,
      },
      teamComparison,
      alerts,
      recentActivity,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching CEO dashboard', error: error.message });
  }
};
