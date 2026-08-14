import { UserRole } from '../types/auth.types';

/**
 * Frontend permission system — mirrors the backend permission map.
 *
 * Used ONLY for UI gating (showing/hiding elements).
 * The backend ALWAYS enforces the actual access control.
 */

export const Permission = {
  USER_CREATE:            'user.create',
  USER_VIEW:              'user.view',
  USER_UPDATE:            'user.update',
  USER_DEACTIVATE:        'user.deactivate',
  TEAM_CREATE:            'team.create',
  TEAM_VIEW:              'team.view',
  TEAM_UPDATE:            'team.update',
  TEAM_ASSIGN_LEAD:       'team.assignLead',
  TEAM_ASSIGN_EMPLOYEE:   'team.assignEmployee',
  TASK_CREATE:            'task.create',
  TASK_VIEW:              'task.view',
  TASK_ASSIGN:            'task.assign',
  TASK_UPDATE:            'task.update',
  TASK_COMPLETE:          'task.complete',
  TASK_DELETE:            'task.delete',
  ATTENDANCE_VIEW_SELF:         'attendance.view.self',
  ATTENDANCE_VIEW_TEAM:         'attendance.view.team',
  ATTENDANCE_VIEW_ORGANIZATION: 'attendance.view.organization',
  ATTENDANCE_MANAGE:            'attendance.manage',
  LEAVE_APPLY:            'leave.apply',
  LEAVE_VIEW_SELF:        'leave.view.self',
  LEAVE_VIEW_TEAM:        'leave.view.team',
  LEAVE_APPROVE:          'leave.approve',
  LEAVE_REJECT:           'leave.reject',
  LEAVE_MANAGE_TYPES:     'leave.manageTypes',
  LEAVE_MANAGE_BALANCES:  'leave.manageBalances',
  PAYROLL_VIEW_SELF:           'payroll.view.self',
  PAYROLL_VIEW_ORGANIZATION:   'payroll.view.organization',
  PAYROLL_MANAGE:              'payroll.manage',
  ANALYTICS_VIEW_SELF:         'analytics.view.self',
  ANALYTICS_VIEW_TEAM:         'analytics.view.team',
  ANALYTICS_VIEW_ORGANIZATION: 'analytics.view.organization',
  AUDIT_VIEW:             'audit.view',
  REPORT_VIEW:            'report.view',
  REPORT_CREATE:          'report.create',
  PROGRESS_SUBMIT:        'progress.submit',
  PROGRESS_VIEW_SELF:     'progress.view.self',
  PROGRESS_VIEW_TEAM:     'progress.view.team',
  WEEKLY_REPORT_SUBMIT:   'weeklyReport.submit',
  WEEKLY_REPORT_VIEW:     'weeklyReport.view',
  NOTIFICATION_SEND:      'notification.send',
  SETTINGS_MANAGE:        'settings.manage',
} as const;

export type PermissionString = typeof Permission[keyof typeof Permission];

