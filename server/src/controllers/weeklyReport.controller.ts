import { Request, Response } from 'express';
import WeeklyReport from '../models/WeeklyReport.model';
import Task from '../models/Task.model';
import AuditLog from '../models/AuditLog.model';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../services/audit.service';
import { AuditAction } from '../models/AuditLog.model';
import mongoose from 'mongoose';

export const getReportMetrics = async (req: Request, res: Response) => {
  try {
    const { teamId, startDate, endDate } = req.query;

    if (!teamId || !startDate || !endDate) {
      return sendError(res, 'Missing required parameters: teamId, startDate, endDate', 400);
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const teamObjectId = new mongoose.Types.ObjectId(teamId as string);

    // Use MongoDB aggregation pipeline for performance
    const taskStats = await Task.aggregate([
      {
        $match: {
          team: teamObjectId,
          $or: [
            { completedAt: { $gte: start, $lte: end } },
            { createdAt: { $lte: end }, status: { $ne: 'completed' } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          tasksCompleted: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$status', 'completed'] }, { $gte: ['$completedAt', start] }, { $lte: ['$completedAt', end] }] }, 1, 0]
            }
          },
          tasksPending: {
            $sum: {
              $cond: [{ $and: [{ $ne: ['$status', 'completed'] }, { $lte: ['$createdAt', end] }] }, 1, 0]
            }
          },
          overdueTasks: {
            $sum: {
              $cond: [{ $and: [{ $ne: ['$status', 'completed'] }, { $lte: ['$createdAt', end] }, { $lt: ['$dueDate', end] }] }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = taskStats[0] || { tasksCompleted: 0, tasksPending: 0, overdueTasks: 0 };
    const { tasksCompleted, tasksPending, overdueTasks } = stats;

    const totalActive = tasksCompleted + tasksPending;
    const completionRate = totalActive > 0 ? Math.round((tasksCompleted / totalActive) * 100) : 0;

    const metrics = {
      tasksCompleted,
      tasksPending,
      overdueTasks,
      completionRate,
    };

    sendSuccess(res, { metrics }, 'Metrics calculated', 200);
  } catch (error) {
    console.error('Error calculating metrics:', error);
    sendError(res, 'Error calculating metrics', 500);
  }
};

export const createWeeklyReport = async (req: Request, res: Response) => {
  try {
    const { 
      teamId, weekStartDate, weekEndDate, 
      achievements, completedWork, incompleteWork, 
      blockers, employeeContributions, goals, 
      missedGoals, nextWeekPriorities, risks, notes, metrics 
    } = req.body;

    const teamLeadId = req.user?.id;

    if (!teamId || !weekStartDate || !weekEndDate || !metrics) {
      return sendError(res, 'Missing required fields', 400);
    }

    const newReport = new WeeklyReport({
      team: teamId,
      teamLead: teamLeadId,
      weekStartDate: new Date(weekStartDate),
      weekEndDate: new Date(weekEndDate),
      achievements,
      completedWork,
      incompleteWork,
      blockers,
      employeeContributions,
      goals,
      missedGoals,
      nextWeekPriorities,
      risks,
      notes,
      metrics,
    });

    await newReport.save();

    await AuditLog.create({
      action: AuditAction.REPORT_SUBMITTED,
      actor: teamLeadId,
      entity: 'WeeklyReport',
      entityId: newReport._id,
      metadata: { details: `Submitted weekly report for team ${teamId}` },
    });

    sendSuccess(res, { report: newReport }, 'Weekly report submitted', 201);
  } catch (error: any) {
    if (error.code === 11000) {
      return sendError(res, 'A report for this team and date range already exists', 400);
    }
    console.error('createWeeklyReport error:', error);
    sendError(res, 'Error creating weekly report', 500);
  }
};

export const updateWeeklyReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id;

    const report = await WeeklyReport.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!report) {
      return sendError(res, 'Weekly report not found', 404);
    }

    await AuditLog.create({
      action: AuditAction.REPORT_MODIFIED,
      actor: userId,
      entity: 'WeeklyReport',
      entityId: report._id,
      metadata: { details: `Updated weekly report ID: ${id}` },
    });

    sendSuccess(res, { report }, 'Weekly report updated', 200);
  } catch (error) {
    sendError(res, 'Error updating weekly report', 500);
  }
};

export const getTeamReports = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      WeeklyReport.find({ team: teamId })
        .populate('teamLead', 'firstName lastName')
        .sort({ weekStartDate: -1 })
        .skip(skip)
        .limit(limit),
      WeeklyReport.countDocuments({ team: teamId })
    ]);

    sendSuccess(res, { 
      reports,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    }, 'Team reports retrieved', 200);
  } catch (error) {
    sendError(res, 'Error retrieving team reports', 500);
  }
};

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      WeeklyReport.find()
        .populate('team', 'name')
        .populate('teamLead', 'firstName lastName')
        .sort({ weekStartDate: -1 })
        .skip(skip)
        .limit(limit),
      WeeklyReport.countDocuments()
    ]);

    sendSuccess(res, { 
      reports,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    }, 'All reports retrieved', 200);
  } catch (error) {
    sendError(res, 'Error retrieving all reports', 500);
  }
};

export const getWeeklyReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await WeeklyReport.findById(id)
      .populate('team', 'name')
      .populate('teamLead', 'firstName lastName email');

    if (!report) {
      return sendError(res, 'Weekly report not found', 404);
    }

    sendSuccess(res, { report }, 'Weekly report retrieved', 200);
  } catch (error) {
    sendError(res, 'Error retrieving weekly report', 500);
  }
};
