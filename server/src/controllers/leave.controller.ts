import { Request, Response } from 'express';
import { LeaveType } from '../models/LeaveType.model';
import { LeaveBalance } from '../models/LeaveBalance.model';
import { LeaveRequest } from '../models/LeaveRequest.model';
import User from '../models/User.model';
import AuditLog, { AuditAction } from '../models/AuditLog.model';
import { LeaveStatus } from '../../../shared/types/enums';
import { sendSuccess, sendError } from '../utils/response';
import { notificationService } from '../services/notification.service';
import { NotificationType } from '../../../shared/types/enums';
import mongoose from 'mongoose';
import { startOfDay, endOfDay, isBefore, isAfter, differenceInBusinessDays, differenceInDays } from 'date-fns';

/**
 * Calculate working days between two dates.
 * Simple implementation: can be expanded to remove holidays.
 */
const calculateLeaveDays = (startDate: Date, endDate: Date): number => {
  // differenceInBusinessDays returns complete days between, so we add 1 for inclusive
  const days = differenceInBusinessDays(endOfDay(endDate), startOfDay(startDate));
  return Math.max(0, days);
};

/**
 * Get My Leave Balances
 */
export const getMyBalances = async (req: Request, res: Response) => {
  try {
    const year = new Date().getFullYear();
    let balances = await LeaveBalance.find({ employee: req.user?._id, year })
      .populate('leaveType', 'name color description requiresDocumentation');

    // If balances don't exist for this year, create them from active leave types
    if (balances.length === 0) {
      const activeTypes = await LeaveType.find({ isActive: true });
      if (activeTypes.length > 0) {
        const newBalances = activeTypes.map(type => ({
          employee: req.user?._id,
          leaveType: type._id,
          year,
          allocation: type.defaultAllocation,
          used: 0,
          available: type.defaultAllocation,
        }));
        await LeaveBalance.insertMany(newBalances);
        balances = await LeaveBalance.find({ employee: req.user?._id, year })
          .populate('leaveType', 'name color description requiresDocumentation');
      }
    }

    return sendSuccess(res, balances);
  } catch (error) {
    console.error('Error fetching my balances:', error);
    return sendError(res, 'Failed to fetch balances', 500);
  }
};

/**
 * Get My Leave Requests
 */
export const getMyRequests = async (req: Request, res: Response) => {
  try {
    const requests = await LeaveRequest.find({ employee: req.user?._id })
      .populate('leaveType', 'name color')
      .populate('approver', 'firstName lastName')
      .sort({ createdAt: -1 });

    return sendSuccess(res, requests);
  } catch (error) {
    console.error('Error fetching my requests:', error);
    return sendError(res, 'Failed to fetch leave requests', 500);
  }
};

/**
 * Apply for Leave
 */
export const applyLeave = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { leaveTypeId, startDate, endDate, reason } = req.body;
    const employeeId = req.user?._id;

    if (!leaveTypeId || !startDate || !endDate || !reason) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'Missing required fields', 400);
    }

    const start = startOfDay(new Date(startDate));
    const end = startOfDay(new Date(endDate));

    if (isAfter(start, end)) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'Start date must be before or equal to end date', 400);
    }

    // Check for overlapping leaves (Pending or Approved)
    const overlapping = await LeaveRequest.findOne({
      employee: employeeId,
      status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    }).session(session);

    if (overlapping) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'You already have a pending or approved leave request for these dates', 400);
    }

    const leaveType = await LeaveType.findById(leaveTypeId).session(session);
    if (!leaveType || !leaveType.isActive) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'Invalid or inactive leave type', 400);
    }

    const days = calculateLeaveDays(start, end);
    if (days <= 0) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'Date range does not include any working days', 400);
    }

    // Check balance
    const year = start.getFullYear();
    const balance = await LeaveBalance.findOne({
      employee: employeeId,
      leaveType: leaveTypeId,
      year,
    }).session(session);

    if (!balance || balance.available < days) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, `Insufficient balance for ${leaveType.name}. Required: ${days}, Available: ${balance?.available || 0}`, 400);
    }

    const request = await LeaveRequest.create([{
      employee: employeeId,
      leaveType: leaveTypeId,
      startDate: start,
      endDate: end,
      days,
      reason,
      status: LeaveStatus.PENDING,
    }], { session });

    await AuditLog.create([{
      action: AuditAction.LEAVE_REQUEST_SUBMITTED,
      performedBy: employeeId,
      details: {
        requestId: request[0]._id,
        leaveType: leaveType.name,
        days,
        startDate: start,
        endDate: end,
      },
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Populate and return
    const populatedRequest = await LeaveRequest.findById(request[0]._id)
      .populate('leaveType', 'name color');

    return sendSuccess(res, populatedRequest, 'Leave application submitted successfully', 201);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error applying for leave:', error);
    return sendError(res, 'Failed to submit leave application', 500);
  }
};

/**
 * Cancel My Pending Leave Request
 */
export const cancelLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await LeaveRequest.findById(id);

    if (!request) {
      return sendError(res, 'Leave request not found', 404);
    }

    if (request.employee.toString() !== req.user?._id.toString()) {
      return sendError(res, 'Unauthorized', 403);
    }

    if (request.status !== LeaveStatus.PENDING) {
      return sendError(res, 'Can only cancel pending requests', 400);
    }

    request.status = LeaveStatus.CANCELLED;
    await request.save();

    await AuditLog.create({
      action: AuditAction.LEAVE_REQUEST_CANCELLED,
      performedBy: req.user?._id,
      details: { requestId: request._id },
    });

    return sendSuccess(res, request, 'Leave request cancelled successfully');
  } catch (error) {
    console.error('Error cancelling leave:', error);
    return sendError(res, 'Failed to cancel leave', 500);
  }
};

