import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

// Require auth for all user routes
router.use(authenticate);

// List users
router.get('/', requirePermission(Permission.USER_VIEW), userController.getUsers);

// Get single user
router.get('/:id', requirePermission(Permission.USER_VIEW), userController.getUserById);

// Create user (Admin/CEO only typically)
router.post('/', requirePermission(Permission.USER_CREATE), userController.createUser);

// Update user (Admin/CEO only)
router.put('/:id', requirePermission(Permission.USER_UPDATE), userController.updateUser);

export default router;
