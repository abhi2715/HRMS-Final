import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

// Require auth for all task routes
router.use(authenticate);

// List tasks (role-scoped in controller)
router.get('/', requirePermission(Permission.TASK_VIEW), taskController.getTasks);

// Get single task
router.get('/:id', requirePermission(Permission.TASK_VIEW), taskController.getTaskById);

// Create task
router.post('/', requirePermission(Permission.TASK_CREATE), taskController.createTask);

// Update task
router.put('/:id', requirePermission(Permission.TASK_UPDATE), taskController.updateTask);

// Delete task
router.delete('/:id', requirePermission(Permission.TASK_DELETE), taskController.deleteTask);

// Add comment to task
router.post('/:id/comments', requirePermission(Permission.TASK_VIEW), taskController.addComment);

export default router;
