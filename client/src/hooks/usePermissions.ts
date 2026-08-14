import { useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { hasPermission, hasAnyPermission, type PermissionString } from '../utils/permissions';
import { UserRole } from '../types/auth.types';

/**
 * Custom hook for permission checks.
 *
 * Returns a `can()` function that checks if the current user's role
 * has a specific permission. Used for UI gating only.
 */
export function usePermissions() {
  const user = useAppSelector((state) => state.auth.user);
  const role = user?.role as UserRole | undefined;

  const can = useCallback(
    (permission: PermissionString): boolean => {
      if (!role) return false;
      return hasPermission(role, permission);
    },
    [role]
  );

  const canAny = useCallback(
    (...permissions: PermissionString[]): boolean => {
      if (!role) return false;
      return hasAnyPermission(role, permissions);
    },
    [role]
  );

  const isRole = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!role) return false;
      return roles.includes(role);
    },
    [role]
  );

  return { can, canAny, isRole, role };
}
