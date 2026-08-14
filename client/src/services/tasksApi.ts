import api from './api';
import type { User } from '../types/auth.types';
import type { Team } from './teamsApi';

export const TaskStatus = {
  BACKLOG: 'backlog',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  BLOCKED: 'blocked',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface TaskComment {
  _id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  createdBy: User;
  assigner: User;
  assignedTo: User;
  team?: Team;
  parentTask?: any;
  progress: number;
  tags: string[];
  attachments: string[];
  comments: TaskComment[];
  statusHistory: {
    status: TaskStatus;
    changedBy: User;
    timestamp: string;
    reason?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface GetTasksParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  team?: string;
  createdBy?: string;
  parentTask?: string;
  search?: string;
  tags?: string;
  overdue?: boolean;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  startDate?: string;
  dueDate?: string;
  assignedTo: string;
  team?: string;
  parentTask?: string;
  progress?: number;
  tags?: string[];
  attachments?: string[];
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  statusReason?: string;
}

export const tasksApi = {
  getTasks: async (params?: GetTasksParams): Promise<PaginatedResponse<Task>> => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const response = await api.post('/tasks', payload);
    return response.data;
  },

  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, payload);
    return response.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  addComment: async (id: string, text: string): Promise<Task> => {
    const response = await api.post(`/tasks/${id}/comments`, { text });
    return response.data;
  },
};
