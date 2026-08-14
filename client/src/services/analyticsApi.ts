import api from './api';

export interface OrgAnalytics {
  employees: { active: number };
  teams: { total: number };
  tasks: {
    totalActive: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  attendance: { _id: string; count: number }[];
  leaves: { _id: string; totalDays: number }[];
}

export interface TeamAnalytics {
  tasks: {
    totalActive: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  memberContribution: {
    _id: string;
    firstName: string;
    lastName: string;
    completedCount: number;
  }[];
}

export interface EmployeeAnalytics {
  tasks: {
    totalAssigned: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
    avgTurnaroundDays: string | null;
  };
  attendance: { _id: string; count: number }[];
}

export const analyticsApi = {
  getOrganizationAnalytics: async (startDate?: string, endDate?: string): Promise<OrgAnalytics> => {
    const response = await api.get('/analytics/organization', { params: { startDate, endDate } });
    return response.data.data;
  },

  getTeamAnalytics: async (teamId: string, startDate?: string, endDate?: string): Promise<TeamAnalytics> => {
    const response = await api.get(`/analytics/team/${teamId}`, { params: { startDate, endDate } });
    return response.data.data;
  },

  getEmployeeAnalytics: async (employeeId: string, startDate?: string, endDate?: string): Promise<EmployeeAnalytics> => {
    const response = await api.get(`/analytics/employee/${employeeId}`, { params: { startDate, endDate } });
    return response.data.data;
  }
};
