import mongoose from 'mongoose';
import AuditLog, { AuditAction } from '../models/AuditLog.model';

export interface AuditLogOptions {
  action: AuditAction | string;
  performedBy: string | mongoose.Types.ObjectId;
  targetUser?: string | mongoose.Types.ObjectId | null;
  targetTeam?: string | mongoose.Types.ObjectId | null;
  targetTask?: string | mongoose.Types.ObjectId | null;
  details?: Record<string, any>;
}

export const logAudit = async (options: AuditLogOptions): Promise<void> => {
  try {
    await AuditLog.create({
      action: options.action,
      performedBy: options.performedBy,
      targetUser: options.targetUser,
      targetTeam: options.targetTeam,
      targetTask: options.targetTask,
      details: options.details,
    });
  } catch (error) {
    // In production, we'd want to use a robust logger like Pino or Winston.
    // We do not want an audit log failure to crash the main request flow, but it should be noted.
    console.error('Failed to write audit log:', error);
  }
};
