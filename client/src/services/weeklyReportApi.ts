import api from './api';
import type { User } from '../types/auth.types';
import type { Team } from './teamsApi';

export interface WeeklyReportMetrics {
  tasksCompleted: number;
  tasksPending: number;
  overdueTasks: number;
  completionRate: number;
}

export interface WeeklyReport {
  _id: string;
  team: string | Team;
  teamLead: string | User;
  weekStartDate: string;
  weekEndDate: string;
  
  achievements: string;
  completedWork: string;
  incompleteWork: string;
  blockers: string;
  employeeContributions: string;
  goals: string;
  missedGoals: string;
  nextWeekPriorities: string;
  risks: string;
  notes?: string;
  
  metrics: WeeklyReportMetrics;
  status: 'Submitted';
  createdAt: string;
  updatedAt: string;
}

export const weeklyReportApi = {
  getReportMetrics: async (teamId: string, startDate: string, endDate: string): Promise<WeeklyReportMetrics> => {
    const response = await api.get('/weekly-report/metrics', {
      params: { teamId, startDate, endDate }
    });
    return response.data.data.metrics;
  },

  createWeeklyReport: async (data: Partial<WeeklyReport>): Promise<WeeklyReport> => {
    const response = await api.post('/weekly-report', data);
    return response.data.data.report;
  },

  updateWeeklyReport: async (id: string, data: Partial<WeeklyReport>): Promise<WeeklyReport> => {
    const response = await api.put(`/weekly-report/${id}`, data);
    return response.data.data.report;
  },

  getTeamReports: async (teamId: string): Promise<WeeklyReport[]> => {
    const response = await api.get(`/weekly-report/team/${teamId}`);
    return response.data.data.reports;
  },

  getAllReports: async (): Promise<WeeklyReport[]> => {
    const response = await api.get('/weekly-report/all');
    return response.data.data.reports;
  },

  getWeeklyReport: async (id: string): Promise<WeeklyReport> => {
    const response = await api.get(`/weekly-report/${id}`);
    return response.data.data.report;
  }
};
