import api from './api';
import type { AuditLog } from './organizationApi';

export interface CeoDashboardStats {
  orgOverview: {
    totalEmployees: number;
    activeEmployees: number;
    totalTeams: number;
    totalTasks: number;
  };
  taskOverview: {
    total: number;
    byStatus: {
      todo: number;
      in_progress: number;
      in_review: number;
      done: number;
    };
    overdue: number;
  };
  teamComparison: {
    teamId: string;
    teamName: string;
    totalTasks: number;
    completed: number;
    overdue: number;
    avgProgress: number;
  }[];
  alerts: string[];
  recentActivity: AuditLog[];
}

export const ceoApi = {
  getDashboard: async (): Promise<CeoDashboardStats> => {
    const response = await api.get('/ceo/dashboard');
    return response.data;
  },
};
