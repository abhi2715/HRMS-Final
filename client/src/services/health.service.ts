import api from './api';

/**
 * Health service — verifies backend connectivity.
 */

export interface HealthResponse {
  success: boolean;
  message: string;
  data: {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
    database: {
      status: string;
      name: string;
    };
    memory: {
      used: number;
      total: number;
      unit: string;
    };
  };
}

export const healthService = {
  check: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  },
};
