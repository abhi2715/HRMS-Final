import { Request, Response } from 'express';
import User from '../models/User.model';
import Task from '../models/Task.model';
import Leave from '../models/Leave.model';
import Attendance from '../models/Attendance.model';
import AuditLog from '../models/AuditLog.model';
import { TaskStatus, LeaveStatus } from '../../../shared/types/enums';

/**
 * Team Lead Controller
 *
 * Provides aggregated operational data for the Team Lead dashboard,
 * strictly scoped to the Team Lead's own team.
 */

export const getTeamLeadDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Retrieve the Team Lead's user record to find their team
    const teamLead = await User.findById(userId).populate('team', 'name');
    if (!teamLead || !teamLead.team) {
      return res.status(400).json({ message: 'User is not assigned to a team' });
    }
    const teamId = (teamLead.team as any)._id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // ── Team Overview ───────────────────────────────────────────
    const [
      totalMembers,
      activeMembers,
      pendingLeaves,
      todayAttendance,
    ] = await Promise.all([
      User.countDocuments({ team: teamId }),
      User.countDocuments({ team: teamId, isActive: true }),
      Task.countDocuments({ team: teamId, dueDate: { $lt: new Date() }, status: { $ne: TaskStatus.COMPLETED } }),
      Attendance.countDocuments({ team: teamId, date: { $gte: startOfDay, $lte: endOfDay } }),
    ]);

    // ── Task Overview ───────────────────────────────────────────
    // Tasks assigned to employees in the team
    const teamTasks = await Task.aggregate([
      { $match: { team: teamId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
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

    const taskStats = teamTasks[0] || { total: 0, completed: 0, overdue: 0, avgProgress: 0 };

    // Breakdown by status
    const taskStatusAgg = await Task.aggregate([
      { $match: { team: teamId } },
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

    // CEO Assigned Tasks (Tasks assigned directly to the Team Lead)
    const ceoTasks = await Task.countDocuments({ assignedTo: userId });
    const completedCeoTasks = await Task.countDocuments({ assignedTo: userId, dueDate: { $lt: new Date() }, status: { $ne: TaskStatus.COMPLETED } });

    // ── Recent Activity ─────────────────────────────────────────
    const recentActivity = await AuditLog.find({ targetTeam: teamId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('performedBy', 'firstName lastName')
      .populate('targetUser', 'firstName lastName')
      .populate('targetTask', 'title')
      .lean();

    res.json({
      teamOverview: {
        name: (teamLead.team as any).name,
        totalMembers,
        activeMembers,
        pendingLeaves,
        todayAttendance,
      },
      taskOverview: {
        total: taskStats.total,
        completed: taskStats.completed,
        overdue: taskStats.overdue,
        avgProgress: Math.round(taskStats.avgProgress || 0),
        byStatus: taskByStatus,
      },
      ceoTasks: {
        total: ceoTasks,
        completed: completedCeoTasks,
      },
      recentActivity,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching team lead dashboard', error: error.message });
  }
};

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const teamLead = await User.findById(userId);
    if (!teamLead || !teamLead.team) {
      return res.status(400).json({ message: 'User is not assigned to a team' });
    }
    const teamId = teamLead.team;

    const members = await User.find({ team: teamId, isActive: true })
      .select('-password -refreshTokens')
      .sort({ firstName: 1 });

    // Enhance members with basic stats (optional, for the team members page)
    const enhancedMembers = await Promise.all(
      members.map(async (member) => {
        const activeTasks = await Task.countDocuments({
          assignedTo: member._id,
          status: { $ne: TaskStatus.COMPLETED },
        });
        
        return {
          ...member.toJSON(),
          activeTasks,
        };
      })
    );

    res.json(enhancedMembers);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching team members', error: error.message });
  }
};
