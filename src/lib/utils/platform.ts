import { Capacitor } from '@capacitor/core';

export const isMobile = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const isWeb = (): boolean => {
  return !Capacitor.isNativePlatform();
};

export const getRedirectUrl = (path: string): string | undefined => {
  if (isMobile()) {
    // For mobile, don't use redirect URLs - use polling instead
    return undefined;
  } else {
    // For web, use current origin
    return `${window.location.origin}${path}`;
  }
}; 