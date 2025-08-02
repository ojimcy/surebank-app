import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { logger } from '@/lib/utils/logger';

const analyticsLogger = logger.create('Analytics');

export interface AnalyticsConfig {
  enableAnalyticsCollection?: boolean;
  enableDataCollection?: boolean;
  sessionTimeoutDuration?: number;
}

export interface AnalyticsEvent {
  name: string;
  parameters?: { [key: string]: any };
}

export interface UserProperties {
  [key: string]: string | number | boolean;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized = false;
  private isEnabled = false;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async initialize(config: AnalyticsConfig = {}): Promise<void> {
    if (this.isInitialized) {
      analyticsLogger.info('Analytics already initialized');
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      analyticsLogger.info('Analytics not available on web platform');
      return;
    }

    try {
      analyticsLogger.info('Initializing analytics...');

      // Enable or disable analytics data collection
      if (config.enableAnalyticsCollection !== undefined) {
        await this.setEnabled(config.enableAnalyticsCollection);
      } else {
        await this.setEnabled(true); // Default to enabled
      }

      // Set session timeout duration if provided
      if (config.sessionTimeoutDuration) {
        await this.setSessionTimeoutDuration(config.sessionTimeoutDuration);
      }

      this.isInitialized = true;
      analyticsLogger.info('Analytics initialized successfully');

      // Log initialization event
      await this.logEvent('app_analytics_initialized', {
        platform: Capacitor.getPlatform(),
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      analyticsLogger.error('Failed to initialize analytics:', error);
      throw error;
    }
  }

  public async setEnabled(enabled: boolean): Promise<void> {
    try {
      await FirebaseAnalytics.setEnabled({ enabled });
      this.isEnabled = enabled;
      analyticsLogger.info(`Analytics ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      analyticsLogger.error('Failed to set analytics enabled state:', error);
    }
  }

  public async isAnalyticsEnabled(): Promise<boolean> {
    try {
      const result = await FirebaseAnalytics.isEnabled();
      return result.enabled;
    } catch (error) {
      analyticsLogger.error('Failed to check analytics enabled state:', error);
      return false;
    }
  }

  public async setUserId(userId: string): Promise<void> {
    try {
      await FirebaseAnalytics.setUserId({ userId });
      analyticsLogger.info(`User ID set: ${userId}`);
    } catch (error) {
      analyticsLogger.error('Failed to set user ID:', error);
    }
  }

  public async setUserProperty(key: string, value: string): Promise<void> {
    try {
      await FirebaseAnalytics.setUserProperty({ key, value });
      analyticsLogger.debug(`User property set: ${key} = ${value}`);
    } catch (error) {
      analyticsLogger.error('Failed to set user property:', error);
    }
  }

  public async setUserProperties(properties: UserProperties): Promise<void> {
    try {
      const promises = Object.entries(properties).map(([key, value]) =>
        this.setUserProperty(key, value.toString())
      );
      await Promise.all(promises);
      analyticsLogger.debug('User properties set:', properties);
    } catch (error) {
      analyticsLogger.error('Failed to set user properties:', error);
    }
  }

  public async logEvent(name: string, parameters: { [key: string]: any } = {}): Promise<void> {
    if (!this.isEnabled) {
      analyticsLogger.debug('Analytics disabled, skipping event:', name);
      return;
    }

    try {
      // Sanitize parameters to ensure they're compatible with Firebase
      const sanitizedParams = this.sanitizeParameters(parameters);
      
      await FirebaseAnalytics.logEvent({
        name: this.sanitizeEventName(name),
        params: sanitizedParams,
      });
      
      analyticsLogger.debug(`Event logged: ${name}`, sanitizedParams);
    } catch (error) {
      analyticsLogger.error('Failed to log event:', error);
    }
  }

  public async setCurrentScreen(screenName: string, _screenClass?: string): Promise<void> {
    try {
      await FirebaseAnalytics.setCurrentScreen({
        screenName
      });
      analyticsLogger.debug(`Screen set: ${screenName}`);
    } catch (error) {
      analyticsLogger.error('Failed to set current screen:', error);
    }
  }

  public async setSessionTimeoutDuration(duration: number): Promise<void> {
    try {
      await FirebaseAnalytics.setSessionTimeoutDuration({ duration });
      analyticsLogger.info(`Session timeout duration set: ${duration}ms`);
    } catch (error) {
      analyticsLogger.error('Failed to set session timeout duration:', error);
    }
  }

  public async resetAnalyticsData(): Promise<void> {
    try {
      await FirebaseAnalytics.resetAnalyticsData();
      analyticsLogger.info('Analytics data reset');
    } catch (error) {
      analyticsLogger.error('Failed to reset analytics data:', error);
    }
  }

  // Convenience methods for common events
  public async logLogin(method: string): Promise<void> {
    await this.logEvent('login', { method });
  }

  public async logSignUp(method: string): Promise<void> {
    await this.logEvent('sign_up', { method });
  }

  public async logPurchase(transactionId: string, value: number, currency: string = 'NGN'): Promise<void> {
    await this.logEvent('purchase', {
      transaction_id: transactionId,
      value,
      currency,
    });
  }

  public async logSelectContent(contentType: string, itemId: string): Promise<void> {
    await this.logEvent('select_content', {
      content_type: contentType,
      item_id: itemId,
    });
  }

  public async logSearch(searchTerm: string): Promise<void> {
    await this.logEvent('search', {
      search_term: searchTerm,
    });
  }

  public async logShare(contentType: string, itemId: string, method: string): Promise<void> {
    await this.logEvent('share', {
      content_type: contentType,
      item_id: itemId,
      method,
    });
  }

  // App-specific convenience methods
  public async logPackageCreated(packageType: string, amount: number): Promise<void> {
    await this.logEvent('package_created', {
      package_type: packageType,
      amount,
      currency: 'NGN',
    });
  }

  public async logPaymentInitiated(method: string, amount: number, purpose: string): Promise<void> {
    await this.logEvent('payment_initiated', {
      payment_method: method,
      amount,
      currency: 'NGN',
      purpose,
    });
  }

  public async logPaymentCompleted(method: string, amount: number, transactionId: string): Promise<void> {
    await this.logEvent('payment_completed', {
      payment_method: method,
      amount,
      currency: 'NGN',
      transaction_id: transactionId,
    });
  }

  public async logKycStepCompleted(step: string): Promise<void> {
    await this.logEvent('kyc_step_completed', {
      step_name: step,
    });
  }

  public async logFeatureUsed(featureName: string, context?: string): Promise<void> {
    await this.logEvent('feature_used', {
      feature_name: featureName,
      context: context || 'unknown',
    });
  }

  public async logError(errorType: string, errorMessage: string, screen?: string): Promise<void> {
    await this.logEvent('app_error', {
      error_type: errorType,
      error_message: errorMessage.substring(0, 100), // Limit message length
      screen: screen || 'unknown',
    });
  }

  public async logUserEngagement(action: string, target: string, value?: number): Promise<void> {
    await this.logEvent('user_engagement', {
      engagement_action: action,
      engagement_target: target,
      engagement_value: value,
    });
  }

  // Utility methods
  private sanitizeEventName(name: string): string {
    // Firebase event names must be <= 40 characters and contain only alphanumeric characters and underscores
    return name
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .substring(0, 40);
  }

  private sanitizeParameters(parameters: { [key: string]: any }): { [key: string]: any } {
    const sanitized: { [key: string]: any } = {};

    Object.entries(parameters).forEach(([key, value]) => {
      // Sanitize key names
      const sanitizedKey = key
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .substring(0, 40);

      // Sanitize values
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = value.substring(0, 100); // Limit string length
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[sanitizedKey] = value;
      } else if (value !== null && value !== undefined) {
        sanitized[sanitizedKey] = String(value).substring(0, 100);
      }
    });

    return sanitized;
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();