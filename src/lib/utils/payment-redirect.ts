import { Capacitor } from '@capacitor/core';

export const getPaymentRedirectUrl = (path: string): string => {
  if (Capacitor.isNativePlatform()) {
    // For mobile apps, use custom URL scheme
    return `surebank://payments${path}`;
  } else {
    // For web, use current origin
    return `${window.location.origin}${path}`;
  }
};

export const getPaymentSuccessUrl = (): string => {
  return getPaymentRedirectUrl('/success');
};

export const getPaymentErrorUrl = (): string => {
  return getPaymentRedirectUrl('/error');
}; 