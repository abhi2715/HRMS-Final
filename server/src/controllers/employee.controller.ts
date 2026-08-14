import { Request, Response } from 'express';
import User from '../models/User.model';
import Task from '../models/Task.model';
import Attendance from '../models/Attendance.model';
import Leave from '../models/Leave.model';
import { TaskStatus, LeaveStatus } from '../../../shared/types/enums';

export const getEmployeeDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      activeTasks,
      overdueTasks,
      todayAttendance,
      pendingLeaves
    ] = await Promise.all([
      Task.countDocuments({ assignedTo: userId, status: { $ne: TaskStatus.COMPLETED } }),
      Task.countDocuments({ 
        assignedTo: userId, 
        status: { $ne: TaskStatus.COMPLETED }, 
        dueDate: { $lt: new Date() } 
      }),
      Attendance.findOne({ user: userId, date: { $gte: startOfDay, $lte: endOfDay } }),
      Leave.countDocuments({ user: userId, status: LeaveStatus.PENDING })
    ]);

    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('createdBy', 'firstName lastName')
      .lean();

    res.json({
      overview: {
        activeTasks,
        overdueTasks,
        todayAttendanceStatus: todayAttendance?.status || 'Not Checked In',
        pendingLeaves,
      },
      recentTasks
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching employee dashboard', error: error.message });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    // Select +salary to allow employee to see their own salary
    const user = await User.findById(req.user!.id)
      .select('+salary')
      .populate('team', 'name')
      .lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let teamLead = null;
    if (user.team) {
      teamLead = await User.findOne({ team: user.team, role: 'team_lead' })
        .select('firstName lastName email')
        .lean();
    }

    res.json({
      ...user,
      teamLead
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};
