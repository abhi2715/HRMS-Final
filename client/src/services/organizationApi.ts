import api from './api';
import type { User } from '../types/auth.types';

export interface AuditLog {
  _id: string;
  action: string;
  performedBy: User;
  targetUser?: User;
  targetTeam?: { _id: string; name: string };
  details?: Record<string, any>;
  createdAt: string;
}

export interface OrganizationStats {
  totalEmployees: number;
  totalTeams: number;
  activeUsers: number;
  recentActivity: AuditLog[];
}

export interface HierarchyNode {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  jobTitle?: string;
  role?: string;
  name?: string; // For teams
  manager?: HierarchyNode; // For teams
  members?: HierarchyNode[]; // For teams
}

export interface OrganizationHierarchy {
  type: 'root';
  ceos: HierarchyNode[];
  teams: HierarchyNode[];
}

export const organizationApi = {
  getStats: async (): Promise<OrganizationStats> => {
    const response = await api.get('/organization/stats');
    return response.data;
  },

  getHierarchy: async (): Promise<OrganizationHierarchy> => {
    const response = await api.get('/organization/hierarchy');
    return response.data;
  },
};
