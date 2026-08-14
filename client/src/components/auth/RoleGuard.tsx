import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { ROUTES } from '../../utils/constants';
import { UserRole } from '../../types/auth.types';
import { hasPermission, type PermissionString } from '../../utils/permissions';

interface RoleGuardProps {
  children: React.ReactNode;
  /** Allow only these roles */
  roles?: UserRole[];
  /** Or require this specific permission */
  permission?: PermissionString;
  /** What to show when access is denied (defaults to redirect) */
  fallback?: React.ReactNode;
}

/**
 * Role-based route/component guard.
 *
 * Can check by role list OR by specific permission.
 * Shows fallback or redirects to dashboard if unauthorized.
 */
export default function RoleGuard({ children, roles, permission, fallback }: RoleGuardProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  let hasAccess = false;

  if (roles && roles.length > 0) {
    hasAccess = roles.includes(user.role as UserRole);
  }

  if (permission) {
    hasAccess = hasPermission(user.role as UserRole, permission);
  }

  // If neither roles nor permission specified, allow access
  if (!roles && !permission) {
    hasAccess = true;
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
