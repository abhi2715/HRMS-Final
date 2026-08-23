import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import User from '../models/User.model';
import Team from '../models/Team.model';
import Task from '../models/Task.model';
import Leave from '../models/Leave.model';
import Attendance from '../models/Attendance.model';
import { UserRole } from '../../../shared/types/enums';

dotenv.config({ path: path.join(__dirname, '../../.env') }); // This is for server/.env relative to src/seed/populate.ts

dotenv.config({ path: path.join(__dirname, '../../.env') });

const populate = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI is not defined in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Wipe existing data
    console.log('Wiping existing data...');
    await User.deleteMany({});
    await Team.deleteMany({});
    await Task.deleteMany({});
    await Leave.deleteMany({});
    await Attendance.deleteMany({});

    const password = 'Password123!';

    // Create Admin
    console.log('Creating Admin...');
    await User.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@company.com',
      password,
      role: UserRole.ADMIN,
      jobTitle: 'System Administrator',
    });

    // Create CEO
    console.log('Creating CEO...');
    await User.create({
      firstName: 'Chief',
      lastName: 'Executive',
      email: 'ceo@company.com',
      password,
      role: UserRole.CEO,
      jobTitle: 'Chief Executive Officer',
      salary: 200000,
    });

    // Create Teams
    console.log('Creating Teams & Leads & Employees...');
    const departments = ['Engineering', 'Marketing', 'Sales'];
    
    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      const deptLower = dept.toLowerCase();
      
      // Create Team Lead
      const lead = await User.create({
        firstName: `${dept}`,
        lastName: 'Lead',
        email: `lead.${deptLower}@company.com`,
        password,
        role: UserRole.TEAM_LEAD,
        jobTitle: `${dept} Manager`,
        salary: 120000,
      });

      // Create Team
      const team = await Team.create({
        name: `${dept} Team`,
        description: `The ${dept} department`,
        lead: lead._id,
      });

      // Update lead with team ID
      lead.team = team._id;
      await lead.save();

      // Create 5 Employees for this team
      for (let j = 1; j <= 5; j++) {
        const emp = await User.create({
          firstName: `${dept}`,
          lastName: `Employee ${j}`,
          email: `employee${j}.${deptLower}@company.com`,
          password,
          role: UserRole.EMPLOYEE,
          jobTitle: `${dept} Specialist`,
          team: team._id,
          salary: 70000 + (j * 2000),
        });
      }
    }

    console.log('✅ Database successfully populated with sample data!');
    console.log('\n--- Login Credentials ---');
    console.log('Password for all users: Password123!');
    console.log('Admin: admin@company.com');
    console.log('CEO: ceo@company.com');
    console.log('Leads: lead.engineering@company.com, lead.marketing@company.com, lead.sales@company.com');
    console.log('Employees: employee1.engineering@company.com ... (up to 5 per department)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
};

populate();
