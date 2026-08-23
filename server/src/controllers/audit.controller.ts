import { Request, Response } from 'express';
import AuditLog from '../models/AuditLog.model';
import { sendSuccess, sendError } from '../utils/response';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const { action, entity, startDate, endDate } = req.query;

    const filter: any = {};
    if (action) filter.action = action;
    if (entity) filter.entity = entity;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('actor', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(filter),
    ]);

    sendSuccess(res, {
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }, 'Audit logs retrieved', 200);
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    sendError(res, 'Error fetching audit logs', 500);
  }
};
