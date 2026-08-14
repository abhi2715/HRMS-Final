import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Attendance from '../models/Attendance.model';
import User from '../models/User.model';
import AuditLog, { AuditAction } from '../models/AuditLog.model';
import { AttendanceStatus, UserRole } from '../../../shared/types/enums';

// Helpers
const getStartAndEndOfDay = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return { startOfDay, endOfDay };
};

const getStartAndEndOfMonth = (month: number, year: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

export const checkIn = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startOfDay, endOfDay } = getStartAndEndOfDay();
    const user = await User.findById(userId);

    let attendance = await Attendance.findOne({ user: userId, date: { $gte: startOfDay, $lte: endOfDay } });

    if (attendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    const now = new Date();
    attendance = await Attendance.create({
      user: userId,
      team: user?.team || undefined,
      date: now,
      status: AttendanceStatus.PRESENT,
      checkIn: now,
    });

    await AuditLog.create({
      action: AuditAction.ATTENDANCE_CHECKIN,
      performedBy: userId,
      targetUser: userId,
      targetTeam: user?.team,
      targetAttendance: attendance._id,
      details: { checkIn: now },
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: 'Error checking in', error: error.message });
  }
};

export const checkOut = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startOfDay, endOfDay } = getStartAndEndOfDay();

    const attendance = await Attendance.findOne({ user: userId, date: { $gte: startOfDay, $lte: endOfDay } });

    if (!attendance) {
      return res.status(400).json({ message: 'Not checked in today' });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    const now = new Date();
    attendance.checkOut = now;
    
    // Calculate duration in minutes
    if (attendance.checkIn) {
      const diffMs = now.getTime() - attendance.checkIn.getTime();
      attendance.duration = Math.floor(diffMs / 60000);
    }
    
    await attendance.save();

    await AuditLog.create({
      action: AuditAction.ATTENDANCE_CHECKOUT,
      performedBy: userId,
      targetUser: userId,
      targetTeam: attendance.team,
      targetAttendance: attendance._id,
      details: { checkOut: now, duration: attendance.duration },
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: 'Error checking out', error: error.message });
  }
};

export const getMyAttendanceHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { month, year } = req.query;

    const query: any = { user: userId };

    if (month && year) {
      const { startDate, endDate } = getStartAndEndOfMonth(parseInt(month as string), parseInt(year as string));
      query.date = { $gte: startDate, $lte: endDate };
    }

    const history = await Attendance.find(query).sort({ date: -1 }).lean();
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching attendance history', error: error.message });
  }
};

export const getTodayAttendance = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startOfDay, endOfDay } = getStartAndEndOfDay();

    const attendance = await Attendance.findOne({ user: userId, date: { $gte: startOfDay, $lte: endOfDay } });
    res.json(attendance || null);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching today attendance', error: error.message });
  }
};

export const getTeamAttendance = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate teamLead is requesting for their own team unless Admin/CEO
    if (req.user!.role === UserRole.TEAM_LEAD) {
      const teamLead = await User.findById(req.user!.id);
      if (String(teamLead?.team) !== teamId) {
        return res.status(403).json({ message: 'Unauthorized to view this team\'s attendance' });
      }
    }

    const query: any = { team: teamId };
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      };
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'firstName lastName email jobTitle')
      .sort({ date: -1, 'user.firstName': 1 })
      .lean();
      
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching team attendance', error: error.message });
  }
};

export const getOrganizationAttendance = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, teamId } = req.query;
    const query: any = {};
    
    if (teamId) {
      query.team = teamId;
    }
    
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      };
    }

    const attendance = await Attendance.find(query)
      .populate('user', 'firstName lastName email jobTitle')
      .populate('team', 'name')
      .sort({ date: -1 })
      .lean();
      
    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching organization attendance', error: error.message });
  }
};

export const getAttendanceSummary = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query: any = {};
    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      };
    }

    const agg = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary: Record<string, number> = {
      [AttendanceStatus.PRESENT]: 0,
      [AttendanceStatus.ABSENT]: 0,
      [AttendanceStatus.HALF_DAY]: 0,
      [AttendanceStatus.ON_LEAVE]: 0,
      [AttendanceStatus.HOLIDAY]: 0,
      [AttendanceStatus.WEEKLY_OFF]: 0,
    };

    agg.forEach(item => {
      if (item._id in summary) {
        summary[item._id] = item.count;
      }
    });

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching attendance summary', error: error.message });
  }
};

export const getAttendanceTrends = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const agg = await Attendance.aggregate([
      { 
        $match: { 
          date: { $gte: startDate, $lte: endDate } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          total: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ['$status', AttendanceStatus.PRESENT] }, 1, 0] }
          },
          halfDay: {
            $sum: { $cond: [{ $eq: ['$status', AttendanceStatus.HALF_DAY] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const trends = agg.map(item => {
      const date = new Date(item._id.year, item._id.month - 1, item._id.day);
      return {
        date: date.toISOString(),
        present: item.present,
        halfDay: item.halfDay,
        total: item.total,
        rate: item.total > 0 ? ((item.present + (item.halfDay * 0.5)) / item.total) * 100 : 0
      };
    });

    res.json(trends);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching attendance trends', error: error.message });
  }
};

export const correctAttendance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, status, notes, correctionReason } = req.body;
    const userId = req.user!.id;

    if (!correctionReason) {
      return res.status(400).json({ message: 'Correction reason is required' });
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Check permissions
    if (req.user!.role === UserRole.TEAM_LEAD) {
      const teamLead = await User.findById(userId);
      if (String(teamLead?.team) !== String(attendance.team)) {
        return res.status(403).json({ message: 'Unauthorized to correct this record' });
      }
    }

    // Snapshot
    const originalValues = {
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      status: attendance.status,
      duration: attendance.duration,
      notes: attendance.notes,
    };

    // Apply updates
    if (checkIn !== undefined) attendance.checkIn = checkIn ? new Date(checkIn) : undefined;
    if (checkOut !== undefined) attendance.checkOut = checkOut ? new Date(checkOut) : undefined;
    if (status !== undefined) attendance.status = status;
    if (notes !== undefined) attendance.notes = notes;

    // Recalculate duration
    if (attendance.checkIn && attendance.checkOut) {
      if (attendance.checkOut < attendance.checkIn) {
        return res.status(400).json({ message: 'Check-out cannot be before check-in' });
      }
      const diffMs = attendance.checkOut.getTime() - attendance.checkIn.getTime();
      attendance.duration = Math.floor(diffMs / 60000);
    } else {
      attendance.duration = undefined;
    }

    attendance.correctedBy = new mongoose.Types.ObjectId(userId);
    attendance.correctionReason = correctionReason;
    attendance.correctionTimestamp = new Date();
    attendance.originalValues = attendance.originalValues || originalValues; // keep very first if already corrected

    await attendance.save();

    await AuditLog.create({
      action: AuditAction.ATTENDANCE_CORRECTED,
      performedBy: userId,
      targetUser: attendance.user,
      targetTeam: attendance.team,
      targetAttendance: attendance._id,
      details: {
        reason: correctionReason,
        changes: { from: originalValues, to: { checkIn: attendance.checkIn, checkOut: attendance.checkOut, status: attendance.status, duration: attendance.duration, notes: attendance.notes } }
      },
    });

    res.json(attendance);
  } catch (error: any) {
    res.status(500).json({ message: 'Error correcting attendance', error: error.message });
  }
};
