import { Router } from 'express';
import * as progressController from '../controllers/dailyProgress.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission, requireAnyPermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

router.use(authenticate);

// Self-service
router.post('/', requirePermission(Permission.PROGRESS_SUBMIT), progressController.submitDailyProgress);
router.get('/my', requirePermission(Permission.PROGRESS_VIEW_SELF), progressController.getMyDailyProgress);
router.get('/today', requirePermission(Permission.PROGRESS_VIEW_SELF), progressController.getTodayProgress);

// Team Managerial
router.get('/team/:teamId', requirePermission(Permission.PROGRESS_VIEW_TEAM), progressController.getTeamProgress);
router.get('/team/:teamId/missed', requirePermission(Permission.PROGRESS_VIEW_TEAM), progressController.getTeamMissed);
router.get('/team/:teamId/blocked', requirePermission(Permission.PROGRESS_VIEW_TEAM), progressController.getTeamBlocked);

// Organization Analytics
router.get('/organization', requirePermission(Permission.ANALYTICS_VIEW_ORGANIZATION), progressController.getOrganizationProgress);
router.get('/organization/summary', requirePermission(Permission.ANALYTICS_VIEW_ORGANIZATION), progressController.getOrganizationSummary);

// Administrative
router.put('/:id/lock', requireAnyPermission(Permission.PROGRESS_VIEW_TEAM, Permission.ANALYTICS_VIEW_ORGANIZATION), progressController.lockProgress);

export default router;
