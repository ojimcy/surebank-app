import { PushNotifications, ActionPerformed, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { logger } from '@/lib/utils/logger';
import { toast } from 'react-hot-toast';

// Create a logger for push notifications
const notificationLogger = logger.create('PushNotifications');

export interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: any };
  badge?: number;
  sound?: string;
  category?: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private isInitialized = false;
  private token: string | null = null;

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      notificationLogger.info('Push notifications already initialized');
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      notificationLogger.info('Push notifications not available on web platform');
      return;
    }

    try {
      notificationLogger.info('Initializing push notifications...');

      // Initialize Firebase app first
      await this.initializeFirebase();

      // Request permission
      const permissionStatus = await PushNotifications.requestPermissions();
      
      if (permissionStatus.receive === 'granted') {
        notificationLogger.info('Push notification permissions granted');
        
        // Register for push notifications
        await PushNotifications.register();
        
        // Set up listeners
        this.setupListeners();
        
        this.isInitialized = true;
        notificationLogger.info('Push notifications initialized successfully');
      } else {
        notificationLogger.warn('Push notification permissions denied');
        throw new Error('Push notification permissions denied');
      }
    } catch (error) {
      notificationLogger.error('Failed to initialize push notifications:', error);
      throw error;
    }
  }

  private async initializeFirebase(): Promise<void> {
    if (Capacitor.getPlatform() === 'android') {
      try {
        // Initialize Firebase messaging for Android
        await FirebaseMessaging.initialize();
        notificationLogger.info('Firebase messaging initialized for Android');
      } catch (error) {
        notificationLogger.error('Failed to initialize Firebase messaging:', error);
        throw error;
      }
    }
  }

  private setupListeners(): void {
    // Called when the device receives a push notification
    PushNotifications.addListener('registration', (token: Token) => {
      notificationLogger.info('Push registration success:', token.value);
      this.token = token.value;
      this.sendTokenToServer(token.value);
    });

    // Called when the device fails to register for push notifications
    PushNotifications.addListener('registrationError', (error: any) => {
      notificationLogger.error('Error on push registration:', error);
    });

    // Called when the device receives a push notification
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      notificationLogger.info('Push notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Called when an action is performed on a push notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      notificationLogger.info('Push notification action performed:', notification);
      this.handleNotificationAction(notification);
    });

    // Firebase messaging listeners (for Android)
    if (Capacitor.getPlatform() === 'android') {
      FirebaseMessaging.addListener('notificationReceived', (event) => {
        notificationLogger.info('Firebase notification received:', event);
      });

      FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
        notificationLogger.info('Firebase notification action performed:', event);
      });
    }
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // Send the token to your backend server
      // This should be implemented based on your API structure
      notificationLogger.info('Token should be sent to server:', token);
      
      // Example implementation:
      // await apiClient.post('/notifications/register-device', {
      //   token,
      //   platform: Capacitor.getPlatform(),
      //   userId: getCurrentUserId()
      // });
      
    } catch (error) {
      notificationLogger.error('Failed to send token to server:', error);
    }
  }

  private handleNotificationReceived(notification: PushNotificationSchema): void {
    // Handle when app receives a notification while running
    const { title, body, data } = notification;
    
    // Show in-app notification
    toast.success(`${title}: ${body}`, {
      duration: 5000,
      icon: '🔔',
    });

    // Handle specific notification types based on data
    if (data) {
      this.handleNotificationData(data);
    }
  }

  private handleNotificationAction(notification: ActionPerformed): void {
    // Handle when user taps on a notification
    const { data } = notification.notification;
    
    if (data) {
      this.handleNotificationData(data);
    }
  }

  private handleNotificationData(data: { [key: string]: any }): void {
    // Route to appropriate screen based on notification data
    const { type, id, action } = data;
    
    switch (type) {
      case 'transaction':
        // Navigate to transaction details
        this.navigateToRoute(`/payments/transaction-details?id=${id}`);
        break;
      case 'package':
        // Navigate to package details
        this.navigateToRoute(`/packages/${id}`);
        break;
      case 'order':
        // Navigate to order details
        this.navigateToRoute(`/orders/${id}`);
        break;
      case 'security':
        // Navigate to security settings
        this.navigateToRoute('/settings');
        break;
      case 'kyc':
        // Navigate to KYC verification
        this.navigateToRoute('/settings/kyc-verification');
        break;
      default:
        // Navigate to dashboard for unknown types
        this.navigateToRoute('/dashboard');
        break;
    }
  }

  private navigateToRoute(path: string): void {
    // Navigate to the specified route
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public async getDeliveredNotifications(): Promise<any[]> {
    try {
      const notificationList = await PushNotifications.getDeliveredNotifications();
      return notificationList.notifications;
    } catch (error) {
      notificationLogger.error('Failed to get delivered notifications:', error);
      return [];
    }
  }

  public async removeDeliveredNotifications(): Promise<void> {
    try {
      await PushNotifications.removeAllDeliveredNotifications();
      notificationLogger.info('All delivered notifications removed');
    } catch (error) {
      notificationLogger.error('Failed to remove delivered notifications:', error);
    }
  }

  public async checkPermissions(): Promise<any> {
    try {
      const status = await PushNotifications.checkPermissions();
      notificationLogger.info('Push notification permissions status:', status);
      return status;
    } catch (error) {
      notificationLogger.error('Failed to check permissions:', error);
      return null;
    }
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();