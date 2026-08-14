import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission, requireAnyPermission } from '../middleware/rbac.middleware';
import { Permission } from '../config/permissions';

const router = Router();

router.use(authenticate);

// Self-service
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/history', attendanceController.getMyAttendanceHistory);
router.get('/today', attendanceController.getTodayAttendance);

// Team & Organization
router.get('/team/:teamId', requireAnyPermission(Permission.ATTENDANCE_VIEW_TEAM, Permission.ATTENDANCE_VIEW_ORGANIZATION), attendanceController.getTeamAttendance);
router.get('/organization', requirePermission(Permission.ATTENDANCE_VIEW_ORGANIZATION), attendanceController.getOrganizationAttendance);

// Analytics
router.get('/summary', requirePermission(Permission.ATTENDANCE_VIEW_ORGANIZATION), attendanceController.getAttendanceSummary);
router.get('/trends', requirePermission(Permission.ATTENDANCE_VIEW_ORGANIZATION), attendanceController.getAttendanceTrends);

// Correction
router.put('/:id/correct', requirePermission(Permission.ATTENDANCE_MANAGE), attendanceController.correctAttendance);

export default router;
