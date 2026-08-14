import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';
import { UserRole } from '../../../shared/types/enums';
import { hasPermission, hasAnyPermission, PermissionString } from '../config/permissions';

/**
 * Authorization middleware.
 *
 * Two strategies:
 *   1. authorize(...roles) — allows specific roles (simple role check)
 *   2. requirePermission(permission) — checks role-to-permission mapping
 *   3. requireAnyPermission(...permissions) — checks if role has any of the listed permissions
 *
 * All require req.user to be set by the auth middleware first.
 */

/**
 * Role-based authorization: allow only specific roles.
 *
 * Usage: router.post('/users', authenticate, authorize(UserRole.ADMIN), controller)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthorizationError('User not authenticated'));
    }

    const userRole = req.user.role as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return next(
        new AuthorizationError(
          `Role '${userRole}' is not authorized for this action`
        )
      );
    }

    next();
  };
};

/**
 * Permission-based authorization: check a specific permission.
 *
 * Usage: router.post('/tasks', authenticate, requirePermission(Permission.TASK_CREATE), controller)
 */
export const requirePermission = (permission: PermissionString) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthorizationError('User not authenticated'));
    }

    const userRole = req.user.role as UserRole;
    if (!hasPermission(userRole, permission)) {
      return next(
        new AuthorizationError(
          `Insufficient permissions for this action`
        )
      );
    }

    next();
  };
};

/**
 * Permission-based authorization: check if role has ANY of the listed permissions.
 *
 * Usage: router.get('/analytics', authenticate, requireAnyPermission(Permission.ANALYTICS_VIEW_SELF, Permission.ANALYTICS_VIEW_ORGANIZATION), controller)
 */
export const requireAnyPermission = (...permissions: PermissionString[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthorizationError('User not authenticated'));
    }

    const userRole = req.user.role as UserRole;
    if (!hasAnyPermission(userRole, permissions)) {
      return next(
        new AuthorizationError(
          `Insufficient permissions for this action`
        )
      );
    }

    next();
  };
};
