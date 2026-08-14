import { UserRole } from '../../../shared/types/enums';

/**
 * Centralized permission system.
 *
 * Every protected action in the system maps to a permission string.
 * Each role has an explicit set of granted permissions.
 *
 * Authorization flow:
 *   1. Auth middleware verifies JWT → sets req.user.role
 *   2. authorize(Permission.TASK_CREATE) middleware checks if the role has that permission
 *   3. Controller executes business logic (may do additional data-level checks)
 *
 * The frontend mirrors this map for UI gating, but the backend always enforces.
 */

// ── Permission Constants ────────────────────────────────────────
export const Permission = {
  // User management
  USER_CREATE:            'user.create',
  USER_VIEW:              'user.view',
  USER_UPDATE:            'user.update',
  USER_DEACTIVATE:        'user.deactivate',

  // Team management
  TEAM_CREATE:            'team.create',
  TEAM_VIEW:              'team.view',
  TEAM_UPDATE:            'team.update',
  TEAM_ASSIGN_LEAD:       'team.assignLead',
  TEAM_ASSIGN_EMPLOYEE:   'team.assignEmployee',

  // Task management
  TASK_CREATE:            'task.create',
  TASK_VIEW:              'task.view',
  TASK_ASSIGN:            'task.assign',
  TASK_UPDATE:            'task.update',
  TASK_COMPLETE:          'task.complete',
  TASK_DELETE:            'task.delete',

  // Attendance
  ATTENDANCE_VIEW_SELF:         'attendance.view.self',
  ATTENDANCE_VIEW_TEAM:         'attendance.view.team',
  ATTENDANCE_VIEW_ORGANIZATION: 'attendance.view.organization',
  ATTENDANCE_MANAGE:            'attendance.manage',

  // Leave
  LEAVE_APPLY:            'leave.apply',
  LEAVE_VIEW_SELF:        'leave.view.self',
  LEAVE_VIEW_TEAM:        'leave.view.team',
  LEAVE_APPROVE:          'leave.approve',
  LEAVE_REJECT:           'leave.reject',
  LEAVE_MANAGE_TYPES:     'leave.manageTypes',
  LEAVE_MANAGE_BALANCES:  'leave.manageBalances',

  // Payroll
  PAYROLL_VIEW_SELF:           'payroll.view.self',
  PAYROLL_VIEW_ORGANIZATION:   'payroll.view.organization',
  PAYROLL_MANAGE:              'payroll.manage',

  // Analytics
  ANALYTICS_VIEW_SELF:         'analytics.view.self',
  ANALYTICS_VIEW_TEAM:         'analytics.view.team',
  ANALYTICS_VIEW_ORGANIZATION: 'analytics.view.organization',

  // Audit
  AUDIT_VIEW:             'audit.view',

  // Reports
  REPORT_VIEW:            'report.view',
  REPORT_CREATE:          'report.create',

  // Daily progress
  PROGRESS_SUBMIT:        'progress.submit',
  PROGRESS_VIEW_SELF:     'progress.view.self',
  PROGRESS_VIEW_TEAM:     'progress.view.team',

  // Weekly reports
  WEEKLY_REPORT_SUBMIT:   'weeklyReport.submit',
  WEEKLY_REPORT_VIEW:     'weeklyReport.view',

  // Notifications
  NOTIFICATION_SEND:      'notification.send',

  // Settings
  SETTINGS_MANAGE:        'settings.manage',
} as const;

export type PermissionString = typeof Permission[keyof typeof Permission];

// ── Role → Permission Mapping ───────────────────────────────────
const ADMIN_PERMISSIONS: PermissionString[] = [
  // Admin gets all permissions
  Permission.USER_CREATE,
  Permission.USER_VIEW,
  Permission.USER_UPDATE,
  Permission.USER_DEACTIVATE,
  Permission.TEAM_CREATE,
  Permission.TEAM_VIEW,
  Permission.TEAM_UPDATE,
  Permission.TEAM_ASSIGN_LEAD,
  Permission.TEAM_ASSIGN_EMPLOYEE,
  Permission.TASK_CREATE,
  Permission.TASK_VIEW,
  Permission.TASK_ASSIGN,
  Permission.TASK_UPDATE,
  Permission.TASK_COMPLETE,
  Permission.TASK_DELETE,
  Permission.ATTENDANCE_VIEW_SELF,
  Permission.ATTENDANCE_VIEW_TEAM,
  Permission.ATTENDANCE_VIEW_ORGANIZATION,
  Permission.ATTENDANCE_MANAGE,
  Permission.LEAVE_APPLY,
  Permission.LEAVE_VIEW_SELF,
  Permission.LEAVE_VIEW_TEAM,
  Permission.LEAVE_APPROVE,
  Permission.LEAVE_REJECT,
  Permission.LEAVE_MANAGE_TYPES,
  Permission.LEAVE_MANAGE_BALANCES,
  Permission.PAYROLL_VIEW_SELF,
  Permission.PAYROLL_VIEW_ORGANIZATION,
  Permission.PAYROLL_MANAGE,
  Permission.ANALYTICS_VIEW_SELF,
  Permission.ANALYTICS_VIEW_TEAM,
  Permission.ANALYTICS_VIEW_ORGANIZATION,
  Permission.AUDIT_VIEW,
  Permission.REPORT_VIEW,
  Permission.REPORT_CREATE,
  Permission.PROGRESS_SUBMIT,
  Permission.PROGRESS_VIEW_SELF,
  Permission.PROGRESS_VIEW_TEAM,
  Permission.WEEKLY_REPORT_SUBMIT,
  Permission.WEEKLY_REPORT_VIEW,
  Permission.NOTIFICATION_SEND,
  Permission.SETTINGS_MANAGE,
];

