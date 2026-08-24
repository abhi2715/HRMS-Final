import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { initializeAuth } from './store/slices/authSlice';
import { useAppDispatch } from './store/hooks';
import { ROUTES } from './utils/constants';
import { Permission } from './utils/permissions';

import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';

const OrgAnalyticsPage = lazy(() => import('./pages/analytics/OrgAnalyticsPage').then(m => ({ default: m.OrgAnalyticsPage })));
const TeamAnalyticsPage = lazy(() => import('./pages/analytics/TeamAnalyticsPage').then(m => ({ default: m.TeamAnalyticsPage })));
const EmployeeAnalyticsPage = lazy(() => import('./pages/analytics/EmployeeAnalyticsPage').then(m => ({ default: m.EmployeeAnalyticsPage })));
const TeamWeeklyReportsPage = lazy(() => import('./pages/team-lead/TeamWeeklyReportsPage').then(m => ({ default: m.TeamWeeklyReportsPage })));
const WeeklyReportSubmitPage = lazy(() => import('./pages/team-lead/WeeklyReportSubmitPage').then(m => ({ default: m.WeeklyReportSubmitPage })));
const CeoWeeklyReportsPage = lazy(() => import('./pages/ceo/CeoWeeklyReportsPage').then(m => ({ default: m.CeoWeeklyReportsPage })));
const MyPayrollPage = lazy(() => import('./pages/employee/MyPayrollPage').then(m => ({ default: m.MyPayrollPage })));
const AdminPayrollPage = lazy(() => import('./pages/admin/AdminPayrollPage').then(m => ({ default: m.AdminPayrollPage })));
const CeoPayrollDashboard = lazy(() => import('./pages/ceo/CeoPayrollDashboard').then(m => ({ default: m.CeoPayrollDashboard })));

