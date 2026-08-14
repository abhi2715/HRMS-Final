import api from './api';
import type { Task } from './tasksApi';
import type { User } from '../types/auth.types';

export interface EmployeeDashboardStats {
  overview: {
    activeTasks: number;
    overdueTasks: number;
    todayAttendanceStatus: string;
    pendingLeaves: number;
  };
  recentTasks: Task[];
}

export interface EmployeeProfile extends User {
  salary?: number;
  joiningDate?: string;
  teamLead?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const employeeApi = {
  getDashboard: async (): Promise<EmployeeDashboardStats> => {
    const response = await api.get('/employee/dashboard');
    return response.data;
  },

  getProfile: async (): Promise<EmployeeProfile> => {
    const response = await api.get('/employee/profile');
    return response.data;
  },
};
