import { OrgAnalyticsPage } from './pages/analytics/OrgAnalyticsPage';
import { TeamAnalyticsPage } from './pages/analytics/TeamAnalyticsPage';
import { EmployeeAnalyticsPage } from './pages/analytics/EmployeeAnalyticsPage';
import { TeamWeeklyReportsPage } from './pages/team-lead/TeamWeeklyReportsPage';
import { WeeklyReportSubmitPage } from './pages/team-lead/WeeklyReportSubmitPage';
import { CeoWeeklyReportsPage } from './pages/ceo/CeoWeeklyReportsPage';
import { MyPayrollPage } from './pages/employee/MyPayrollPage';
import { AdminPayrollPage } from './pages/admin/AdminPayrollPage';
import { CeoPayrollDashboard } from './pages/ceo/CeoPayrollDashboard';
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { initializeAuth } from './store/slices/authSlice';
import { useAppDispatch } from './store/hooks';
import { ROUTES } from './utils/constants';
import { Permission } from './utils/permissions';

import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleGuard from './components/auth/RoleGuard';
import DashboardRouter from './pages/DashboardRouter';
import LoginPage from './pages/LoginPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import TeamsPage from './pages/admin/TeamsPage';
import OrganizationPage from './pages/admin/OrganizationPage';
import TasksPage from './pages/ceo/TasksPage';
import TeamMembersPage from './pages/team-lead/TeamMembersPage';
import MyProfilePage from './pages/employee/MyProfilePage';
import MyAttendancePage from './pages/employee/MyAttendancePage';
import TeamAttendancePage from './pages/team-lead/TeamAttendancePage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import CeoAttendancePage from './pages/ceo/CeoAttendancePage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import MyDailyProgressPage from './pages/employee/MyDailyProgressPage';
import TeamDailyProgressPage from './pages/team-lead/TeamDailyProgressPage';
import CeoDailyProgressPage from './pages/ceo/CeoDailyProgressPage';

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
          <Route path="/" element={<DashboardRouter />} />

          {/* Feature Routes */}
          <Route path={ROUTES.EMPLOYEES} element={<EmployeesPage />} />
          <Route path={ROUTES.TEAMS} element={<TeamsPage />} />
          <Route path={ROUTES.AUDIT_LOGS} element={<AuditLogsPage />} />
          <Route path={ROUTES.ORGANIZATION} element={<OrganizationPage />} />
          <Route path={ROUTES.TASKS} element={<TasksPage />} />
          <Route path="/team-members" element={<TeamMembersPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path={ROUTES.ATTENDANCE} element={<MyAttendancePage />} />
          <Route path={ROUTES.ATTENDANCE_TEAM} element={<TeamAttendancePage />} />
          <Route path={ROUTES.ATTENDANCE_ORG} element={<AdminAttendancePage />} />
          <Route path={ROUTES.ATTENDANCE_ANALYTICS} element={<CeoAttendancePage />} />
          <Route path={ROUTES.DAILY_PROGRESS} element={<MyDailyProgressPage />} />
          <Route path={ROUTES.DAILY_PROGRESS_TEAM} element={<TeamDailyProgressPage />} />
          <Route path={ROUTES.DAILY_PROGRESS_ORG} element={<CeoDailyProgressPage />} />
          
          <Route path={ROUTES.PAYROLL} element={<RoleGuard permission={Permission.PAYROLL_VIEW_SELF}><MyPayrollPage /></RoleGuard>} />
           <Route path={ROUTES.PAYROLL_ADMIN} element={<RoleGuard permission={Permission.PAYROLL_MANAGE}><AdminPayrollPage /></RoleGuard>} />
           <Route path={ROUTES.PAYROLL_ORG} element={<RoleGuard permission={Permission.PAYROLL_VIEW_ORGANIZATION}><CeoPayrollDashboard /></RoleGuard>} />
          <Route path={ROUTES.ANALYTICS_ORG} element={<RoleGuard permission={Permission.ANALYTICS_VIEW_ORGANIZATION}><OrgAnalyticsPage /></RoleGuard>} />
          <Route path={ROUTES.ANALYTICS_TEAM} element={<RoleGuard permission={Permission.ANALYTICS_VIEW_TEAM}><TeamAnalyticsPage /></RoleGuard>} />
          <Route path={ROUTES.ANALYTICS_ME} element={<RoleGuard permission={Permission.ANALYTICS_VIEW_SELF}><EmployeeAnalyticsPage /></RoleGuard>} />
          
          <Route path={ROUTES.WEEKLY_REPORTS} element={<RoleGuard permission={Permission.WEEKLY_REPORT_SUBMIT}><TeamWeeklyReportsPage /></RoleGuard>} />
           <Route path={ROUTES.WEEKLY_REPORTS_SUBMIT} element={<RoleGuard permission={Permission.WEEKLY_REPORT_SUBMIT}><WeeklyReportSubmitPage /></RoleGuard>} />
           <Route path={ROUTES.WEEKLY_REPORTS_ORG} element={<RoleGuard permission={Permission.WEEKLY_REPORT_VIEW}><CeoWeeklyReportsPage /></RoleGuard>} />
          <Route path={ROUTES.REPORTS} element={<div style={{ padding: '2rem' }}><h1>Reports Module (Coming Soon)</h1></div>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
