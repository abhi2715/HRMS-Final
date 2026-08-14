import { Request, Response } from 'express';
import { LeaveType } from '../models/LeaveType.model';
import { LeaveBalance } from '../models/LeaveBalance.model';
import AuditLog, { AuditAction } from '../models/AuditLog.model';
import { sendSuccess, sendError } from '../utils/response';

/**
 * Configure a new Leave Type
 */
export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const { name, description, defaultAllocation, requiresDocumentation, color } = req.body;

    const existingType = await LeaveType.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingType) {
      return sendError(res, 'Leave type with this name already exists', 400);
    }

    const leaveType = await LeaveType.create({
      name,
      description,
      defaultAllocation,
      requiresDocumentation,
      color,
    });

    await AuditLog.create({
      action: AuditAction.LEAVE_TYPE_CREATED,
      performedBy: req.user?._id,
      details: {
        leaveTypeId: leaveType._id,
        name: leaveType.name,
      },
    });

    return sendSuccess(res, leaveType, 'Leave type created successfully', 201);
  } catch (error) {
    console.error('Error creating leave type:', error);
    return sendError(res, 'Failed to create leave type', 500);
  }
};

/**
 * Get all Leave Types
 */
export const getLeaveTypes = async (req: Request, res: Response) => {
  try {
    const types = await LeaveType.find().sort({ name: 1 });
    return sendSuccess(res, types);
  } catch (error) {
    console.error('Error fetching leave types:', error);
    return sendError(res, 'Failed to fetch leave types', 500);
  }
};

/**
 * Update a Leave Type
 */
export const updateLeaveType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, defaultAllocation, requiresDocumentation, color, isActive } = req.body;

    const leaveType = await LeaveType.findById(id);
    if (!leaveType) {
      return sendError(res, 'Leave type not found', 404);
    }

    // Check name uniqueness if changed
    if (name && name.toLowerCase() !== leaveType.name.toLowerCase()) {
      const existing = await LeaveType.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existing) {
        return sendError(res, 'Leave type with this name already exists', 400);
      }
    }

    leaveType.name = name ?? leaveType.name;
    leaveType.description = description ?? leaveType.description;
    leaveType.defaultAllocation = defaultAllocation ?? leaveType.defaultAllocation;
    leaveType.requiresDocumentation = requiresDocumentation ?? leaveType.requiresDocumentation;
    leaveType.color = color ?? leaveType.color;
    if (isActive !== undefined) leaveType.isActive = isActive;

    await leaveType.save();

    await AuditLog.create({
      action: AuditAction.LEAVE_TYPE_UPDATED,
      performedBy: req.user?._id,
      details: {
        leaveTypeId: leaveType._id,
        name: leaveType.name,
        isActive: leaveType.isActive,
      },
    });

    return sendSuccess(res, leaveType, 'Leave type updated successfully');
  } catch (error) {
    console.error('Error updating leave type:', error);
    return sendError(res, 'Failed to update leave type', 500);
  }
};

/**
 * Get balances for all employees (Admin view)
 */
export const getAllBalances = async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();

    const balances = await LeaveBalance.find({ year })
      .populate('employee', 'firstName lastName email employeeId')
      .populate('leaveType', 'name color')
      .sort({ 'employee': 1 });

    return sendSuccess(res, balances);
  } catch (error) {
    console.error('Error fetching all balances:', error);
    return sendError(res, 'Failed to fetch balances', 500);
  }
};

/**
 * Update an employee's leave balance manually
 */
export const updateBalance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { allocation, used } = req.body;

    const balance = await LeaveBalance.findById(id).populate('employee', 'firstName lastName');
    if (!balance) {
      return sendError(res, 'Leave balance record not found', 404);
    }

    const originalAllocation = balance.allocation;
    const originalUsed = balance.used;

    if (allocation !== undefined) balance.allocation = allocation;
    if (used !== undefined) balance.used = used;

    await balance.save();

    await AuditLog.create({
      action: AuditAction.LEAVE_BALANCE_ADJUSTED,
      performedBy: req.user?._id,
      targetUser: balance.employee._id,
      details: {
        balanceId: balance._id,
        leaveType: balance.leaveType,
        originalAllocation,
        newAllocation: balance.allocation,
        originalUsed,
        newUsed: balance.used,
      },
    });

    return sendSuccess(res, balance, 'Balance updated successfully');
  } catch (error) {
    console.error('Error updating balance:', error);
    return sendError(res, 'Failed to update balance', 500);
  }
};
