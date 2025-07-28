import { useState, useEffect } from 'react';
import { pushNotificationService } from '@/lib/services/push-notifications';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/utils/logger';

const pushLogger = logger.create('usePushNotifications');

export interface PushNotificationState {
  isInitialized: boolean;
  token: string | null;
  permissionStatus: string | null;
  error: string | null;
  isLoading: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isInitialized: false,
    token: null,
    permissionStatus: null,
    error: null,
    isLoading: true,
  });

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      pushLogger.info('User not authenticated, skipping push notification setup');
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    initializePushNotifications();
  }, [isAuthenticated]);

  const initializePushNotifications = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      pushLogger.info('Initializing push notifications...');
      
      // Initialize the push notification service
      await pushNotificationService.initialize();
      
      // Get the token
      const token = pushNotificationService.getToken();
      
      // Check permissions
      const permissions = await pushNotificationService.checkPermissions();
      
      setState({
        isInitialized: true,
        token,
        permissionStatus: permissions?.receive || 'unknown',
        error: null,
        isLoading: false,
      });
      
      pushLogger.info('Push notifications initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      pushLogger.error('Failed to initialize push notifications:', error);
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  const requestPermissions = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await initializePushNotifications();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request permissions';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
    }
  };

  const getDeliveredNotifications = async () => {
    try {
      return await pushNotificationService.getDeliveredNotifications();
    } catch (error) {
      pushLogger.error('Failed to get delivered notifications:', error);
      return [];
    }
  };

  const clearNotifications = async () => {
    try {
      await pushNotificationService.removeDeliveredNotifications();
      pushLogger.info('Cleared all delivered notifications');
    } catch (error) {
      pushLogger.error('Failed to clear notifications:', error);
    }
  };

  const checkPermissionStatus = async () => {
    try {
      const permissions = await pushNotificationService.checkPermissions();
      setState(prev => ({
        ...prev,
        permissionStatus: permissions?.receive || 'unknown',
      }));
      return permissions;
    } catch (error) {
      pushLogger.error('Failed to check permission status:', error);
      return null;
    }
  };

  return {
    ...state,
    requestPermissions,
    getDeliveredNotifications,
    clearNotifications,
    checkPermissionStatus,
    reinitialize: initializePushNotifications,
  };
}