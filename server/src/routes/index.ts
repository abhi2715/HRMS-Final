import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import teamRoutes from './team.routes';
import organizationRoutes from './organization.routes';
import auditRoutes from './audit.routes';
import taskRoutes from './task.routes';
import ceoRoutes from './ceo.routes';
import teamLeadRoutes from './team-lead.routes';
import employeeRoutes from './employee.routes';
import attendanceRoutes from './attendance.routes';
import leaveRoutes from './leave.routes';
import dailyProgressRoutes from './dailyProgress.routes';
import payrollRoutes from './payroll.routes';
import weeklyReportRoutes from './weeklyReport.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import searchRoutes from './search.routes';
import aiRoutes from './ai.routes';

/**
 * Central route registry.
 *
 * All API routes are mounted here under the /api/v1 prefix.
 * New module routes should be imported and mounted in this file.
 */

const router = Router();

// ── Public routes ──────────────────────────────────────────
router.use('/health', healthRoutes);

// ── Auth routes ────────────────────────────────────────────
router.use('/auth', authRoutes);

// ── Protected routes ───────────────────────────────────────
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/organization', organizationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/tasks', taskRoutes);
router.use('/ceo', ceoRoutes);
router.use('/team-lead', teamLeadRoutes);
router.use('/employee', employeeRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leave', leaveRoutes);
router.use('/daily-progress', dailyProgressRoutes);
router.use('/payroll', payrollRoutes);
router.use('/weekly-report', weeklyReportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/search', searchRoutes);
router.use('/ai', aiRoutes);

export default router;