const DashboardRouter = lazy(() => import('./pages/DashboardRouter'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const EmployeesPage = lazy(() => import('./pages/admin/EmployeesPage'));
const TeamsPage = lazy(() => import('./pages/admin/TeamsPage'));
const OrganizationPage = lazy(() => import('./pages/admin/OrganizationPage'));
const TasksPage = lazy(() => import('./pages/ceo/TasksPage'));
const TeamMembersPage = lazy(() => import('./pages/team-lead/TeamMembersPage'));
const MyProfilePage = lazy(() => import('./pages/employee/MyProfilePage'));
const MyAttendancePage = lazy(() => import('./pages/employee/MyAttendancePage'));
const TeamAttendancePage = lazy(() => import('./pages/team-lead/TeamAttendancePage'));
const AdminAttendancePage = lazy(() => import('./pages/admin/AdminAttendancePage'));
const CeoAttendancePage = lazy(() => import('./pages/ceo/CeoAttendancePage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));

const MyDailyProgressPage = lazy(() => import('./pages/employee/MyDailyProgressPage'));
const TeamDailyProgressPage = lazy(() => import('./pages/team-lead/TeamDailyProgressPage'));
const CeoDailyProgressPage = lazy(() => import('./pages/ceo/CeoDailyProgressPage'));

const MyLeavesPage = lazy(() => import('./pages/employee/MyLeavesPage').then(m => ({ default: m.MyLeavesPage })));
const TeamLeavesPage = lazy(() => import('./pages/team-lead/TeamLeavesPage').then(m => ({ default: m.TeamLeavesPage })));
const AdminLeaveConfigPage = lazy(() => import('./pages/admin/AdminLeaveConfigPage').then(m => ({ default: m.AdminLeaveConfigPage })));

/**
 * App Root.
 *
 * Handles initial auth check, routing setup, and layout wrapping.
 */
function App() {
  const dispatch = useAppDispatch();
  const { isInitialized } = useAuth();

  // Try to silently refresh token on app mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Show a full-screen loader while checking initial auth
  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="login-page__spinner" style={{ borderColor: 'rgba(79, 70, 229, 0.3)', borderTopColor: '#4F46E5' }} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Protected Application Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Role-based Dashboard */}
          <Route path="/" element={<Suspense fallback={<div>Loading...</div>}><DashboardRouter /></Suspense>} />

          {/* Feature Routes */}
          <Route path={ROUTES.EMPLOYEES} element={<Suspense fallback={<div>Loading...</div>}><EmployeesPage /></Suspense>} />
          <Route path={ROUTES.TEAMS} element={<Suspense fallback={<div>Loading...</div>}><TeamsPage /></Suspense>} />
          <Route path={ROUTES.AUDIT_LOGS} element={<Suspense fallback={<div>Loading...</div>}><AuditLogsPage /></Suspense>} />
          <Route path={ROUTES.ORGANIZATION} element={<Suspense fallback={<div>Loading...</div>}><OrganizationPage /></Suspense>} />
          <Route path={ROUTES.TASKS} element={<Suspense fallback={<div>Loading...</div>}><TasksPage /></Suspense>} />
          <Route path="/team-members" element={<Suspense fallback={<div>Loading...</div>}><TeamMembersPage /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<div>Loading...</div>}><MyProfilePage /></Suspense>} />
          <Route path={ROUTES.ATTENDANCE} element={<Suspense fallback={<div>Loading...</div>}><MyAttendancePage /></Suspense>} />
          <Route path={ROUTES.ATTENDANCE_TEAM} element={<Suspense fallback={<div>Loading...</div>}><TeamAttendancePage /></Suspense>} />
          <Route path={ROUTES.ATTENDANCE_ORG} element={<Suspense fallback={<div>Loading...</div>}><AdminAttendancePage /></Suspense>} />
          <Route path={ROUTES.ATTENDANCE_ANALYTICS} element={<Suspense fallback={<div>Loading...</div>}><CeoAttendancePage /></Suspense>} />
          <Route path={ROUTES.DAILY_PROGRESS} element={<Suspense fallback={<div>Loading...</div>}><MyDailyProgressPage /></Suspense>} />
          <Route path={ROUTES.DAILY_PROGRESS_TEAM} element={<Suspense fallback={<div>Loading...</div>}><TeamDailyProgressPage /></Suspense>} />
          <Route path={ROUTES.DAILY_PROGRESS_ORG} element={<Suspense fallback={<div>Loading...</div>}><CeoDailyProgressPage /></Suspense>} />
          
          <Route path={ROUTES.PAYROLL} element={<RoleGuard permission={Permission.PAYROLL_VIEW_SELF}><Suspense fallback={<div>Loading...</div>}><MyPayrollPage /></Suspense></RoleGuard>} />
           <Route path={ROUTES.PAYROLL_ADMIN} element={<RoleGuard permission={Permission.PAYROLL_MANAGE}><Suspense fallback={<div>Loading...</div>}><AdminPayrollPage /></Suspense></RoleGuard>} />
           <Route path={ROUTES.PAYROLL_ORG} element={<RoleGuard permission={Permission.PAYROLL_VIEW_ORGANIZATION}><Suspense fallback={<div>Loading...</div>}><CeoPayrollDashboard /></Suspense></RoleGuard>} />
          <Route path={ROUTES.ANALYTICS_ORG} element={<RoleGuard permission={Permission.ANALYTICS_VIEW_ORGANIZATION}><Suspense fallback={<div>Loading...</div>}><OrgAnalyticsPage /></Suspense></RoleGuard>} />
          <Route path={ROUTES.ANALYTICS_TEAM} element={<RoleGuard permission={Permission.ANALYTICS_VIEW_TEAM}><Suspense fallback={<div>Loading...</div>}><TeamAnalyticsPage /></Suspense></RoleGuard>} />
          <Route path={ROUTES.ANALYTICS_ME} element={<RoleGuard permission={Permission.ANALYTICS_VIEW_SELF}><Suspense fallback={<div>Loading...</div>}><EmployeeAnalyticsPage /></Suspense></RoleGuard>} />
          
          <Route path={ROUTES.WEEKLY_REPORTS} element={<RoleGuard permission={Permission.WEEKLY_REPORT_SUBMIT}><Suspense fallback={<div>Loading...</div>}><TeamWeeklyReportsPage /></Suspense></RoleGuard>} />
           <Route path={ROUTES.WEEKLY_REPORTS_SUBMIT} element={<RoleGuard permission={Permission.WEEKLY_REPORT_SUBMIT}><Suspense fallback={<div>Loading...</div>}><WeeklyReportSubmitPage /></Suspense></RoleGuard>} />
           <Route path={ROUTES.WEEKLY_REPORTS_ORG} element={<RoleGuard permission={Permission.WEEKLY_REPORT_VIEW}><Suspense fallback={<div>Loading...</div>}><CeoWeeklyReportsPage /></Suspense></RoleGuard>} />
          <Route path={ROUTES.LEAVE_MY} element={<RoleGuard permission={Permission.LEAVE_VIEW_SELF}><Suspense fallback={<div>Loading...</div>}><MyLeavesPage /></Suspense></RoleGuard>} />
          <Route path={ROUTES.LEAVE_TEAM} element={<RoleGuard permission={Permission.LEAVE_VIEW_TEAM}><Suspense fallback={<div>Loading...</div>}><TeamLeavesPage /></Suspense></RoleGuard>} />
          <Route path={ROUTES.LEAVE_ADMIN} element={<RoleGuard permission={Permission.LEAVE_MANAGE_TYPES}><Suspense fallback={<div>Loading...</div>}><AdminLeaveConfigPage /></Suspense></RoleGuard>} />
          <Route path={ROUTES.REPORTS} element={<div style={{ padding: '2rem' }}><h1>Reports Module (Coming Soon)</h1></div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
