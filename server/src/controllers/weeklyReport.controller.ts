import { Request, Response } from 'express';
import WeeklyReport from '../models/WeeklyReport.model';
import Task from '../models/Task.model';
import AuditLog from '../models/AuditLog.model';
import { sendSuccess, sendError } from '../utils/response';
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

    // Get all tasks for this team that were either:
    // 1. Created before the end date and not completed yet (pending)
    // 2. Completed within this week's date range
    // 3. Due before the end date but not completed (overdue)
    
    // For simplicity, we just pull all tasks for the team and calculate locally. 
    // In production with millions of tasks, use aggregation pipeline.
    const tasks = await Task.find({ team: teamObjectId });

    let tasksCompleted = 0;
    let tasksPending = 0;
    let overdueTasks = 0;

    tasks.forEach(task => {
      // Check if task was completed within the week
      if (task.status === 'completed' && task.completedAt) {
        if (task.completedAt >= start && task.completedAt <= end) {
          tasksCompleted++;
        }
      } else {
        // Task is pending
        // Is it relevant to this week? E.g., created before week end
        if (task.createdAt <= end) {
          tasksPending++;
          // Is it overdue relative to the week's end?
          if (task.dueDate && task.dueDate < end) {
            overdueTasks++;
          }
        }
      }
    });

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
      action: 'WEEKLY_REPORT_CREATED',
      actor: teamLeadId,
      target: newReport._id,
      targetModel: 'WeeklyReport',
      details: `Submitted weekly report for team ${teamId}`,
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
      action: 'WEEKLY_REPORT_UPDATED',
      actor: userId,
      target: report._id,
      targetModel: 'WeeklyReport',
      details: `Updated weekly report ID: ${id}`,
    });

    sendSuccess(res, { report }, 'Weekly report updated', 200);
  } catch (error) {
    sendError(res, 'Error updating weekly report', 500);
  }
};

export const getTeamReports = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const reports = await WeeklyReport.find({ team: teamId })
      .populate('teamLead', 'firstName lastName')
      .sort({ weekStartDate: -1 });

    sendSuccess(res, { reports }, 'Team reports retrieved', 200);
  } catch (error) {
    sendError(res, 'Error retrieving team reports', 500);
  }
};

export const getAllReports = async (req: Request, res: Response) => {
  try {
    const reports = await WeeklyReport.find()
      .populate('team', 'name')
      .populate('teamLead', 'firstName lastName')
      .sort({ weekStartDate: -1 });

    sendSuccess(res, { reports }, 'All reports retrieved', 200);
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
