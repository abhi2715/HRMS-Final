import api from './api';

export interface AuditLog {
  _id: string;
  actor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
}

export const auditApi = {
  getAuditLogs: async (params: GetAuditLogsParams): Promise<{ logs: AuditLog[], pagination: AuditPagination }> => {
    const response = await api.get('/audit', { params });
    return response.data.data;
  },
};
