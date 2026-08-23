const request = require('supertest');
const { app, createTestUser } = require('./src/__tests__/helpers/index');
const { UserRole } = require('../shared/types/enums');
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms-test');
  
  const emp = await createTestUser({ role: UserRole.EMPLOYEE });
  console.log("Token:", emp.accessToken.substring(0, 20) + "...");
  
  const res = await request(app)
    .post('/api/v1/attendance/check-in')
    .set('Authorization', `Bearer ${emp.accessToken}`);
    
  console.log("Check-in status:", res.status);
  console.log("Check-in body:", res.body);
  
  await mongoose.disconnect();
}

run().catch(console.error);
