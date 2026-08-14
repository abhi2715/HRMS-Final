/**
 * Shared enumerations used by both client and server.
 * Single source of truth for all domain constants.
 */

export const UserRole = {
  ADMIN: 'admin',
  CEO: 'ceo',
  TEAM_LEAD: 'team_lead',
  EMPLOYEE: 'employee',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const TaskStatus = {
  BACKLOG: 'backlog',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  BLOCKED: 'blocked',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export const LeaveStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type LeaveStatus = typeof LeaveStatus[keyof typeof LeaveStatus];

export const LeaveType = {
  CASUAL: 'casual',
  SICK: 'sick',
  EARNED: 'earned',
  UNPAID: 'unpaid',
} as const;

export type LeaveType = typeof LeaveType[keyof typeof LeaveType];

export const AttendanceStatus = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HALF_DAY: 'half_day',
  ON_LEAVE: 'on_leave',
  HOLIDAY: 'holiday',
  WEEKLY_OFF: 'weekly_off',
} as const;

export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];

export const NotificationType = {
  TASK: 'task',
  LEAVE: 'leave',
  ATTENDANCE: 'attendance',
  ANNOUNCEMENT: 'announcement',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const DailyProgressStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  LOCKED: 'locked',
} as const;

export type DailyProgressStatus = typeof DailyProgressStatus[keyof typeof DailyProgressStatus];

