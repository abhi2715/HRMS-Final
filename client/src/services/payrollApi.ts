import api from './api';
import type { User } from '../types/auth.types';

export interface SalaryRecord {
  _id: string;
  employee: string | User;
  effectiveDate: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  bonus: number;
  grossSalary: number;
  netSalary: number;
  notes?: string;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface OrgPayrollSummary {
  employee: User;
  currentSalary: SalaryRecord | null;
}

export const payrollApi = {
  getMySalaryHistory: async (): Promise<SalaryRecord[]> => {
    const response = await api.get('/payroll/my-history');
    return response.data.data.records;
  },

  getOrgPayrollSummary: async (): Promise<OrgPayrollSummary[]> => {
    const response = await api.get('/payroll/org-summary');
    return response.data.data.summary;
  },

  getEmployeeSalaryHistory: async (employeeId: string): Promise<{ employee: User; records: SalaryRecord[] }> => {
    const response = await api.get(`/payroll/employee/${employeeId}`);
    return response.data.data;
  },

  createSalaryRecord: async (employeeId: string, data: Partial<SalaryRecord>): Promise<SalaryRecord> => {
    const response = await api.post(`/payroll/employee/${employeeId}`, data);
    return response.data.data.record;
  },

  updateSalaryRecord: async (recordId: string, data: Partial<SalaryRecord>): Promise<SalaryRecord> => {
    const response = await api.put(`/payroll/record/${recordId}`, data);
    return response.data.data.record;
  }
};
