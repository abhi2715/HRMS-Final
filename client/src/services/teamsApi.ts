import api from './api';
import type { User } from '../types/auth.types';

export interface Team {
  _id: string;
  name: string;
  description?: string;
  manager?: User;
  isActive: boolean;
  memberCount?: number;
  members?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamPayload {
  name: string;
  description?: string;
  manager?: string;
}

export interface UpdateTeamPayload {
  name?: string;
  description?: string;
  manager?: string | null;
  isActive?: boolean;
}

export const teamsApi = {
  getTeams: async (params?: { search?: string; isActive?: boolean }): Promise<Team[]> => {
    const response = await api.get('/teams', { params });
    return response.data;
  },

  getTeamById: async (id: string): Promise<Team> => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  createTeam: async (payload: CreateTeamPayload): Promise<Team> => {
    const response = await api.post('/teams', payload);
    return response.data;
  },

  updateTeam: async (id: string, payload: UpdateTeamPayload): Promise<Team> => {
    const response = await api.put(`/teams/${id}`, payload);
    return response.data;
  },
};
