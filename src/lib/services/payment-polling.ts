import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import packagesApi, { PaymentStatus } from '@/lib/api/packages';

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

  startPolling(config: PollingConfig) {
    this.config = {
      maxAttempts: 60, // 60 attempts = 3 minutes at 3-second intervals
      pollInterval: 3000, // Poll every 3 seconds
      timeoutDuration: 300000, // 5 minutes total timeout
      ...config,
    };
    
    this.attempts = 0;
    this.isPolling = true;

    console.log('Starting payment polling for reference:', this.config.reference);

    // Set up app state listener for mobile
    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive && this.isPolling) {
          console.log('App became active, checking payment status immediately');
          this.checkPaymentStatus();
        }
      });

      // Also listen for app URL opens (in case of redirect)
      App.addListener('appUrlOpen', () => {
        if (this.isPolling) {
          console.log('App opened via URL, checking payment status');
          this.checkPaymentStatus();
        }
      });
    }

    // Start first check after initial delay to allow payment to be processed
    setTimeout(() => {
      if (this.isPolling) {
        this.checkPaymentStatus();
      }
    }, 5000); // 5 second initial delay

    // Set up polling interval
    this.pollingInterval = setInterval(() => {
      if (this.isPolling) {
        this.checkPaymentStatus();
      }
    }, this.config.pollInterval);

    // Set up timeout
    this.timeoutTimer = setTimeout(() => {
      if (this.isPolling) {
        console.log('Payment polling timed out');
        this.stopPolling();
        this.config?.onTimeout();
      }
    }, this.config.timeoutDuration);
  }

  private async checkPaymentStatus() {
    if (!this.config || !this.isPolling) return;

    this.attempts++;
    console.log(`Payment status check attempt ${this.attempts}/${this.config.maxAttempts}`);

    try {
      const status = await packagesApi.checkPaymentStatus(this.config.reference);
      console.log('Payment status:', status);

      if (status.status === 'success') {
        console.log('Payment successful!');
        this.stopPolling();
        this.config?.onSuccess(status);
      } else if (status.status === 'failed' || status.status === 'abandoned') {
        console.log('Payment failed or abandoned');
        this.stopPolling();
        this.config?.onError(status);
      } else if (this.attempts >= (this.config?.maxAttempts || 60)) {
        console.log('Max polling attempts reached');
        this.stopPolling();
        this.config?.onTimeout();
      }
      // If status is still 'pending', continue polling
    } catch (error) {
      console.error('Error checking payment status:', error);
      
      // If we can't reach the server, stop after max attempts
      if (this.attempts >= (this.config.maxAttempts || 60)) {
        this.stopPolling();
        this.config?.onTimeout();
      }
    }
  }

  stopPolling() {
    console.log('Stopping payment polling');
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
      App.removeAllListeners();
    }

    this.config = null;
    this.attempts = 0;
  }

  isCurrentlyPolling(): boolean {
    return this.isPolling;
  }
}

export const paymentPolling = new PaymentPollingService(); 