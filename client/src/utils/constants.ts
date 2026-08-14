/**
 * Application route paths — single source of truth.
 */
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  EMPLOYEES: '/employees',
  TEAMS: '/teams',
  ORGANIZATION: '/organization',
  TASKS: '/tasks',
  ATTENDANCE: '/attendance',
  ATTENDANCE_TEAM: '/attendance/team',
  ATTENDANCE_ORG: '/attendance/organization',
  ATTENDANCE_ANALYTICS: '/attendance/analytics',
  DAILY_PROGRESS: '/daily-progress',
  DAILY_PROGRESS_TEAM: '/daily-progress/team',
  DAILY_PROGRESS_ORG: '/daily-progress/analytics',
  LEAVE_MY: '/leave/my',
  LEAVE_TEAM: '/leave/team',
  LEAVE_ADMIN: '/leave/admin',
  PAYROLL: '/payroll',
  PAYROLL_ADMIN: '/payroll/admin',
  PAYROLL_ORG: '/payroll/org',

  WEEKLY_REPORTS: '/weekly-reports',
  WEEKLY_REPORTS_SUBMIT: '/weekly-reports/submit',
  WEEKLY_REPORTS_ORG: '/weekly-reports/org',

  REPORTS: '/reports',
  ANALYTICS_ORG: '/analytics/org',
  ANALYTICS_TEAM: '/analytics/team',
  ANALYTICS_ME: '/analytics/me',
  SETTINGS: '/settings',
  AUDIT_LOGS: '/audit-logs',
} as const;

/**
 * Pagination defaults.
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 100,
} as const;

/**
 * Date/time formats.
 */
export const DATE_FORMATS = {
  DATE: 'MMM dd, yyyy',
  DATE_SHORT: 'MM/dd/yyyy',
  TIME: 'hh:mm a',
  DATETIME: 'MMM dd, yyyy hh:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const;
