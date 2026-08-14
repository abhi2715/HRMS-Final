import api from './api';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  relatedEntity?: string;
  entityModel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPagination {
  total: number;
  page: number;
  pages: number;
}

export const notificationApi = {
  getNotifications: async (page = 1, limit = 20): Promise<{ notifications: Notification[], unreadCount: number, pagination: NotificationPagination }> => {
    const response = await api.get('/notifications', { params: { page, limit } });
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.unreadCount;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.data.notification;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  }
};
