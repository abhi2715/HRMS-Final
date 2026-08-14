import api from './api';
import type { User } from '../types/auth.types';
import type { Task } from './tasksApi';
import type { Team } from './teamsApi';
import { DailyProgressStatus } from '../../../shared/types/enums';

export interface DailyProgressRecord {
  _id: string;
  employee: User;
  team: Team;
  date: string;
  tasksWorkedOn: Task[];
  workCompleted?: string;
  progress?: string;
  blockers?: string;
  notes?: string;
  attachments: string[];
  status: DailyProgressStatus;
  submittedAt?: string;
  lockedAt?: string;
  lockedBy?: string;
  lastEditedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetMyProgressParams {
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface GetTeamProgressParams {
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface SubmitProgressPayload {
  date: string;
  tasksWorkedOn?: string[];
  workCompleted?: string;
  progress?: string;
  blockers?: string;
  notes?: string;
  attachments?: string[];
  status: DailyProgressStatus;
}

export interface OrgSummary {
  totalEmployees: number;
  submittedCount: number;
  missedCount: number;
  blockedCount: number;
  rate: number;
  teamStats: {
    teamId: string;
    teamName: string;
    submitted: number;
    total: number;
    rate: number;
    blocked: number;
  }[];
}

export const dailyProgressApi = {
  submitProgress: async (payload: SubmitProgressPayload): Promise<DailyProgressRecord> => {
    const response = await api.post('/daily-progress', payload);
    return response.data;
  },

  getMyProgress: async (params?: GetMyProgressParams): Promise<DailyProgressRecord[]> => {
    const response = await api.get('/daily-progress/my', { params });
    return response.data;
  },

  getTodayProgress: async (): Promise<DailyProgressRecord | null> => {
    const response = await api.get('/daily-progress/today');
    return response.data;
  },

  getTeamProgress: async (teamId: string, params?: GetTeamProgressParams): Promise<DailyProgressRecord[]> => {
    const response = await api.get(`/daily-progress/team/${teamId}`, { params });
    return response.data;
  },

  getTeamMissed: async (teamId: string, date: string): Promise<User[]> => {
    const response = await api.get(`/daily-progress/team/${teamId}/missed`, { params: { date } });
    return response.data;
  },

  getTeamBlocked: async (teamId: string, params?: GetTeamProgressParams): Promise<DailyProgressRecord[]> => {
    const response = await api.get(`/daily-progress/team/${teamId}/blocked`, { params });
    return response.data;
  },

  getOrganizationProgress: async (params?: { startDate?: string; endDate?: string; teamId?: string }): Promise<DailyProgressRecord[]> => {
    const response = await api.get('/daily-progress/organization', { params });
    return response.data;
  },

  getOrganizationSummary: async (date?: string): Promise<OrgSummary> => {
    const response = await api.get('/daily-progress/organization/summary', { params: { date } });
    return response.data;
  },

  lockProgress: async (id: string): Promise<DailyProgressRecord> => {
    const response = await api.put(`/daily-progress/${id}/lock`);
    return response.data;
  }
};
