import { Router } from 'express';
import * as teamController from '../controllers/team.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

// Require auth for all team routes
router.use(authenticate);

// List teams
router.get('/', requirePermission(Permission.TEAM_VIEW), teamController.getTeams);

// Get single team with members
router.get('/:id', requirePermission(Permission.TEAM_VIEW), teamController.getTeamById);

// Create team (Admin/CEO only)
router.post('/', requirePermission(Permission.TEAM_CREATE), teamController.createTeam);

// Update team (Admin/CEO only)
router.put('/:id', requirePermission(Permission.TEAM_UPDATE), teamController.updateTeam);

export default router;
