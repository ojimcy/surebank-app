import { useState, useEffect, useCallback } from 'react';
import notificationsApi, { Notification } from '@/lib/api/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      // Add sort parameter to ensure consistent sorting from the API
      const response = await notificationsApi.getAllNotifications(page, limit, 'createdAt:desc');
      
      // Additional client-side sorting to ensure latest to oldest order
      const sortedNotifications = [...response.results].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotifications(sortedNotifications);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
      // Count unread notifications
      const unreadNotifications = sortedNotifications.filter(
        (notification) => !notification.isRead
      );
      setUnreadCount(unreadNotifications.length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
      return true;
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      return false;
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      const deleted = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
      // Update unread count if the deleted notification was unread
      if (deleted && !deleted.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return true;
    } catch (err) {
      console.error('Failed to delete notification:', err);
      return false;
    }
  }, [notifications]);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    totalPages,
    currentPage,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
} 