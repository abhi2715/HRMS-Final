import { Request } from 'express';
import mongoose from 'mongoose';
import AuditLog, { AuditAction } from '../models/AuditLog.model';

export interface AuditLogOptions {
  actor: string | mongoose.Types.ObjectId;
  action: AuditAction | string;
  entity: string;
  entityId?: string | mongoose.Types.ObjectId | null;
  metadata?: Record<string, any>;
}

export const logAudit = async (options: AuditLogOptions, req?: Request): Promise<void> => {
  try {
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (req) {
      ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      userAgent = req.get('User-Agent');
    }

    await AuditLog.create({
      actor: options.actor,
      action: options.action,
      entity: options.entity,
      entityId: options.entityId,
      metadata: options.metadata,
      ipAddress,
      userAgent
    });
  } catch (error) {
    // In production, we'd want to use a robust logger like Pino or Winston.
    // We do not want an audit log failure to crash the main request flow, but it should be noted.
    console.error('Failed to write audit log:', error);
  }
};
