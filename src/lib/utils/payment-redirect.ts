import { Capacitor } from '@capacitor/core';
import { logger } from './logger';

// Create a logger for payment redirects
const redirectLogger = logger.create('PaymentRedirect');

/**
 * Get payment redirect URL formatted for the current platform
 */
export const getPaymentRedirectUrl = (path: string): string => {
  if (Capacitor.isNativePlatform()) {
    // For mobile apps, use custom URL scheme with 'navigate' action
    // Format: surebank://navigate?action=navigate&route=/payments/success&reference=123
    const redirectUrl = `surebank://navigate?action=navigate&route=/payments${path}`;
    redirectLogger.info(`Created mobile payment redirect URL: ${redirectUrl}`);
    return redirectUrl;
  } else {
    // For web, use current origin
    const redirectUrl = `${window.location.origin}/payments${path}`;
    redirectLogger.info(`Created web payment redirect URL: ${redirectUrl}`);
    return redirectUrl;
  }
};

/**
 * Get payment success URL formatted for the current platform
 */
export const getPaymentSuccessUrl = (): string => {
  return getPaymentRedirectUrl('/success');
};

/**
 * Get payment error URL formatted for the current platform
 */
export const getPaymentErrorUrl = (): string => {
  return getPaymentRedirectUrl('/error');
}; 