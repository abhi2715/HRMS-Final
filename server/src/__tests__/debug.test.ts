import { describe, it, expect } from 'vitest';
import { createTestUser, createTestTeam, authPost, authPut } from './helpers/index';
import { UserRole, TaskStatus } from '../../../shared/types/enums';

describe('Debug Task Creation', () => {
  it('should print task failure', async () => {
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
    
    console.log("Task create status:", res.status);
    console.log("Task create body:", res.body);
    
    expect(res.status).toBe(201);
  });
  
  it('should print IDOR failure', async () => {
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

    const hackRes = await authPut(`/tasks/${taskId}`, emp2.accessToken, {
      status: TaskStatus.COMPLETED,
    });
    console.log("Hack status:", hackRes.status);
    console.log("Hack body:", hackRes.body);
    expect(hackRes.status).toBe(403);
  });
});