// Role → Permission mapping (mirrors backend exactly)
const rolePermissions: Record<UserRole, Set<string>> = {
  [UserRole.ADMIN]: new Set([
    Permission.USER_CREATE, Permission.USER_VIEW, Permission.USER_UPDATE, Permission.USER_DEACTIVATE,
    Permission.TEAM_CREATE, Permission.TEAM_VIEW, Permission.TEAM_UPDATE, Permission.TEAM_ASSIGN_LEAD, Permission.TEAM_ASSIGN_EMPLOYEE,
    Permission.TASK_CREATE, Permission.TASK_VIEW, Permission.TASK_ASSIGN, Permission.TASK_UPDATE, Permission.TASK_COMPLETE, Permission.TASK_DELETE,
    Permission.ATTENDANCE_VIEW_SELF, Permission.ATTENDANCE_VIEW_TEAM, Permission.ATTENDANCE_VIEW_ORGANIZATION, Permission.ATTENDANCE_MANAGE,
    Permission.LEAVE_APPLY, Permission.LEAVE_VIEW_SELF, Permission.LEAVE_VIEW_TEAM, Permission.LEAVE_APPROVE, Permission.LEAVE_REJECT,
    Permission.LEAVE_MANAGE_TYPES, Permission.LEAVE_MANAGE_BALANCES,
    Permission.PAYROLL_VIEW_SELF, Permission.PAYROLL_VIEW_ORGANIZATION, Permission.PAYROLL_MANAGE,
    Permission.ANALYTICS_VIEW_SELF, Permission.ANALYTICS_VIEW_TEAM, Permission.ANALYTICS_VIEW_ORGANIZATION,
    Permission.AUDIT_VIEW,
    Permission.REPORT_VIEW, Permission.REPORT_CREATE,
    Permission.PROGRESS_SUBMIT, Permission.PROGRESS_VIEW_SELF, Permission.PROGRESS_VIEW_TEAM,
    Permission.WEEKLY_REPORT_SUBMIT, Permission.WEEKLY_REPORT_VIEW,
    Permission.NOTIFICATION_SEND, Permission.SETTINGS_MANAGE,
  ]),
  [UserRole.CEO]: new Set([
    Permission.USER_VIEW,
    Permission.TEAM_VIEW,
    Permission.TASK_CREATE, Permission.TASK_VIEW, Permission.TASK_ASSIGN, Permission.TASK_UPDATE, Permission.TASK_COMPLETE,
    Permission.ATTENDANCE_VIEW_SELF, Permission.ATTENDANCE_VIEW_TEAM, Permission.ATTENDANCE_VIEW_ORGANIZATION,
    Permission.LEAVE_APPLY, Permission.LEAVE_VIEW_SELF, Permission.LEAVE_VIEW_TEAM,
    Permission.PAYROLL_VIEW_SELF, Permission.PAYROLL_VIEW_ORGANIZATION,
    Permission.ANALYTICS_VIEW_SELF, Permission.ANALYTICS_VIEW_TEAM, Permission.ANALYTICS_VIEW_ORGANIZATION,
    Permission.AUDIT_VIEW,
    Permission.REPORT_VIEW, Permission.REPORT_CREATE,
    Permission.PROGRESS_SUBMIT, Permission.PROGRESS_VIEW_SELF, Permission.PROGRESS_VIEW_TEAM,
    Permission.WEEKLY_REPORT_VIEW,
    Permission.NOTIFICATION_SEND,
  ]),
  [UserRole.TEAM_LEAD]: new Set([
    Permission.TEAM_VIEW,
    Permission.TASK_CREATE, Permission.TASK_VIEW, Permission.TASK_ASSIGN, Permission.TASK_UPDATE, Permission.TASK_COMPLETE,
    Permission.ATTENDANCE_VIEW_SELF, Permission.ATTENDANCE_VIEW_TEAM, Permission.ATTENDANCE_MANAGE,
    Permission.LEAVE_APPLY, Permission.LEAVE_VIEW_SELF, Permission.LEAVE_VIEW_TEAM, Permission.LEAVE_APPROVE, Permission.LEAVE_REJECT,
    Permission.LEAVE_MANAGE_TYPES, Permission.LEAVE_MANAGE_BALANCES,
    Permission.PAYROLL_VIEW_SELF,
    Permission.ANALYTICS_VIEW_SELF, Permission.ANALYTICS_VIEW_TEAM,
    Permission.REPORT_VIEW, Permission.REPORT_CREATE,
    Permission.PROGRESS_SUBMIT, Permission.PROGRESS_VIEW_SELF, Permission.PROGRESS_VIEW_TEAM,
    Permission.WEEKLY_REPORT_SUBMIT, Permission.WEEKLY_REPORT_VIEW,
  ]),
  [UserRole.EMPLOYEE]: new Set([
    Permission.TASK_VIEW, Permission.TASK_UPDATE, Permission.TASK_COMPLETE,
    Permission.ATTENDANCE_VIEW_SELF,
    Permission.LEAVE_APPLY, Permission.LEAVE_VIEW_SELF,
    Permission.PAYROLL_VIEW_SELF,
    Permission.ANALYTICS_VIEW_SELF,
    Permission.PROGRESS_SUBMIT, Permission.PROGRESS_VIEW_SELF,
  ]),
};

export function hasPermission(role: UserRole, permission: PermissionString): boolean {
  return rolePermissions[role]?.has(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: PermissionString[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
