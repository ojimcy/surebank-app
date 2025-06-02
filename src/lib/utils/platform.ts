import { Capacitor } from '@capacitor/core';
import { logger } from './logger';

// Create a platform-specific logger
const platformLogger = logger.create('Platform');

/**
 * Check if running on mobile (native) platform
 */
export const isMobile = (): boolean => {
  const isNative = Capacitor.isNativePlatform();
  platformLogger.debug(`Platform check: isMobile = ${isNative}`);
  return isNative;
};

/**
 * Check if running on web platform
 */
export const isWeb = (): boolean => {
  return !isMobile();
};

/**
 * Window WebKit interface for iOS detection
 */
interface WebKitInterface {
  messageHandlers?: unknown;
}

/**
 * UserAgentData interface for modern browsers
 */
interface UserAgentData {
  brands?: unknown[];
}

/**
 * Extended Navigator interface with userAgentData
 */
interface ExtendedNavigator extends Navigator {
  userAgentData?: UserAgentData;
}

/**
 * Get platform info for debugging
 */
export const getPlatformInfo = (): Record<string, unknown> => {
  const info = {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    userAgent: navigator.userAgent,
    webViewVersion: ((window as Window & { webkit?: WebKitInterface }).webkit?.messageHandlers) 
      ? 'iOS WebKit' 
      : ((navigator as ExtendedNavigator).userAgentData?.brands) 
      ? 'Modern WebView' 
      : 'Unknown',
  };
  
  platformLogger.debug('Platform info:', info);
  return info;
};

/**
 * Get a properly formatted redirect URL for the current platform
 */
export const getRedirectUrl = (path: string): string | undefined => {
  if (isMobile()) {
    // For mobile, use the navigate action format for deep linking
    // This creates a deep link that the app can properly handle
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const redirectUrl = `surebank://navigate?action=navigate&route=/${cleanPath}`;
    platformLogger.info(`Created mobile redirect URL: ${redirectUrl}`);
    return redirectUrl;
  } else {
    // For web, use current origin
    const redirectUrl = `${window.location.origin}${path}`;
    platformLogger.info(`Created web redirect URL: ${redirectUrl}`);
    return redirectUrl;
  }
}; 