import { Router } from 'express';
import * as orgController from '../controllers/organization.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

router.use(authenticate);

router.get('/stats', requirePermission(Permission.USER_VIEW), orgController.getOrganizationStats);
router.get('/hierarchy', requirePermission(Permission.USER_VIEW), orgController.getOrganizationHierarchy);

export default router;
