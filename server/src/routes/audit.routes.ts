import { Router } from 'express';
import * as auditController from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission(Permission.AUDIT_VIEW), auditController.getAuditLogs);

export default router;
