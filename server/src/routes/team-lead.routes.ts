import { Router } from 'express';
import * as teamLeadController from '../controllers/team-lead.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

router.use(authenticate);

// Team Lead Dashboard stats (requires TEAM_VIEW, though it's scoped to their own team internally)
router.get('/dashboard', requirePermission(Permission.TEAM_VIEW), teamLeadController.getTeamLeadDashboard);

// Team Members detailed list
router.get('/members', requirePermission(Permission.TEAM_VIEW), teamLeadController.getTeamMembers);

export default router;
