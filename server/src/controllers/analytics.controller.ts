import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.model';
import Team from '../models/Team.model';
import Task from '../models/Task.model';
import Attendance from '../models/Attendance.model';
import LeaveRequest from '../models/Leave.model';
import { sendSuccess, sendError } from '../utils/response';
import { TaskStatus, AttendanceStatus } from '../../../shared/types/enums';

// Helper to parse dates with defaults
const parseDateRange = (startDate?: unknown, endDate?: unknown) => {
  const end = endDate ? new Date(endDate as string) : new Date();
  const start = startDate ? new Date(startDate as string) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // Default: Last 30 days
  return { start, end };
};

export const getOrganizationAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);

    // 1. Employee and Team basic counts
    const activeEmployees = await User.countDocuments({ isActive: true });
    const totalTeams = await Team.countDocuments({ isActive: true });

    // 2. Task Aggregation
    const taskStats = await Task.aggregate([
      {
        $match: {
          $or: [
            { completedAt: { $gte: start, $lte: end } },
            { createdAt: { $lte: end }, status: { $ne: TaskStatus.COMPLETED } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalActive: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$status', TaskStatus.COMPLETED] }, { $gte: ['$completedAt', start] }, { $lte: ['$completedAt', end] }] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $ne: ['$status', TaskStatus.COMPLETED] }, 1, 0]
            }
          },
          overdue: {
            $sum: {
              $cond: [{ $and: [{ $ne: ['$status', TaskStatus.COMPLETED] }, { $lt: ['$dueDate', end] }] }, 1, 0]
            }
          }
        }
      }
    ]);

    // 3. Attendance Aggregation
    const attendanceStats = await Attendance.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 4. Leave Aggregation
    const leaveStats = await LeaveRequest.aggregate([
      { 
        $match: { 
          status: 'approved',
          startDate: { $lte: end },
          endDate: { $gte: start }
        } 
      },
      {
        $group: {
          _id: '$leaveType',
          totalDays: { $sum: '$days' }
        }
      }
    ]);

    const tasks = taskStats[0] || { totalActive: 0, completed: 0, pending: 0, overdue: 0 };
    const completionRate = tasks.totalActive > 0 ? Math.round((tasks.completed / tasks.totalActive) * 100) : 0;

    sendSuccess(res, {
      employees: { active: activeEmployees },
      teams: { total: totalTeams },
      tasks: { ...tasks, completionRate },
      attendance: attendanceStats,
      leaves: leaveStats
    }, 'Organization analytics retrieved', 200);

  } catch (error) {
    console.error('getOrganizationAnalytics error:', error);
    sendError(res, 'Error retrieving organization analytics', 500);
  }
};

export const getTeamAnalytics = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { startDate, endDate } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);
    const teamObjId = new mongoose.Types.ObjectId(teamId as string);

    // 1. Team Task Aggregation
    const taskStats = await Task.aggregate([
      {
        $match: {
          team: teamObjId,
          $or: [
            { completedAt: { $gte: start, $lte: end } },
            { createdAt: { $lte: end }, status: { $ne: TaskStatus.COMPLETED } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalActive: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $and: [{ $eq: ['$status', TaskStatus.COMPLETED] }, { $gte: ['$completedAt', start] }, { $lte: ['$completedAt', end] }] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $ne: ['$status', TaskStatus.COMPLETED] }, 1, 0] }
          },
          overdue: {
            $sum: { $cond: [{ $and: [{ $ne: ['$status', TaskStatus.COMPLETED] }, { $lt: ['$dueDate', end] }] }, 1, 0] }
          }
        }
      }
    ]);

    // 2. Member Contribution (tasks completed by member in this period)
    const memberContribution = await Task.aggregate([
      {
        $match: {
          team: teamObjId,
          status: TaskStatus.COMPLETED,
          completedAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          completedCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          completedCount: 1
        }
      },
      { $sort: { completedCount: -1 } }
    ]);

    const tasks = taskStats[0] || { totalActive: 0, completed: 0, pending: 0, overdue: 0 };
    const completionRate = tasks.totalActive > 0 ? Math.round((tasks.completed / tasks.totalActive) * 100) : 0;

    sendSuccess(res, {
      tasks: { ...tasks, completionRate },
      memberContribution
    }, 'Team analytics retrieved', 200);

  } catch (error) {
    console.error('getTeamAnalytics error:', error);
    sendError(res, 'Error retrieving team analytics', 500);
  }
};

export const getEmployeeAnalytics = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);
    const empObjId = new mongoose.Types.ObjectId(employeeId as string);

    // 1. Employee Task Aggregation
    const taskStats = await Task.aggregate([
      {
        $match: {
          assignedTo: empObjId,
          $or: [
            { completedAt: { $gte: start, $lte: end } },
            { createdAt: { $lte: end }, status: { $ne: TaskStatus.COMPLETED } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalAssigned: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $and: [{ $eq: ['$status', TaskStatus.COMPLETED] }, { $gte: ['$completedAt', start] }, { $lte: ['$completedAt', end] }] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $ne: ['$status', TaskStatus.COMPLETED] }, 1, 0] }
          },
          overdue: {
            $sum: { $cond: [{ $and: [{ $ne: ['$status', TaskStatus.COMPLETED] }, { $lt: ['$dueDate', end] }] }, 1, 0] }
          },
          // Average Turnaround time (completedAt - createdAt) for completed tasks
          avgTurnaroundMs: {
            $avg: {
              $cond: [
                { $and: [{ $eq: ['$status', TaskStatus.COMPLETED] }, { $gte: ['$completedAt', start] }, { $lte: ['$completedAt', end] }] },
                { $subtract: ['$completedAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      }
    ]);

    // 2. Attendance
    const attendanceStats = await Attendance.aggregate([
      { $match: { employee: empObjId, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const tasks = taskStats[0] || { totalAssigned: 0, completed: 0, pending: 0, overdue: 0, avgTurnaroundMs: null };
    const completionRate = tasks.totalAssigned > 0 ? Math.round((tasks.completed / tasks.totalAssigned) * 100) : 0;
    
    // Convert avgTurnaroundMs to Days
    const avgTurnaroundDays = tasks.avgTurnaroundMs ? (tasks.avgTurnaroundMs / (1000 * 60 * 60 * 24)).toFixed(1) : null;

    sendSuccess(res, {
      tasks: { ...tasks, completionRate, avgTurnaroundDays },
      attendance: attendanceStats
    }, 'Employee analytics retrieved', 200);

  } catch (error) {
    console.error('getEmployeeAnalytics error:', error);
    sendError(res, 'Error retrieving employee analytics', 500);
  }
};
