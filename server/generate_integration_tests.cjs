const fs = require('fs');
const path = require('path');

const content = `
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import User from '../models/User.model';
import Team from '../models/Team.model';
import { LeaveType } from '../models/LeaveType.model';
import { LeaveBalance } from '../models/LeaveBalance.model';
import { UserRole, TaskStatus, LeaveStatus } from '../../../shared/types/enums';
import { createTestUser, createTestTeam, authGet, authPost, authPut, authDelete } from './helpers/index';
import { addDays } from 'date-fns';

describe('Comprehensive Integration Tests', () => {

  describe('Authentication', () => {
    it('should login with valid credentials', async () => {
      const user = await createTestUser({ role: UserRole.ADMIN, email: 'admin@test.com' });
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@test.com', password: user.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid password', async () => {
      await createTestUser({ email: 'user1@test.com' });
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user1@test.com', password: 'WrongPassword!' });

      expect(res.status).toBe(401);
    });

    it('should reject deactivated user', async () => {
      const email = 'deactivated@test.com';
      await User.create({
        firstName: 'Dead', lastName: 'User', email, password: 'Test@1234',
        role: UserRole.EMPLOYEE, isActive: false,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'Test@1234' });

      expect(res.status).toBe(401);
    });

    it('should logout successfully', async () => {
      const user = await createTestUser({ role: UserRole.EMPLOYEE });
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', \`Bearer \${user.accessToken}\`);

      expect(res.status).toBe(200);
    });

    it('should reject requests without a token', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(401);
    });
  });

  describe('RBAC & Organization', () => {
    it('Admin can list users', async () => {
      const admin = await createTestUser({ role: UserRole.ADMIN });
      const res = await authGet('/users', admin.accessToken);
      expect(res.status).toBe(200);
    });

    it('Employee cannot list users', async () => {
      const emp = await createTestUser({ role: UserRole.EMPLOYEE });
      const res = await authGet('/users', emp.accessToken);
      expect(res.status).toBe(403);
    });

    it('Admin can create a team', async () => {
      const admin = await createTestUser({ role: UserRole.ADMIN });
      const res = await authPost('/teams', admin.accessToken, { name: 'Engineering' });
      expect(res.status).toBe(201);
    });

    it('Admin can assign a Team Lead to a team', async () => {
      const admin = await createTestUser({ role: UserRole.ADMIN });
      const lead = await createTestUser({ role: UserRole.TEAM_LEAD });
      const teamRes = await authPost('/teams', admin.accessToken, { name: 'Design' });
      const teamId = teamRes.body._id || teamRes.body.data?._id;

      const res = await authPut(\`/teams/\${teamId}\`, admin.accessToken, { manager: lead.id });
      expect(res.status).toBe(200);
    });
  });

  describe('Tasks', () => {
    it('Team Lead can assign task to team member', async () => {
      const team = await createTestTeam('DevTeam');
      const lead = await createTestUser({ role: UserRole.TEAM_LEAD, team: team._id.toString() });
      const emp = await createTestUser({ role: UserRole.EMPLOYEE, team: team._id.toString() });
      team.manager = lead.id as any;
      await team.save();

      const res = await authPost('/tasks', lead.accessToken, {
        title: 'Fix Bug #42',
        assignedTo: emp.id,
        priority: 'medium',
      });
      expect(res.status).toBe(201);
    });

    it('Employee CANNOT modify another employees task (IDOR)', async () => {
      const team = await createTestTeam('SecureTeam');
      const lead = await createTestUser({ role: UserRole.TEAM_LEAD, team: team._id.toString() });
      const emp1 = await createTestUser({ role: UserRole.EMPLOYEE, team: team._id.toString() });
      const emp2 = await createTestUser({ role: UserRole.EMPLOYEE, team: team._id.toString() });
      team.manager = lead.id as any;
      await team.save();

      const taskRes = await authPost('/tasks', lead.accessToken, {
        title: 'Alice Only', assignedTo: emp1.id, priority: 'low',
      });
      const taskId = taskRes.body._id || taskRes.body.data?._id;

      const hackRes = await authPut(\`/tasks/\${taskId}\`, emp2.accessToken, {
        status: TaskStatus.COMPLETED,
      });
      expect(hackRes.status).toBe(403);
    });
  });

  describe('Attendance', () => {
    it('Employee can check in and out', async () => {
      const emp = await createTestUser({ role: UserRole.EMPLOYEE });
      const inRes = await authPost('/attendance/check-in', emp.accessToken);
      expect(inRes.status).toBe(200);

      const outRes = await authPost('/attendance/check-out', emp.accessToken);
      expect(outRes.status).toBe(200);
    });
  });

  describe('Leave Management', () => {
    it('Employee can apply for leave', async () => {
      const leaveType = await LeaveType.create({ name: 'Casual Leave', defaultAllocation: 12, isActive: true });
      const emp = await createTestUser({ role: UserRole.EMPLOYEE });
      await LeaveBalance.create({
        employee: emp.id, leaveType: leaveType._id, year: new Date().getFullYear(),
        allocation: 12, used: 0, available: 12,
      });

      const startDate = addDays(new Date(), 5);
      const endDate = addDays(new Date(), 7);

      const res = await authPost('/leave/apply', emp.accessToken, {
        leaveTypeId: leaveType._id.toString(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: 'Family event',
      });

      expect(res.status).toBe(201);
    });
  });

  describe('Payroll', () => {
    it('Employee cannot access another employees salary (IDOR)', async () => {
      const admin = await createTestUser({ role: UserRole.ADMIN });
      const emp1 = await createTestUser({ role: UserRole.EMPLOYEE });
      const emp2 = await createTestUser({ role: UserRole.EMPLOYEE });

      await authPost(\`/payroll/employee/\${emp1.id}\`, admin.accessToken, {
        effectiveDate: '2026-01-01', baseSalary: 80000,
      });

      const hackRes = await authGet(\`/payroll/employee/\${emp1.id}\`, emp2.accessToken);
      expect(hackRes.status).toBe(403);
    });
  });
});
`;

fs.writeFileSync('src/__tests__/integration.test.ts', content);
