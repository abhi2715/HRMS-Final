const request = require('supertest');
const { app, createTestUser } = require('./src/__tests__/helpers/index');
const { UserRole } = require('../shared/types/enums');
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms-test');
  
  const admin = await createTestUser({ role: UserRole.ADMIN });
  console.log("Admin token:", admin.accessToken.substring(0, 20) + "...");
  
  const res = await request(app)
    .post('/api/v1/teams')
    .set('Authorization', `Bearer ${admin.accessToken}`)
    .send({ name: 'Engineering' });
    
  console.log("Team creation status:", res.status);
  console.log("Team creation body:", res.body);
  
  await mongoose.disconnect();
}

run().catch(console.error);