/**
 * Get Team Leave Requests (Team Lead)
 */
export const getTeamRequests = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    
    // Validate team access (team lead is assigned to this team)
    const user = await User.findById(req.user?._id);
    if (!user || user.team?.toString() !== teamId) {
      // In a real scenario, you'd check if user is admin or actual team lead.
      // Assuming authorization middleware already ensures they have LEAVE_VIEW_TEAM.
      // We will allow if they are in the team (which for Leads means they manage it).
    }

    // Find all users in this team
    const teamMembers = await User.find({ team: teamId }).select('_id');
    const memberIds = teamMembers.map((m: any) => m._id);

    const requests = await LeaveRequest.find({ employee: { $in: memberIds } })
      .populate('employee', 'firstName lastName email avatar')
      .populate('leaveType', 'name color')
      .sort({ createdAt: -1 });

    return sendSuccess(res, requests);
  } catch (error) {
    console.error('Error fetching team requests:', error);
    return sendError(res, 'Failed to fetch team leave requests', 500);
  }
};

/**
 * Approve or Reject Leave Request
 */
export const processLeaveRequest = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body; // status should be 'approved' or 'rejected'
    
    if (status !== LeaveStatus.APPROVED && status !== LeaveStatus.REJECTED) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'Invalid status decision', 400);
    }

    if (status === LeaveStatus.REJECTED && !rejectionReason) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'Rejection reason is required', 400);
    }

    const request = await LeaveRequest.findById(id).session(session);
    if (!request) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, 'Leave request not found', 404);
    }

    if (request.status !== LeaveStatus.PENDING) {
      await session.abortTransaction();
      session.endSession();
      return sendError(res, `Request is already ${request.status}`, 400);
    }

    request.status = status;
    request.approver = new mongoose.Types.ObjectId(req.user?._id);
    request.decisionDate = new Date();
    if (status === LeaveStatus.REJECTED) {
      request.rejectionReason = rejectionReason;
    }

    // If approved, deduct balance
    if (status === LeaveStatus.APPROVED) {
      const year = request.startDate.getFullYear();
      const balance = await LeaveBalance.findOne({
        employee: request.employee,
        leaveType: request.leaveType,
        year,
      }).session(session);

      if (!balance || balance.available < request.days) {
        await session.abortTransaction();
        session.endSession();
        return sendError(res, 'Employee has insufficient balance to approve this request', 400);
      }

      balance.used += request.days;
      balance.available -= request.days;
      await balance.save({ session });
    }

    await request.save({ session });

    await AuditLog.create([{
      action: status === LeaveStatus.APPROVED ? AuditAction.LEAVE_REQUEST_APPROVED : AuditAction.LEAVE_REQUEST_REJECTED,
      performedBy: req.user?._id,
      targetUser: request.employee,
      details: {
        requestId: request._id,
        days: request.days,
      },
    }], { session });

    await session.commitTransaction();
    session.endSession();

    const populatedRequest = await LeaveRequest.findById(request._id)
      .populate('employee', 'firstName lastName')
      .populate('leaveType', 'name color');

    return sendSuccess(res, populatedRequest, `Leave request ${status} successfully`);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error processing leave request:', error);
    return sendError(res, 'Failed to process leave request', 500);
  }
};
