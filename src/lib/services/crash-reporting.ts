import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';
import { Capacitor } from '@capacitor/core';
import { logger } from '@/lib/utils/logger';

// Create a logger for crash reporting
const crashLogger = logger.create('CrashReporting');

export interface CrashReportingConfig {
  userId?: string;
  enableDataCollection?: boolean;
  enableCrashlyticsCollection?: boolean;
}

export class CrashReportingService {
  private static instance: CrashReportingService;
  private isInitialized = false;

  public static getInstance(): CrashReportingService {
    if (!CrashReportingService.instance) {
      CrashReportingService.instance = new CrashReportingService();
    }
    return CrashReportingService.instance;
  }

  public async initialize(config: CrashReportingConfig = {}): Promise<void> {
    if (this.isInitialized) {
      crashLogger.info('Crash reporting already initialized');
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      crashLogger.info('Crash reporting not available on web platform');
      return;
    }

    try {
      crashLogger.info('Initializing crash reporting...');

      // Enable or disable crashlytics data collection
      if (config.enableCrashlyticsCollection !== undefined) {
        await FirebaseCrashlytics.setEnabled({
          enabled: config.enableCrashlyticsCollection,
        });
      }

      // Set user identifier if provided
      if (config.userId) {
        await this.setUserId(config.userId);
      }

      // Log initialization
      await this.recordMessage('Crash reporting initialized successfully');

      this.isInitialized = true;
      crashLogger.info('Crash reporting initialized successfully');
    } catch (error) {
      crashLogger.error('Failed to initialize crash reporting:', error);
      throw error;
    }
  }

  public async setUserId(userId: string): Promise<void> {
    try {
      await FirebaseCrashlytics.setUserId({ userId });
      crashLogger.info(`User ID set: ${userId}`);
    } catch (error) {
      crashLogger.error('Failed to set user ID:', error);
    }
  }

  public async setCustomKey(key: string, value: string | number | boolean): Promise<void> {
    try {
      await FirebaseCrashlytics.setCustomKey({
        key,
        value: value.toString(),
        type: typeof value as 'string' | 'number' | 'boolean',
      });
      crashLogger.debug(`Custom key set: ${key} = ${value}`);
    } catch (error) {
      crashLogger.error('Failed to set custom key:', error);
    }
  }

  public async setCustomKeys(attributes: Record<string, string | number | boolean>): Promise<void> {
    try {
      const keys = Object.entries(attributes).map(([key, value]) => ({
        key,
        value: value.toString(),
        type: typeof value as 'string' | 'number' | 'boolean',
      }));

      await FirebaseCrashlytics.setCustomKeys({ keys });
      crashLogger.debug('Custom keys set:', attributes);
    } catch (error) {
      crashLogger.error('Failed to set custom keys:', error);
    }
  }

  public async recordMessage(message: string): Promise<void> {
    try {
      await FirebaseCrashlytics.log({ message });
      crashLogger.debug(`Message logged: ${message}`);
    } catch (error) {
      crashLogger.error('Failed to log message:', error);
    }
  }

  public async recordError(error: Error, context?: Record<string, any>): Promise<void> {
    try {
      // Set context as custom keys if provided
      if (context) {
        await this.setCustomKeys(context);
      }

      // Record the error
      await FirebaseCrashlytics.recordException({
        message: error.message,
        code: error.name,
        stackTrace: error.stack,
      });

      crashLogger.info(`Error recorded: ${error.message}`);
    } catch (recordingError) {
      crashLogger.error('Failed to record error:', recordingError);
    }
  }

  public async recordNonFatalError(message: string, stack?: string): Promise<void> {
    try {
      await FirebaseCrashlytics.recordException({
        message,
        code: 'NonFatalError',
        stackTrace: stack,
      });

      crashLogger.info(`Non-fatal error recorded: ${message}`);
    } catch (error) {
      crashLogger.error('Failed to record non-fatal error:', error);
    }
  }

  public async sendUnsentReports(): Promise<void> {
    try {
      await FirebaseCrashlytics.sendUnsentReports();
      crashLogger.info('Unsent reports sent');
    } catch (error) {
      crashLogger.error('Failed to send unsent reports:', error);
    }
  }

  public async deleteUnsentReports(): Promise<void> {
    try {
      await FirebaseCrashlytics.deleteUnsentReports();
      crashLogger.info('Unsent reports deleted');
    } catch (error) {
      crashLogger.error('Failed to delete unsent reports:', error);
    }
  }

  public async didCrashOnPreviousExecution(): Promise<boolean> {
    try {
      const result = await FirebaseCrashlytics.didCrashOnPreviousExecution();
      return result.crashed;
    } catch (error) {
      crashLogger.error('Failed to check previous crash:', error);
      return false;
    }
  }

  public async isEnabled(): Promise<boolean> {
    try {
      const result = await FirebaseCrashlytics.isEnabled();
      return result.enabled;
    } catch (error) {
      crashLogger.error('Failed to check if enabled:', error);
      return false;
    }
  }

  public async setEnabled(enabled: boolean): Promise<void> {
    try {
      await FirebaseCrashlytics.setEnabled({ enabled });
      crashLogger.info(`Crash reporting ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      crashLogger.error('Failed to set enabled state:', error);
    }
  }

  // Utility methods for common use cases
  public recordUserAction(action: string, properties?: Record<string, any>): void {
    const message = `User action: ${action}`;
    this.recordMessage(message);
    
    if (properties) {
      // Set properties as custom keys with action prefix
      const prefixedProperties = Object.entries(properties).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`action_${key}`]: value,
        }),
        {}
      );
      this.setCustomKeys(prefixedProperties);
    }
  }

  public recordApiError(endpoint: string, statusCode: number, errorMessage: string): void {
    this.setCustomKeys({
      api_endpoint: endpoint,
      api_status_code: statusCode,
      api_error_type: 'API_ERROR',
    });
    
    this.recordNonFatalError(`API Error: ${endpoint} - ${statusCode}: ${errorMessage}`);
  }

  public recordNavigationError(route: string, error: Error): void {
    this.setCustomKeys({
      navigation_route: route,
      error_type: 'NAVIGATION_ERROR',
    });
    
    this.recordError(error);
  }
}

// Export singleton instance
export const crashReportingService = CrashReportingService.getInstance();