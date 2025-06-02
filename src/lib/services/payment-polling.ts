import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App } from '@capacitor/app';
import packagesApi, { PaymentStatus } from '@/lib/api/packages';
import { logger } from '@/lib/utils/logger';

// Create a logger instance for payment polling
const paymentLogger = logger.create('PaymentPolling');

interface PollingConfig {
  reference: string;
  onSuccess: (status: PaymentStatus) => void;
  onError: (status: PaymentStatus) => void;
  onTimeout: () => void;
  maxAttempts?: number;
  pollInterval?: number;
  timeoutDuration?: number;
}

class PaymentPollingService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private timeoutTimer: NodeJS.Timeout | null = null;
  private config: PollingConfig | null = null;
  private attempts = 0;
  private isPolling = false;
  private appUrlListener: PluginListenerHandle | null = null;
  private appStateListener: PluginListenerHandle | null = null;

  async startPolling(config: PollingConfig) {
    this.config = {
      maxAttempts: 60, // 60 attempts = 3 minutes at 3-second intervals
      pollInterval: 3000, // Poll every 3 seconds
      timeoutDuration: 300000, // 5 minutes total timeout
      ...config,
    };
    
    this.attempts = 0;
    this.isPolling = true;

    paymentLogger.info('Starting payment polling for reference:', this.config.reference);

    // Set up app state listener for mobile
    if (Capacitor.isNativePlatform()) {
      try {
        // Listen for app state changes (background/foreground)
        this.appStateListener = await App.addListener('appStateChange', async ({ isActive }) => {
          if (isActive && this.isPolling) {
            paymentLogger.info('App became active, checking payment status immediately');
            await this.checkPaymentStatus();
          }
        });

        // Listen for deep link handling
        this.appUrlListener = await App.addListener('appUrlOpen', async (data: { url: string }) => {
          paymentLogger.info('App opened via URL:', data.url);
          
          if (this.isPolling) {
            // Check if the URL contains our reference or success indicators
            if (data.url.includes('success') || 
                data.url.includes('success=true') ||
                data.url.includes(this.config?.reference || '')) {
              paymentLogger.info('Success URL detected, checking payment status');
              await this.checkPaymentStatus();
            } else if (data.url.includes('error') || data.url.includes('failed')) {
              paymentLogger.info('Error URL detected');
              if (this.config) {
                // Create a minimal error status
                const errorStatus: PaymentStatus = {
                  reference: this.config.reference,
                  status: 'failed',
                  amount: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                await this.stopPolling();
                this.config.onError(errorStatus);
              }
            }
          }
        });

        paymentLogger.info('Set up mobile app URL and state listeners');
      } catch (error) {
        paymentLogger.error('Error setting up listeners:', error);
      }
    }

    // Start immediate check
    await this.checkPaymentStatus();

    // Set up polling interval
    this.pollingInterval = setInterval(async () => {
      if (this.isPolling) {
        await this.checkPaymentStatus();
      }
    }, this.config.pollInterval);

    // Set up timeout
    this.timeoutTimer = setTimeout(async () => {
      if (this.isPolling) {
        paymentLogger.warn('Payment polling timed out');
        await this.stopPolling();
        this.config?.onTimeout();
      }
    }, this.config.timeoutDuration);
  }

  private async checkPaymentStatus() {
    if (!this.config || !this.isPolling) return;

    this.attempts++;
    paymentLogger.debug(`Payment status check attempt ${this.attempts}/${this.config.maxAttempts}`);

    try {
      const status = await packagesApi.checkPaymentStatus(this.config.reference);
      paymentLogger.debug('Payment status:', status);

      if (status.status === 'success') {
        paymentLogger.info('Payment successful!');
        await this.stopPolling();
        this.config.onSuccess(status);
      } else if (status.status === 'failed' || status.status === 'abandoned') {
        paymentLogger.warn('Payment failed or abandoned');
        await this.stopPolling();
        this.config.onError(status);
      } else if (this.attempts >= (this.config.maxAttempts || 60)) {
        paymentLogger.warn('Max polling attempts reached');
        await this.stopPolling();
        this.config.onTimeout();
      }
      // If status is still 'pending', continue polling
    } catch (error) {
      paymentLogger.error('Error checking payment status:', error);
      
      // If we can't reach the server, stop after max attempts
      if (this.attempts >= (this.config.maxAttempts || 60)) {
        await this.stopPolling();
        this.config?.onTimeout();
      }
    }
  }

  async stopPolling() {
    paymentLogger.info('Stopping payment polling');
    this.isPolling = false;

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }

    // Clean up listeners
    if (Capacitor.isNativePlatform()) {
      try {
        if (this.appStateListener) {
          await this.appStateListener.remove();
          this.appStateListener = null;
        }
        
        if (this.appUrlListener) {
          await this.appUrlListener.remove();
          this.appUrlListener = null;
        }
      } catch (error) {
        paymentLogger.error('Error removing listeners:', error);
      }
    }

    this.config = null;
    this.attempts = 0;
  }

  isCurrentlyPolling(): boolean {
    return this.isPolling;
  }
}

export const paymentPolling = new PaymentPollingService(); 