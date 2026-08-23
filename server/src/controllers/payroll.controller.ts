import { Request, Response } from 'express';
import SalaryRecord from '../models/Payroll.model';
import User from '../models/User.model';
import AuditLog from '../models/AuditLog.model';
import { sendSuccess, sendError } from '../utils/response';
import { logAudit } from '../services/audit.service';
import { AuditAction } from '../models/AuditLog.model';

export const getMySalaryHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const records = await SalaryRecord.find({ employee: userId }).sort({ effectiveDate: -1 });

    sendSuccess(res, { records }, 'Salary history retrieved', 200);
  } catch (error) {
    sendError(res, 'Error retrieving salary history', 500);
  }
};

export const getOrgPayrollSummary = async (req: Request, res: Response) => {
  try {
    // Find the latest active salary record per employee using aggregation
    const activeEmployees = await User.find({ isActive: true }).select('_id firstName lastName jobTitle');
    const records = await SalaryRecord.aggregate([
      { $sort: { employee: 1, effectiveDate: -1 } },
      {
        $group: {
          _id: '$employee',
          latestRecord: { $first: '$$ROOT' }
        }
      }
    ]);

    const recordMap = new Map();
    records.forEach(r => recordMap.set(r._id.toString(), r.latestRecord));

    const summary = activeEmployees.map(emp => {
      const record = recordMap.get(emp._id.toString());
      return {
        employee: emp,
        currentSalary: record || null
      };
    });

    sendSuccess(res, { summary }, 'Organization payroll summary retrieved', 200);
  } catch (error) {
    console.error('getOrgPayrollSummary error:', error);
    sendError(res, 'Error retrieving organization payroll summary', 500);
  }
};

export const getEmployeeSalaryHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id).select('firstName lastName email jobTitle');
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const records = await SalaryRecord.find({ employee: id })
      .populate('createdBy', 'firstName lastName')
      .sort({ effectiveDate: -1 });

    sendSuccess(res, { employee, records }, 'Employee salary history retrieved', 200);
  } catch (error) {
    sendError(res, 'Error retrieving employee salary history', 500);
  }
};

export const createSalaryRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // employee ID
    const { effectiveDate, baseSalary, allowances, deductions, bonus, notes } = req.body;
    const creatorId = req.user?.id;

    if (!effectiveDate || baseSalary === undefined) {
      return sendError(res, 'Effective date and base salary are required', 400);
    }

    const employee = await User.findById(id);
    if (!employee) {
      return sendError(res, 'Employee not found', 404);
    }

    const newRecord = new SalaryRecord({
      employee: id,
      effectiveDate,
      baseSalary,
      allowances: allowances || 0,
      deductions: deductions || 0,
      bonus: bonus || 0,
      notes,
      createdBy: creatorId
    });

    await newRecord.save();

    await AuditLog.create({
      action: AuditAction.PAYROLL_CREATED,
      actor: creatorId,
      entity: 'SalaryRecord',
      entityId: newRecord._id,
      metadata: { employeeId: id, effectiveDate, details: `Created new salary record effective ${effectiveDate}` },
    });

    sendSuccess(res, { record: newRecord }, 'Salary record created', 201);
  } catch (error: any) {
    if (error.code === 11000) {
      return sendError(res, 'A salary record already exists for this effective date', 400);
    }
    console.error('createSalaryRecord error:', error);
    sendError(res, 'Error creating salary record', 500);
  }
};

export const updateSalaryRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // record ID
    const { baseSalary, allowances, deductions, bonus, notes } = req.body;
    const creatorId = req.user?.id;

    const record = await SalaryRecord.findById(id);
    if (!record) {
      return sendError(res, 'Salary record not found', 404);
    }

    record.baseSalary = baseSalary ?? record.baseSalary;
    record.allowances = allowances ?? record.allowances;
    record.deductions = deductions ?? record.deductions;
    record.bonus = bonus ?? record.bonus;
    if (notes !== undefined) record.notes = notes;

    await record.save();

    await AuditLog.create({
      action: AuditAction.PAYROLL_MODIFIED,
      actor: creatorId,
      entity: 'SalaryRecord',
      entityId: record._id,
      metadata: { employeeId: record.employee, details: `Updated salary record ID: ${id}` },
    });

    sendSuccess(res, { record }, 'Salary record updated', 200);
  } catch (error) {
    sendError(res, 'Error updating salary record', 500);
  }
};
