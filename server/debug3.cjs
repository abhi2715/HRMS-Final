const request = require('supertest');
const { app, createTestUser, createTestTeam } = require('./src/__tests__/helpers/index');
const { UserRole } = require('../shared/types/enums');
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms-test');
  
  const team = await createTestTeam('DevTeam');
  const lead = await createTestUser({ role: UserRole.TEAM_LEAD, team: team._id.toString() });
  const emp = await createTestUser({ role: UserRole.EMPLOYEE, team: team._id.toString() });
  
  team.manager = lead.id;
  await team.save();
  
  const res = await request(app)
    .post('/api/v1/tasks')
    .set('Authorization', `Bearer ${lead.accessToken}`)
    .send({
      title: 'Fix Bug #42',
      assignedTo: emp.id,
      priority: 'medium',
    });
    
  console.log("Task create status:", res.status);
  console.log("Task create body:", res.body);
  
  await mongoose.disconnect();
}

run().catch(console.error);
