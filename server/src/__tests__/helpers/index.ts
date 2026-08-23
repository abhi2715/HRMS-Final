/**
 * Test helpers — factory functions for creating users, teams, and getting auth tokens.
 */
import request from 'supertest';
import app from '../../app';
import User from '../../models/User.model';
import Team from '../../models/Team.model';
import { UserRole } from '../../../../shared/types/enums';

export { app };

export interface TestUser {
  id: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}

export async function createTestUser(overrides: {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  team?: string;
  isActive?: boolean;
} = {}): Promise<TestUser> {
  const password = overrides.password || 'Test@1234';
  const user = await User.create({
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
    email: overrides.email || `test-${Date.now()}-${Math.random().toString(36).slice(2)}@hrms.test`,
    password,
    role: overrides.role || UserRole.EMPLOYEE,
    team: overrides.team || undefined,
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
  });

  // Login to get tokens
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: user.email, password });

  return {
    id: user._id.toString(),
    email: user.email,
    password,
    accessToken: loginRes.body?.data?.accessToken || '',
    refreshToken: loginRes.headers['set-cookie']?.[0]?.match(/refreshToken=([^;]+)/)?.[1] || '',
    role: user.role as UserRole,
  };
}

export async function createTestTeam(name: string, managerId?: string) {
  const team = await Team.create({
    name,
    manager: managerId || undefined,
  });
  return team;
}

export function authGet(path: string, token: string) {
  return request(app).get(`/api/v1${path}`).set('Authorization', `Bearer ${token}`);
}

export function authPost(path: string, token: string, body?: any) {
  return request(app).post(`/api/v1${path}`).set('Authorization', `Bearer ${token}`).send(body);
}

export function authPut(path: string, token: string, body?: any) {
  return request(app).put(`/api/v1${path}`).set('Authorization', `Bearer ${token}`).send(body);
}

export function authDelete(path: string, token: string) {
  return request(app).delete(`/api/v1${path}`).set('Authorization', `Bearer ${token}`);
}
