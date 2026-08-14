import { Router } from 'express';
import {
  getOrganizationAnalytics,
  getTeamAnalytics,
  getEmployeeAnalytics,
} from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

// Organization Analytics
router.get(
  '/organization',
  authenticate,
  requirePermission(Permission.ANALYTICS_VIEW_ORGANIZATION),
  getOrganizationAnalytics
);

// Team Analytics
router.get(
  '/team/:teamId',
  authenticate,
  requirePermission(Permission.ANALYTICS_VIEW_TEAM),
  getTeamAnalytics
);

// Employee Analytics
router.get(
  '/employee/:employeeId',
  authenticate,
  requirePermission(Permission.ANALYTICS_VIEW_SELF), // Additional checks can be added for manager/admin inside controller if needed
  getEmployeeAnalytics
);

export default router;
