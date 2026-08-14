import { Router } from 'express';
import {
  getMySalaryHistory,
  getOrgPayrollSummary,
  getEmployeeSalaryHistory,
  createSalaryRecord,
  updateSalaryRecord,
} from '../controllers/payroll.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

// Employee endpoints
router.get(
  '/my-history',
  authenticate,
  requirePermission(Permission.PAYROLL_VIEW_SELF),
  getMySalaryHistory
);

// CEO / Org-wide endpoints
router.get(
  '/org-summary',
  authenticate,
  requirePermission(Permission.PAYROLL_VIEW_ORGANIZATION),
  getOrgPayrollSummary
);

// Admin endpoints
router.get(
  '/employee/:id',
  authenticate,
  requirePermission(Permission.PAYROLL_MANAGE),
  getEmployeeSalaryHistory
);

router.post(
  '/employee/:id',
  authenticate,
  requirePermission(Permission.PAYROLL_MANAGE),
  createSalaryRecord
);

router.put(
  '/record/:id',
  authenticate,
  requirePermission(Permission.PAYROLL_MANAGE),
  updateSalaryRecord
);

export default router;
