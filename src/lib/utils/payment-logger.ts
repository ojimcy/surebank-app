import { logger } from './logger';

/**
 * Dedicated logger for payment operations with detailed tracing
 */
class PaymentLogger {
  private baseLogger = logger.create('Payment');
  
  /**
   * Log payment initialization
   */
  logInitialize(data: Record<string, unknown>): void {
    this.baseLogger.info('💰 Payment initialization:', {
      timestamp: new Date().toISOString(),
      ...data
    });
  }
  
  /**
   * Log payment redirect
   */
  logRedirect(url: string, metadata?: Record<string, unknown>): void {
    this.baseLogger.info('🔄 Payment redirect:', {
      timestamp: new Date().toISOString(),
      url,
      ...metadata
    });
  }
  
  /**
   * Log payment verification/status
   */
  logStatus(reference: string, status: string, metadata?: Record<string, unknown>): void {
    this.baseLogger.info(`📊 Payment status (${status}):`, {
      timestamp: new Date().toISOString(),
      reference,
      status,
      ...metadata
    });
  }
  
  /**
   * Log payment completion
   */
  logComplete(reference: string, successful: boolean, metadata?: Record<string, unknown>): void {
    if (successful) {
      this.baseLogger.info('✅ Payment completed successfully:', {
        timestamp: new Date().toISOString(),
        reference,
        ...metadata
      });
    } else {
      this.baseLogger.warn('❌ Payment failed:', {
        timestamp: new Date().toISOString(),
        reference,
        ...metadata
      });
    }
  }
  
  /**
   * Log payment API response
   */
  logApiResponse(endpoint: string, response: unknown): void {
    this.baseLogger.info('🔌 API Response:', {
      timestamp: new Date().toISOString(),
      endpoint,
      response: JSON.stringify(response)
    });
  }
  
  /**
   * Log payment error
   */
  logError(message: string, error: unknown): void {
    this.baseLogger.error('🚨 Payment error:', {
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? error.message : JSON.stringify(error)
    });
  }
}

export const paymentLogger = new PaymentLogger(); 