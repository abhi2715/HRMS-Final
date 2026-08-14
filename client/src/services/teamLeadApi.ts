import api from './api';
import type { User } from '../types/auth.types';
import type { AuditLog } from './organizationApi';
import type { TaskStatus } from './tasksApi';

export interface TeamLeadDashboardStats {
  teamOverview: {
    name: string;
    totalMembers: number;
    activeMembers: number;
    pendingLeaves: number;
    todayAttendance: number;
  };
  taskOverview: {
    total: number;
    completed: number;
    overdue: number;
    avgProgress: number;
    byStatus: Record<TaskStatus, number>;
  };
  ceoTasks: {
    total: number;
    completed: number;
  };
  recentActivity: AuditLog[];
}

export interface TeamMember extends User {
  activeTasks: number;
}

export const teamLeadApi = {
  getDashboard: async (): Promise<TeamLeadDashboardStats> => {
    const response = await api.get('/team-lead/dashboard');
    return response.data;
  },
  
  getMembers: async (): Promise<TeamMember[]> => {
    const response = await api.get('/team-lead/members');
    return response.data;
  },
};
