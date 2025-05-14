import api from './axios';

export interface Notification {
  id: string;
  isRead: boolean;
  isDeleted: boolean;
  userId: string;
  title: string;
  body: string;
  type: number;
  reference: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  results: Notification[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const notificationsApi = {
  // Get all notifications for the current user
  getAllNotifications: async (page = 1, limit = 10, sortBy = 'createdAt:desc'): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>('/notifications/all', {
      params: { page, limit, sortBy }
    });
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(`/notifications/${notificationId}/mark-as-read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>('/notifications/read-all');
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/notifications/${notificationId}`);
    return response.data;
  }
};

export default notificationsApi; 