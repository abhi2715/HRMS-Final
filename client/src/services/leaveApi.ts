import axios from 'axios';
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

const api = axios.create({
  baseURL: '/api/v1/leave',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const leaveApi = {
  // Public
  getLeaveTypes: async () => {
    const res = await api.get('/types');
    return res.data.data as LeaveType[];
  },

  // Employee
  getMyBalances: async () => {
    const res = await api.get('/my/balances');
    return res.data.data as LeaveBalance[];
  },
  getMyRequests: async () => {
    const res = await api.get('/my/requests');
    return res.data.data as LeaveRequest[];
  },
  applyLeave: async (data: LeaveApplicationPayload) => {
    const res = await api.post('/apply', data);
    return res.data.data as LeaveRequest;
  },
  cancelLeave: async (id: string) => {
    const res = await api.patch(`/${id}/cancel`);
    return res.data.data as LeaveRequest;
  },

  // Team Lead
  getTeamRequests: async (teamId: string) => {
    const res = await api.get(`/team/${teamId}/requests`);
    return res.data.data as LeaveRequest[];
  },
  processRequest: async (id: string, status: LeaveStatus, rejectionReason?: string) => {
    const res = await api.patch(`/${id}/process`, { status, rejectionReason });
    return res.data.data as LeaveRequest;
  },

  // Admin
  adminCreateType: async (data: Partial<LeaveType>) => {
    const res = await api.post('/admin/types', data);
    return res.data.data as LeaveType;
  },
  adminUpdateType: async (id: string, data: Partial<LeaveType>) => {
    const res = await api.put(`/admin/types/${id}`, data);
    return res.data.data as LeaveType;
  },
  adminGetBalances: async (year?: number) => {
    const res = await api.get('/admin/balances', { params: { year } });
    return res.data.data as LeaveBalance[];
  },
  adminUpdateBalance: async (id: string, data: { allocation?: number; used?: number }) => {
    const res = await api.put(`/admin/balances/${id}`, data);
    return res.data.data as LeaveBalance;
  },
};
