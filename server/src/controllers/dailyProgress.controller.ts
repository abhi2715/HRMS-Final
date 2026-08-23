import { Request, Response } from 'express';
import mongoose from 'mongoose';
import DailyProgress from '../models/DailyProgress.model';
import User from '../models/User.model';
import AuditLog, { AuditAction } from '../models/AuditLog.model';
import { DailyProgressStatus, UserRole } from '../../../shared/types/enums';

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

const enforceLazyLocking = async (record: any) => {
  if (record && record.status !== DailyProgressStatus.LOCKED) {
    const now = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2);
    twoDaysAgo.setHours(0, 0, 0, 0);
    
    if (new Date(record.date) < twoDaysAgo) {
      record.status = DailyProgressStatus.LOCKED;
      record.lockedAt = now;
      await record.save();
    }
  }
  return record;
};

export const submitDailyProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { date, tasksWorkedOn, workCompleted, progress, blockers, notes, attachments, status } = req.body;
    
    const targetDate = new Date(date);
    const { startOfDay, endOfDay } = getStartAndEndOfDay(targetDate);
    const now = new Date();

    if (targetDate > now) {
      return res.status(400).json({ message: 'Cannot submit progress for a future date' });
    }

    const user = await User.findById(userId);

    let record = await DailyProgress.findOne({ employee: userId, date: { $gte: startOfDay, $lte: endOfDay } });
    await enforceLazyLocking(record);

    if (record && record.status === DailyProgressStatus.LOCKED) {
      return res.status(403).json({ message: 'This record is locked and cannot be edited' });
    }

    const isNew = !record;

    if (!record) {
      record = new DailyProgress({
        employee: userId,
        team: user?.team,
        date: targetDate,
      });
    }

    if (tasksWorkedOn) record.tasksWorkedOn = tasksWorkedOn;
    if (workCompleted !== undefined) record.workCompleted = workCompleted;
    if (progress !== undefined) record.progress = progress;
    if (blockers !== undefined) record.blockers = blockers;
    if (notes !== undefined) record.notes = notes;
    if (attachments) record.attachments = attachments;
    
    record.lastEditedAt = now;

    if (status === DailyProgressStatus.SUBMITTED && record.status !== DailyProgressStatus.SUBMITTED) {
      record.status = DailyProgressStatus.SUBMITTED;
      record.submittedAt = now;
    }

    await record.save();

    if (record.status === DailyProgressStatus.SUBMITTED) {
      await AuditLog.create({
        action: isNew ? AuditAction.DAILY_PROGRESS_SUBMITTED : AuditAction.DAILY_PROGRESS_UPDATED,
        actor: userId,
        targetUser: userId,
        targetTeam: record.team,
        entity: 'DailyProgress',
      entityId: record._id,
        details: { date: targetDate, status: record.status },
      });
    }

    res.json(record);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A progress report for this date already exists.' });
    }
    res.status(500).json({ message: 'Error submitting daily progress', error: error.message });
  }
};

export const getMyDailyProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { month, year, startDate, endDate, search } = req.query;

    const query: any = { employee: userId };

    if (month && year) {
      const { startDate: sd, endDate: ed } = getStartAndEndOfMonth(parseInt(month as string), parseInt(year as string));
      query.date = { $gte: sd, $lte: ed };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    
    if (search) {
      const regex = new RegExp(search as string, 'i');
      query.$or = [
        { workCompleted: regex },
        { progress: regex },
        { blockers: regex },
        { notes: regex },
      ];
    }

    const records = await DailyProgress.find(query)
      .populate('tasksWorkedOn', 'title')
      .sort({ date: -1 })
      .limit(100);

    for (let record of records) {
      await enforceLazyLocking(record);
    }

    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching daily progress', error: error.message });
  }
};

export const getTodayProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startOfDay, endOfDay } = getStartAndEndOfDay();

    let record = await DailyProgress.findOne({ employee: userId, date: { $gte: startOfDay, $lte: endOfDay } })
      .populate('tasksWorkedOn', 'title');
      
    record = await enforceLazyLocking(record);

    res.json(record || null);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching today progress', error: error.message });
  }
};

export const getTeamProgress = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { startDate, endDate, search } = req.query;

    if (req.user!.role === UserRole.TEAM_LEAD) {
      const teamLead = await User.findById(req.user!.id);
      if (String(teamLead?.team) !== teamId) {
        return res.status(403).json({ message: 'Unauthorized to view this team\'s progress' });
      }
    }

    const query: any = { team: teamId };

    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      };
    }

    if (search) {
      const regex = new RegExp(search as string, 'i');
      query.$or = [
        { workCompleted: regex },
        { progress: regex },
        { blockers: regex },
      ];
    }

    const records = await DailyProgress.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('tasksWorkedOn', 'title')
      .sort({ date: -1 })
      .limit(100);
      
    for (let record of records) {
      await enforceLazyLocking(record);
    }

    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching team progress', error: error.message });
  }
};

