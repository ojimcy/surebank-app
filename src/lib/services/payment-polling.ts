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
  private consecutive404s = 0;
  private currentInterval = 3000; // Start with 3 seconds

  startPolling(config: PollingConfig) {
    this.config = {
      maxAttempts: 60, // 60 attempts total
      pollInterval: 3000, // Base polling interval
      timeoutDuration: 300000, // 5 minutes total timeout
      ...config,
    };
    
    this.attempts = 0;
    this.isPolling = true;
    this.consecutive404s = 0;
    this.currentInterval = this.config.pollInterval || 3000;

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

    // Start first check after longer initial delay to give payment time to be processed
    // Use progressive delays: 15s -> 30s -> then normal polling
    setTimeout(() => {
      if (this.isPolling) {
        console.log('First payment status check after initial delay');
        this.checkPaymentStatus();
      }
    }, 15000); // 15 second initial delay

    // Set up timeout
    this.timeoutTimer = setTimeout(() => {
      if (this.isPolling) {
        console.log('Payment polling timed out');
        this.stopPolling();
        this.config?.onTimeout();
      }
    }, this.config.timeoutDuration);
  }

  private scheduleNextCheck() {
    if (!this.isPolling || !this.config) return;

    // Clear any existing interval
    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
    }

    // Calculate delay based on attempt number and 404 history
    let delay = this.currentInterval;

    // For early attempts or after consecutive 404s, use longer delays
    if (this.attempts <= 3) {
      // First few attempts: longer delays
      delay = this.attempts === 1 ? 15000 : this.attempts === 2 ? 10000 : 8000;
    } else if (this.consecutive404s > 0) {
      // Exponential backoff for 404s (payment not yet in system)
      delay = Math.min((this.config.pollInterval || 3000) * Math.pow(1.5, this.consecutive404s), 30000);
    }

    console.log(`Scheduling next check in ${delay/1000}s (attempt ${this.attempts + 1}, consecutive 404s: ${this.consecutive404s})`);

    this.pollingInterval = setTimeout(() => {
      if (this.isPolling) {
        this.checkPaymentStatus();
      }
    }, delay);
  }

  private async checkPaymentStatus() {
    if (!this.config || !this.isPolling) return;

    this.attempts++;
    console.log(`Payment status check attempt ${this.attempts}/${this.config.maxAttempts} (consecutive 404s: ${this.consecutive404s})`);

    try {
      const status = await packagesApi.checkPaymentStatus(this.config.reference);
      console.log('Payment status:', status);

      // Reset 404 counter on successful response
      this.consecutive404s = 0;

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
      } else {
        // Continue polling for pending status
        this.scheduleNextCheck();
      }
    } catch (error: unknown) {
      console.error('Error checking payment status:', error);
      
      // Handle 404 errors specifically (payment not yet in system)
      const isError = error && typeof error === 'object';
      const is404Error = (isError && 'response' in error && typeof error.response === 'object' && 
                         error.response && 'status' in error.response && error.response.status === 404) ||
                        (isError && 'message' in error && typeof error.message === 'string' && 
                         error.message.includes('Payment not found'));
      
      if (is404Error) {
        this.consecutive404s++;
        console.log(`Payment not found (404) - attempt ${this.attempts}, consecutive 404s: ${this.consecutive404s}`);
        
        // For 404s, be more patient - the payment might just not be in the system yet
        if (this.consecutive404s >= 10 && this.attempts >= 15) {
          // If we've had many 404s and tried for a while, consider timing out
          console.log('Too many consecutive 404s, timing out');
          this.stopPolling();
          this.config?.onTimeout();
          return;
        }
        
        // Continue polling with exponential backoff
        this.scheduleNextCheck();
      } else {
        // For other errors, use normal retry logic
        if (this.attempts >= (this.config.maxAttempts || 60)) {
          console.log('Max attempts reached after error');
          this.stopPolling();
          this.config?.onTimeout();
        } else {
          // Continue polling with normal interval for non-404 errors
          this.scheduleNextCheck();
        }
      }
    }
  }

  stopPolling() {
    console.log('Stopping payment polling');
    this.isPolling = false;

    if (this.pollingInterval) {
      clearTimeout(this.pollingInterval);
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
    this.consecutive404s = 0;
    this.currentInterval = 3000;
  }

  isCurrentlyPolling(): boolean {
    return this.isPolling;
  }
}

export const paymentPolling = new PaymentPollingService(); 