import mongoose, { Document, Schema, Model } from 'mongoose';

export enum AuditAction {
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
  TASK_COMMENT_ADDED = 'TASK_COMMENT_ADDED',
  // Attendance actions
  ATTENDANCE_CHECKIN = 'ATTENDANCE_CHECKIN',
  ATTENDANCE_CHECKOUT = 'ATTENDANCE_CHECKOUT',
  ATTENDANCE_CORRECTED = 'ATTENDANCE_CORRECTED',
  ATTENDANCE_STATUS_CHANGED = 'ATTENDANCE_STATUS_CHANGED',
  // Daily progress actions
  DAILY_PROGRESS_SUBMITTED = 'DAILY_PROGRESS_SUBMITTED',
  DAILY_PROGRESS_UPDATED = 'DAILY_PROGRESS_UPDATED',
  DAILY_PROGRESS_LOCKED = 'DAILY_PROGRESS_LOCKED',
  // Leave actions
  LEAVE_TYPE_CREATED = 'LEAVE_TYPE_CREATED',
  LEAVE_TYPE_UPDATED = 'LEAVE_TYPE_UPDATED',
  LEAVE_REQUEST_SUBMITTED = 'LEAVE_REQUEST_SUBMITTED',
  LEAVE_REQUEST_APPROVED = 'LEAVE_REQUEST_APPROVED',
  LEAVE_REQUEST_REJECTED = 'LEAVE_REQUEST_REJECTED',
  LEAVE_REQUEST_CANCELLED = 'LEAVE_REQUEST_CANCELLED',
  LEAVE_BALANCE_ADJUSTED = 'LEAVE_BALANCE_ADJUSTED',
}

export interface IAuditLog {
  action: AuditAction | string;
  performedBy: mongoose.Types.ObjectId; // User ID
  targetUser?: mongoose.Types.ObjectId;
  targetTeam?: mongoose.Types.ObjectId;
  targetTask?: mongoose.Types.ObjectId;
  targetAttendance?: mongoose.Types.ObjectId;
  targetDailyProgress?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {}

export interface IAuditLogModel extends Model<IAuditLogDocument> {}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    targetTeam: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      index: true,
    },
    targetTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true,
    },
    targetAttendance: {
      type: Schema.Types.ObjectId,
      ref: 'Attendance',
      index: true,
    },
    targetDailyProgress: {
      type: Schema.Types.ObjectId,
      ref: 'DailyProgress',
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        if (ret.__v !== undefined) delete (ret as any).__v;
        return ret;
      },
    },
  }
);

const AuditLog = mongoose.model<IAuditLogDocument, IAuditLogModel>('AuditLog', auditLogSchema);

export default AuditLog;
