import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import User from '../models/User.model';
import Team from '../models/Team.model';
import Task from '../models/Task.model';
import Leave from '../models/Leave.model';
import Attendance from '../models/Attendance.model';
import Payroll from '../models/Payroll.model';
import DailyProgress from '../models/DailyProgress.model';
import { UserRole } from '../../../shared/types/enums';

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
    await Payroll.deleteMany({});
    await DailyProgress.deleteMany({});

    const password = 'Password123!';
    const domain = 'astrovanta.com';
    const currency = 'INR';

    // Helper to get past dates
    const getPastDate = (daysAgo: number) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    // Create Admin
    console.log('Creating Admin...');
    const admin = await User.create({
      firstName: 'Amit',
      lastName: 'Sharma',
      email: `admin@${domain}`,
      password,
      role: UserRole.ADMIN,
      jobTitle: 'System Administrator',
    });

    // Create CEO
    console.log('Creating CEO...');
    const ceo = await User.create({
      firstName: 'Priya',
      lastName: 'Patel',
      email: `ceo@${domain}`,
      password,
      role: UserRole.CEO,
      jobTitle: 'Chief Executive Officer',
      salary: 5000000,
    });

    console.log('Creating Teams & Leads & Employees...');
    const departments = [
      { name: 'Engineering', leadFirst: 'Rahul', leadLast: 'Verma', employees: ['Sneha Gupta', 'Vikram Singh', 'Neha Reddy', 'Kavita Iyer', 'Arvind Menon'] },
      { name: 'Marketing', leadFirst: 'Suresh', leadLast: 'Kumar', employees: ['Anjali Desai', 'Pooja N', 'Sunita R', 'Karan Johar', 'Aisha Khan'] },
      { name: 'Sales', leadFirst: 'Rohit', leadLast: 'Joshi', employees: ['Manoj Tiwari', 'Deepak Chahar', 'Nitin Gadkari', 'Swati Maliwal', 'Ajay Devgn'] }
    ];

    const allUsers = [admin, ceo];

    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];
      const deptLower = dept.name.toLowerCase();
      
      // Create Team Lead
      const lead = await User.create({
        firstName: dept.leadFirst,
        lastName: dept.leadLast,
        email: `lead.${deptLower}@${domain}`,
        password,
        role: UserRole.TEAM_LEAD,
        jobTitle: `${dept.name} Manager`,
        salary: 2500000,
      });
      allUsers.push(lead);

      // Create Team
      const team = await Team.create({
        name: `${dept.name} Team`,
        description: `The ${dept.name} department of Astrovanta`,
        lead: lead._id,
      });

      // Update lead with team ID
      lead.team = team._id;
      await lead.save();

      // Create Employees
      for (let j = 0; j < dept.employees.length; j++) {
        const [first, last] = dept.employees[j].split(' ');
        const emp = await User.create({
          firstName: first,
          lastName: last,
          email: `employee${j + 1}.${deptLower}@${domain}`,
          password,
          role: UserRole.EMPLOYEE,
          jobTitle: `${dept.name} Specialist`,
          team: team._id,
          salary: 800000 + (j * 100000),
        });
        allUsers.push(emp);
      }
    }

    console.log('Generating Tasks, Attendance, Leaves, Payroll, and Progress...');
    
    // Add fake data for everyone
    for (const user of allUsers) {
      // 1. Attendance (Last 5 days)
      for (let i = 1; i <= 5; i++) {
        const date = getPastDate(i);
        // Only mark attendance on weekdays
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          const checkIn = new Date(date);
          checkIn.setHours(9, Math.floor(Math.random() * 30), 0);
          
          const checkOut = new Date(date);
          checkOut.setHours(17, 30 + Math.floor(Math.random() * 60), 0);
          
          await Attendance.create({
            user: user._id,
            date: date,
            checkIn: checkIn,
            checkOut: checkOut,
            status: 'present'
          });
        }
      }

      // 2. Tasks
      await Task.create({
        title: `Complete weekly report for ${user.firstName}`,
        description: 'Ensure all metrics are updated.',
        assignedTo: user._id,
        assigner: admin._id,
        createdBy: admin._id,
        status: 'in_progress',
        priority: 'high',
        dueDate: getPastDate(-3), // Due in 3 days
      });
      await Task.create({
        title: 'Review Q3 Objectives',
        description: 'Review the goals set for Q3 and align with the team.',
        assignedTo: user._id,
        assigner: admin._id,
        createdBy: admin._id,
        status: 'assigned',
        priority: 'medium',
        dueDate: getPastDate(-7),
      });

      // 3. Leaves
      await Leave.create({
        user: user._id,
        type: 'sick',
        startDate: getPastDate(10),
        endDate: getPastDate(9),
        reason: 'Viral fever',
        status: 'approved',
        approvedBy: admin._id
      });
      await Leave.create({
        user: user._id,
        type: 'casual',
        startDate: getPastDate(-15),
        endDate: getPastDate(-13),
        reason: 'Family function',
        status: 'pending',
      });

      // 4. Payroll (SalaryRecord)
      if (user.salary) {
        await Payroll.create({
          employee: user._id,
          effectiveDate: getPastDate(15), // Last month roughly
          baseSalary: Math.round(user.salary / 12),
          bonus: 5000,
          deductions: 1000,
          allowances: 0,
          notes: 'Standard monthly salary',
          createdBy: admin._id
        });
      }

      // 5. Daily Progress
      if (user.role === UserRole.EMPLOYEE || user.role === UserRole.TEAM_LEAD) {
        await DailyProgress.create({
          employee: user._id,
          date: getPastDate(1),
          tasksCompleted: 'Finished the API integration and updated the docs.',
          blockers: 'None',
          nextDayPlan: 'Will start working on the UI dashboard tomorrow.',
          status: 'submitted'
        });
      }
    }

    console.log('✅ Database successfully populated with Astrovanta sample data!');
    console.log('\n--- Login Credentials ---');
    console.log('Password for all users: Password123!');
    console.log('Admin: admin@astrovanta.com');
    console.log('CEO: ceo@astrovanta.com');
    console.log('Leads: lead.engineering@astrovanta.com, lead.marketing@astrovanta.com, lead.sales@astrovanta.com');
    console.log('Employees: employee1.engineering@astrovanta.com ... (up to 5 per department)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
};

populate();
