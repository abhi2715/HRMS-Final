import mongoose, { Document, Schema, Model } from 'mongoose';

export enum AuditAction {
  // Auth actions
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SECURITY_EVENT = 'SECURITY_EVENT',
  
  // User actions
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  
  // Team actions
  TEAM_CREATED = 'TEAM_CREATED',
  TEAM_UPDATED = 'TEAM_UPDATED',
  TEAM_DEACTIVATED = 'TEAM_DEACTIVATED',
  TEAM_ACTIVATED = 'TEAM_ACTIVATED',
  TEAM_LEAD_ASSIGNED = 'TEAM_LEAD_ASSIGNED',
  TEAM_LEAD_REMOVED = 'TEAM_LEAD_REMOVED',
  EMPLOYEE_ASSIGNED_TO_TEAM = 'EMPLOYEE_ASSIGNED_TO_TEAM',
  EMPLOYEE_REMOVED_FROM_TEAM = 'EMPLOYEE_REMOVED_FROM_TEAM',
  
  // Task actions
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  TASK_REASSIGNED = 'TASK_REASSIGNED',
  TASK_DELETED = 'TASK_DELETED',
  
  // Attendance actions
  ATTENDANCE_CHECKIN = 'ATTENDANCE_CHECKIN',
  ATTENDANCE_CHECKOUT = 'ATTENDANCE_CHECKOUT',
  ATTENDANCE_CORRECTED = 'ATTENDANCE_CORRECTED',
  ATTENDANCE_STATUS_CHANGED = 'ATTENDANCE_STATUS_CHANGED',
  
  // Daily progress actions
  DAILY_PROGRESS_SUBMITTED = 'DAILY_PROGRESS_SUBMITTED',
  DAILY_PROGRESS_UPDATED = 'DAILY_PROGRESS_UPDATED',
  
  // Leave actions
  LEAVE_TYPE_CREATED = 'LEAVE_TYPE_CREATED',
  LEAVE_TYPE_UPDATED = 'LEAVE_TYPE_UPDATED',
  LEAVE_REQUEST_SUBMITTED = 'LEAVE_REQUEST_SUBMITTED',
  LEAVE_REQUEST_APPROVED = 'LEAVE_REQUEST_APPROVED',
  LEAVE_REQUEST_REJECTED = 'LEAVE_REQUEST_REJECTED',
  LEAVE_REQUEST_CANCELLED = 'LEAVE_REQUEST_CANCELLED',
  LEAVE_BALANCE_ADJUSTED = 'LEAVE_BALANCE_ADJUSTED',

  // Payroll actions
  PAYROLL_CREATED = 'PAYROLL_CREATED',
  PAYROLL_MODIFIED = 'PAYROLL_MODIFIED',

  // Report actions
  REPORT_SUBMITTED = 'REPORT_SUBMITTED',
  REPORT_MODIFIED = 'REPORT_MODIFIED',
}

export interface IAuditLog {
  actor: mongoose.Types.ObjectId; 
  action: string;
  entity: string; // e.g., 'User', 'Task', 'LeaveRequest'
  entityId?: mongoose.Types.ObjectId; 
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {}
export interface IAuditLogModel extends Model<IAuditLogDocument> {}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entity: {
      type: String,
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient filtering by entity type/id and actor
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLogDocument, IAuditLogModel>('AuditLog', auditLogSchema);

export default AuditLog;