const CEO_PERMISSIONS: PermissionString[] = [
  // CEO: strategic org-level access — NOT admin actions like user/payroll management
  Permission.USER_VIEW,
  Permission.TEAM_VIEW,
  Permission.TASK_CREATE,
  Permission.TASK_VIEW,
  Permission.TASK_ASSIGN,
  Permission.TASK_UPDATE,
  Permission.TASK_COMPLETE,
  Permission.ATTENDANCE_VIEW_SELF,
  Permission.ATTENDANCE_VIEW_TEAM,
  Permission.ATTENDANCE_VIEW_ORGANIZATION,
  Permission.LEAVE_APPLY,
  Permission.LEAVE_VIEW_SELF,
  Permission.LEAVE_VIEW_TEAM,
  Permission.PAYROLL_VIEW_SELF,
  Permission.PAYROLL_VIEW_ORGANIZATION,
  Permission.ANALYTICS_VIEW_SELF,
  Permission.ANALYTICS_VIEW_TEAM,
  Permission.ANALYTICS_VIEW_ORGANIZATION,
  Permission.AUDIT_VIEW,
  Permission.REPORT_VIEW,
  Permission.REPORT_CREATE,
  Permission.PROGRESS_SUBMIT,
  Permission.PROGRESS_VIEW_SELF,
  Permission.PROGRESS_VIEW_TEAM,
  Permission.WEEKLY_REPORT_VIEW,
  Permission.NOTIFICATION_SEND,
];

const TEAM_LEAD_PERMISSIONS: PermissionString[] = [
  // Team Lead: assigned-team operational access only
  Permission.TEAM_VIEW,
  Permission.TASK_CREATE,
  Permission.TASK_VIEW,
  Permission.TASK_ASSIGN,
  Permission.TASK_UPDATE,
  Permission.TASK_COMPLETE,
  Permission.ATTENDANCE_VIEW_SELF,
  Permission.ATTENDANCE_VIEW_TEAM,
  Permission.ATTENDANCE_MANAGE,
  Permission.LEAVE_APPLY,
  Permission.LEAVE_VIEW_SELF,
  Permission.LEAVE_VIEW_TEAM,
  Permission.LEAVE_APPROVE,
  Permission.LEAVE_REJECT,
  Permission.LEAVE_MANAGE_TYPES,
  Permission.LEAVE_MANAGE_BALANCES,
  Permission.PAYROLL_VIEW_SELF,
  Permission.ANALYTICS_VIEW_SELF,
  Permission.ANALYTICS_VIEW_TEAM,
  Permission.REPORT_VIEW,
  Permission.REPORT_CREATE,
  Permission.PROGRESS_SUBMIT,
  Permission.PROGRESS_VIEW_SELF,
  Permission.PROGRESS_VIEW_TEAM,
  Permission.WEEKLY_REPORT_SUBMIT,
  Permission.WEEKLY_REPORT_VIEW,
];

const EMPLOYEE_PERMISSIONS: PermissionString[] = [
  // Employee: self-service and assigned work only
  Permission.TASK_VIEW,
  Permission.TASK_UPDATE,
  Permission.TASK_COMPLETE,
  Permission.ATTENDANCE_VIEW_SELF,
  Permission.LEAVE_APPLY,
  Permission.LEAVE_VIEW_SELF,
  Permission.PAYROLL_VIEW_SELF,
  Permission.ANALYTICS_VIEW_SELF,
  Permission.PROGRESS_SUBMIT,
  Permission.PROGRESS_VIEW_SELF,
];

// ── Role → Permission Map ──────────────────────────────────────
const rolePermissions: Record<UserRole, Set<PermissionString>> = {
  [UserRole.ADMIN]:     new Set(ADMIN_PERMISSIONS),
  [UserRole.CEO]:       new Set(CEO_PERMISSIONS),
  [UserRole.TEAM_LEAD]: new Set(TEAM_LEAD_PERMISSIONS),
  [UserRole.EMPLOYEE]:  new Set(EMPLOYEE_PERMISSIONS),
};

/**
 * Check whether a role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: PermissionString): boolean {
  const perms = rolePermissions[role];
  return perms ? perms.has(permission) : false;
}

/**
 * Get all permissions for a role.
 */
export function getPermissionsForRole(role: UserRole): PermissionString[] {
  return Array.from(rolePermissions[role] || []);
}

/**
 * Check whether a role has ALL of the specified permissions.
 */
export function hasAllPermissions(role: UserRole, permissions: PermissionString[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check whether a role has ANY of the specified permissions.
 */
export function hasAnyPermission(role: UserRole, permissions: PermissionString[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