export const getTeamMissed = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { date } = req.query;
    
    if (!date) return res.status(400).json({ message: 'Date is required' });

    if (req.user!.role === UserRole.TEAM_LEAD) {
      const teamLead = await User.findById(req.user!.id);
      if (String(teamLead?.team) !== teamId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    const targetDate = new Date(date as string);
    const { startOfDay, endOfDay } = getStartAndEndOfDay(targetDate);

    // Get all employees in the team
    const teamMembers = await User.find({ team: teamId, isActive: true }, '_id firstName lastName email');
    
    // Get all submissions for that date
    const submissions = await DailyProgress.find({ 
      team: teamId, 
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [DailyProgressStatus.SUBMITTED, DailyProgressStatus.LOCKED] }
    }, 'employee');
    
    const submittedIds = new Set(submissions.map(s => String(s.employee)));
    const missed = teamMembers.filter(m => !submittedIds.has(String(m._id)));

    res.json(missed);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching missed updates', error: error.message });
  }
};

export const getTeamBlocked = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { startDate, endDate } = req.query;

    if (req.user!.role === UserRole.TEAM_LEAD) {
      const teamLead = await User.findById(req.user!.id);
      if (String(teamLead?.team) !== teamId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    const query: any = { 
      team: teamId,
      blockers: { $exists: true, $ne: '' }
    };

    if (startDate && endDate) {
      query.date = { 
        $gte: new Date(startDate as string), 
        $lte: new Date(endDate as string) 
      };
    }

    const records = await DailyProgress.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('tasksWorkedOn', 'title')
      .sort({ date: -1 })
      .limit(100);

    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching blocked updates', error: error.message });
  }
};

export const getOrganizationProgress = async (req: Request, res: Response) => {
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

    const records = await DailyProgress.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('team', 'name')
      .populate('tasksWorkedOn', 'title')
      .sort({ date: -1 })
      .limit(100);

    res.json(records);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching org progress', error: error.message });
  }
};

export const getOrganizationSummary = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();
    const { startOfDay, endOfDay } = getStartAndEndOfDay(targetDate);

    // Get total active employees
    const totalEmployees = await User.countDocuments({ isActive: true });
    
    const records = await DailyProgress.find({ 
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [DailyProgressStatus.SUBMITTED, DailyProgressStatus.LOCKED] }
    });

    const submittedCount = records.length;
    const blockedCount = records.filter(r => r.blockers && r.blockers.trim() !== '').length;

    // Team breakdown
    const teamAggregation = await DailyProgress.aggregate([
      { $match: { date: { $gte: startOfDay, $lte: endOfDay }, status: { $in: [DailyProgressStatus.SUBMITTED, DailyProgressStatus.LOCKED] } } },
      { $group: { _id: '$team', count: { $sum: 1 }, blocked: { $sum: { $cond: [{ $ne: ['$blockers', ''] }, 1, 0] } } } }
    ]);
    
    // Need team details
    const TeamModel = mongoose.model('Team');
    const teamStats = await Promise.all(teamAggregation.map(async (stat) => {
      if (!stat._id) return null;
      const team = await TeamModel.findById(stat._id, 'name');
      const teamMembersCount = await User.countDocuments({ team: stat._id, isActive: true });
      return {
        teamId: stat._id,
        teamName: team?.name || 'Unknown',
        submitted: stat.count,
        total: teamMembersCount,
        rate: teamMembersCount > 0 ? (stat.count / teamMembersCount) * 100 : 0,
        blocked: stat.blocked,
      };
    }));

    res.json({
      totalEmployees,
      submittedCount,
      missedCount: totalEmployees - submittedCount,
      blockedCount,
      rate: totalEmployees > 0 ? (submittedCount / totalEmployees) * 100 : 0,
      teamStats: teamStats.filter(Boolean),
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching org summary', error: error.message });
  }
};

export const lockProgress = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const record = await DailyProgress.findById(id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    if (req.user!.role === UserRole.TEAM_LEAD) {
      const teamLead = await User.findById(userId);
      if (String(teamLead?.team) !== String(record.team)) {
        return res.status(403).json({ message: 'Unauthorized to lock this record' });
      }
    }

    record.status = DailyProgressStatus.LOCKED;
    record.lockedAt = new Date();
    record.lockedBy = new mongoose.Types.ObjectId(userId);
    
    await record.save();

    await AuditLog.create({
      action: 'DAILY_PROGRESS_LOCKED',
      actor: userId,
      targetUser: record.employee,
      targetTeam: record.team,
      entity: 'DailyProgress',
      entityId: record._id,
      details: { lockedAt: record.lockedAt },
    });

    res.json(record);
  } catch (error: any) {
    res.status(500).json({ message: 'Error locking progress', error: error.message });
  }
};
