import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';
import {
  getMyBalances,
  getMyRequests,
  applyLeave,
  cancelLeave,
  getTeamRequests,
  processLeaveRequest,
} from '../controllers/leave.controller';
import {
  createLeaveType,
  getLeaveTypes,
  updateLeaveType,
  getAllBalances,
  updateBalance,
} from '../controllers/leaveAdmin.controller';

const router = Router();

// All leave routes require authentication
router.use(authenticate);

// ==========================================
// Employee Routes (Self Service)
// ==========================================
// Also viewable by Team Lead / Admin if required, but primarily self.
router.get('/my/balances', requirePermission(Permission.LEAVE_VIEW_SELF), getMyBalances);
router.get('/my/requests', requirePermission(Permission.LEAVE_VIEW_SELF), getMyRequests);
router.post('/apply', requirePermission(Permission.LEAVE_APPLY), applyLeave);
router.patch('/:id/cancel', requirePermission(Permission.LEAVE_APPLY), cancelLeave);

// Public (to all authenticated users) endpoint to fetch available leave types
router.get('/types', getLeaveTypes);

// ==========================================
// Team Lead Routes
// ==========================================
router.get('/team/:teamId/requests', requirePermission(Permission.LEAVE_VIEW_TEAM), getTeamRequests);
router.patch('/:id/process', requirePermission(Permission.LEAVE_APPROVE), processLeaveRequest);

// ==========================================
// Admin Routes (Config & Org-wide)
// ==========================================
router.post('/admin/types', requirePermission(Permission.LEAVE_MANAGE_TYPES), createLeaveType);
router.put('/admin/types/:id', requirePermission(Permission.LEAVE_MANAGE_TYPES), updateLeaveType);

router.get('/admin/balances', requirePermission(Permission.LEAVE_MANAGE_BALANCES), getAllBalances);
router.put('/admin/balances/:id', requirePermission(Permission.LEAVE_MANAGE_BALANCES), updateBalance);

export default router;
