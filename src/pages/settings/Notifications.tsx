import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Check, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { formatNotificationDate } from '@/lib/utils';
import { Notification } from '@/lib/api/notifications';

function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    totalPages,
    currentPage,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();
  const [page, setPage] = useState<number>(currentPage);

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markAsRead(notificationId);
    if (success) {
      toast.success('Notification marked as read');
    } else {
      toast.error('Could not mark notification as read');
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      toast.success('All notifications marked as read');
    } else {
      toast.error('Could not mark all notifications as read');
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    const success = await deleteNotification(notificationId);
    if (success) {
      toast.success('Notification deleted');
    } else {
      toast.error('Could not delete notification');
    }
  };

  // Navigation functions
  const goToNextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchNotifications(prevPage);
    }
  };

  // Render notification item
  const renderNotification = (notification: Notification) => (
    <div 
      key={notification.id}
      className={`border-b border-gray-200 p-4 ${!notification.isRead ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-base font-medium mb-1 ${!notification.isRead ? 'text-[#0066A1] font-semibold' : 'text-gray-900'}`}>
            {notification.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{notification.body}</p>
          <p className="text-xs text-gray-500">{formatNotificationDate(notification.createdAt)}</p>
        </div>
        <div className="flex space-x-2 ml-4">
          {!notification.isRead && (
            <Button
              onClick={() => handleMarkAsRead(notification.id)}
              variant="outline"
              size="sm"
              className="p-1.5 h-auto"
              title="Mark as read"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
          )}
          <Button
            onClick={() => handleDeleteNotification(notification.id)}
            variant="outline"
            size="sm"
            className="p-1.5 h-auto"
            title="Delete notification"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/settings" className="mr-3">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        {notifications.length > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066A1]" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bell className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications</h3>
          <p className="text-gray-500">You don't have any notifications yet.</p>
        </div>
      )}

      {notifications.length > 0 && (
        <>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {notifications.map(renderNotification)}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={goToPrevPage}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={goToNextPage}
                disabled={page === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default NotificationsPage; 