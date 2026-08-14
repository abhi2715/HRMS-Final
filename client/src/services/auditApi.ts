import api from './api';
import type { PaginatedResponse } from './usersApi';
import type { AuditLog } from './organizationApi';

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
}

export const auditApi = {
  getLogs: async (params?: GetAuditLogsParams): Promise<PaginatedResponse<AuditLog>> => {
    const response = await api.get('/audit-logs', { params });
    return response.data;
  },
};
