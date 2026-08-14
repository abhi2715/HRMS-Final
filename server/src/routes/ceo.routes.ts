import { Router } from 'express';
import * as ceoController from '../controllers/ceo.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

router.use(authenticate);

// CEO Dashboard aggregated data
router.get('/dashboard', requirePermission(Permission.ANALYTICS_VIEW_ORGANIZATION), ceoController.getCeoDashboard);

export default router;
