import api from './api';
import { LeaveStatus } from '../types/enums';

export interface LeaveType {
  _id: string;
  name: string;
  description: string;
  defaultAllocation: number;
  requiresDocumentation: boolean;
  color: string;
  isActive: boolean;
}

export interface LeaveBalance {
  _id: string;
  employee: any;
  leaveType: LeaveType;
  year: number;
  allocation: number;
  used: number;
  available: number;
}

export interface LeaveRequest {
  _id: string;
  employee: any;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approver?: any;
  decisionDate?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface LeaveApplicationPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export const leaveApi = {
  // Public
  getLeaveTypes: async () => {
    const res = await api.get('/leave/types');
    return res.data.data as LeaveType[];
  },

  // Employee
  getMyBalances: async () => {
    const res = await api.get('/leave/my/balances');
    return res.data.data as LeaveBalance[];
  },
  getMyRequests: async () => {
    const res = await api.get('/leave/my/requests');
    return res.data.data as LeaveRequest[];
  },
  applyLeave: async (data: LeaveApplicationPayload) => {
    const res = await api.post('/leave/apply', data);
    return res.data.data as LeaveRequest;
  },
  cancelLeave: async (id: string) => {
    const res = await api.patch(`/leave/${id}/cancel`);
    return res.data.data as LeaveRequest;
  },

  // Team Lead
  getTeamRequests: async (teamId: string) => {
    const res = await api.get(`/leave/team/${teamId}/requests`);
    return res.data.data as LeaveRequest[];
  },
  processRequest: async (id: string, status: LeaveStatus, rejectionReason?: string) => {
    const res = await api.patch(`/leave/${id}/process`, { status, rejectionReason });
    return res.data.data as LeaveRequest;
  },

  // Admin
  adminCreateType: async (data: Partial<LeaveType>) => {
    const res = await api.post('/leave/admin/types', data);
    return res.data.data as LeaveType;
  },
  adminUpdateType: async (id: string, data: Partial<LeaveType>) => {
    const res = await api.put(`/leave/admin/types/${id}`, data);
    return res.data.data as LeaveType;
  },
  adminGetBalances: async (year?: number) => {
    const res = await api.get('/leave/admin/balances', { params: { year } });
    return res.data.data as LeaveBalance[];
  },
  adminUpdateBalance: async (id: string, data: { allocation?: number; used?: number }) => {
    const res = await api.put(`/leave/admin/balances/${id}`, data);
    return res.data.data as LeaveBalance;
  },
};
