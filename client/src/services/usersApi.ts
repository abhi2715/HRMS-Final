import api from './api';
import type { User, UserRole } from '../types/auth.types';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  team?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  jobTitle?: string;
  team?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  role?: UserRole;
  isActive?: boolean;
  team?: string;
}

export const usersApi = {
  getUsers: async (params?: GetUsersParams): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<User> => {
    const response = await api.post('/users', payload);
    return response.data;
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const response = await api.put(`/users/${id}`, payload);
    return response.data;
  },
};
