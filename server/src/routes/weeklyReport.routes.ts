import { Router } from 'express';
import {
  getReportMetrics,
  createWeeklyReport,
  updateWeeklyReport,
  getTeamReports,
  getAllReports,
  getWeeklyReport,
} from '../controllers/weeklyReport.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

// Metrics are used during report submission by the Team Lead
router.get(
  '/metrics',
  authenticate,
  requirePermission(Permission.WEEKLY_REPORT_SUBMIT),
  getReportMetrics
);

// CEO view of all reports
router.get(
  '/all',
  authenticate,
  requirePermission(Permission.WEEKLY_REPORT_VIEW),
  getAllReports
);

// Team specific reports
router.get(
  '/team/:teamId',
  authenticate,
  requirePermission(Permission.WEEKLY_REPORT_VIEW),
  getTeamReports
);

// Single report details
router.get(
  '/:id',
  authenticate,
  requirePermission(Permission.WEEKLY_REPORT_VIEW),
  getWeeklyReport
);

// Submit a new report
router.post(
  '/',
  authenticate,
  requirePermission(Permission.WEEKLY_REPORT_SUBMIT),
  createWeeklyReport
);

// Update a report
router.put(
  '/:id',
  authenticate,
  requirePermission(Permission.WEEKLY_REPORT_SUBMIT),
  updateWeeklyReport
);

export default router;
