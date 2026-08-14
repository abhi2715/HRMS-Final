import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../../../shared/types/enums';
import AdminDashboardPage from './admin/AdminDashboardPage';
import CeoDashboardPage from './ceo/CeoDashboardPage';
import TeamLeadDashboardPage from './team-lead/TeamLeadDashboardPage';
import EmployeeDashboardPage from './employee/EmployeeDashboardPage';
import DashboardPage from './DashboardPage';

/**
 * Routes users to the correct dashboard based on their role.
 */
export default function DashboardRouter() {
  const { user } = useAuth();

  if (!user) {
    return null; // or a loading spinner if auth is initializing
  }

  switch (user.role) {
    case UserRole.ADMIN:
      return <AdminDashboardPage />;
    case UserRole.CEO:
      return <CeoDashboardPage />;
    case UserRole.TEAM_LEAD:
      return <TeamLeadDashboardPage />;
    case UserRole.EMPLOYEE:
      return <EmployeeDashboardPage />;
    default:
      return <DashboardPage />;
  }
}
