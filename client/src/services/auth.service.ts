import api from './api';
import type {
  LoginRequest,
  AuthResponse,
  RefreshResponse,
  MeResponse,
  ChangePasswordRequest,
  CreateUserRequest,
} from '../types/auth.types';

/**
 * Auth API service — all auth-related HTTP calls.
 */
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  refresh: () =>
    api.post<RefreshResponse>('/auth/refresh'),

  logout: () =>
    api.post('/auth/logout'),

  logoutAll: () =>
    api.post('/auth/logout-all'),

  getMe: () =>
    api.get<MeResponse>('/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    api.put('/auth/password', data),

  createUser: (data: CreateUserRequest) =>
    api.post('/auth/users', data),

  deactivateUser: (userId: string) =>
    api.patch(`/auth/users/${userId}/deactivate`),

  activateUser: (userId: string) =>
    api.patch(`/auth/users/${userId}/activate`),
};
