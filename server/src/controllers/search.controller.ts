import { Request, Response } from 'express';
import User from '../models/User.model';
import Team from '../models/Team.model';
import Task from '../models/Task.model';
import WeeklyReport from '../models/WeeklyReport.model';
import { UserRole } from '../../../shared/types/enums';
import { sendSuccess, sendError } from '../utils/response';

interface SearchResult {
  id: string;
  type: 'User' | 'Team' | 'Task' | 'Report';
  title: string;
  subtitle?: string;
  url: string;
}

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length < 2) {
      return sendSuccess(res, { results: [] }, 'Search query too short', 200);
    }

    const regex = new RegExp(query, 'i');
    const userRole = req.user!.role;
    const userId = req.user!.id;

    // Build RBAC queries
    const userQuery: any = {
      $or: [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } }
      ]
    };

    const teamQuery: any = {
      name: { $regex: regex }
    };

    const taskQuery: any = {
      title: { $regex: regex }
    };

    const reportQuery: any = {
      $or: [
        { achievements: { $regex: regex } },
        { nextWeekPriorities: { $regex: regex } }
      ]
    };

    // Apply RBAC filters
    if (userRole === UserRole.TEAM_LEAD) {
      const myTeam = await Team.findOne({ manager: userId });
      if (myTeam) {
        userQuery.team = myTeam._id;
        teamQuery._id = myTeam._id;
        taskQuery.$or = [
          { assignedTo: userId },
          { assigner: userId },
          { team: myTeam._id }
        ];
        reportQuery.team = myTeam._id;
      } else {
        // No team assigned
        userQuery._id = userId;
        teamQuery._id = null; // matches nothing
        taskQuery.$or = [{ assignedTo: userId }, { assigner: userId }];
        reportQuery._id = null;
      }
    } else if (userRole === UserRole.EMPLOYEE) {
      userQuery._id = userId;
      teamQuery._id = null; // No team search for employees
      taskQuery.assignedTo = userId;
      reportQuery._id = null; // No report search for employees
    } else if (userRole === UserRole.CEO) {
      // CEO can see everything, but maybe filter users to only Team Leads and above?
      // For now, let CEO search all employees, tasks, teams, reports.
    }

    // Execute queries in parallel
    const [users, teams, tasks, reports] = await Promise.all([
      userQuery._id === null ? [] : User.find(userQuery).limit(5).lean(),
      teamQuery._id === null ? [] : Team.find(teamQuery).limit(5).lean(),
      taskQuery._id === null ? [] : Task.find(taskQuery).limit(10).lean(),
      reportQuery._id === null ? [] : WeeklyReport.find(reportQuery).limit(5).lean(),
    ]);

    const results: SearchResult[] = [];

    // Map Users
    users.forEach(u => {
      let url = '/profile'; // Employee can only see own
      if (userRole === UserRole.ADMIN || userRole === UserRole.CEO) {
        url = '/admin/employees'; // Or specific user modal if we had one
      } else if (userRole === UserRole.TEAM_LEAD) {
        url = '/team-lead/team-members';
      }
      
      results.push({
        id: (u as any)._id.toString(),
        type: 'User',
        title: `${(u as any).firstName} ${(u as any).lastName}`,
        subtitle: (u as any).email,
        url
      });
    });

    // Map Teams
    teams.forEach(t => {
      results.push({
        id: (t as any)._id.toString(),
        type: 'Team',
        title: (t as any).name,
        subtitle: 'Team',
        url: userRole === UserRole.ADMIN ? '/admin/teams' : (userRole === UserRole.CEO ? '/ceo/dashboard' : '/team-lead/dashboard')
      });
    });

    // Map Tasks
    tasks.forEach(t => {
      let url = '/employee/dashboard';
      if (userRole === UserRole.ADMIN) url = '/admin/dashboard'; // Admin doesn't have task view usually, maybe just search?
      if (userRole === UserRole.CEO) url = `/ceo/tasks`;
      if (userRole === UserRole.TEAM_LEAD) url = `/team-lead/dashboard`;
      if (userRole === UserRole.EMPLOYEE) url = `/employee/dashboard`;

      results.push({
        id: (t as any)._id.toString(),
        type: 'Task',
        title: (t as any).title,
        subtitle: `Priority: ${(t as any).priority} | Status: ${(t as any).status}`,
        url
      });
    });

    // Map Reports
    reports.forEach(r => {
      results.push({
        id: (r as any)._id.toString(),
        type: 'Report',
        title: `Weekly Report - ${(r as any).weekStartDate.toISOString().split('T')[0]}`,
        subtitle: 'Team Report',
        url: userRole === UserRole.CEO ? '/ceo/reports' : '/team-lead/reports'
      });
    });

    sendSuccess(res, { results }, 'Search results retrieved', 200);
  } catch (error: any) {
    console.error('Search error:', error);
    sendError(res, 'Error performing search', 500);
  }
};
