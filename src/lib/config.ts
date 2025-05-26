import { Capacitor } from '@capacitor/core';

// API Configuration
const getApiBaseUrl = (): string => {
  // For mobile platforms, always use the production API
  if (Capacitor.isNativePlatform()) {
    return 'https://19igw0ftch.execute-api.us-east-2.amazonaws.com/v1';
  }
  
  // For web, use environment variable or fallback to production
  return import.meta.env.VITE_API_URL || 'https://19igw0ftch.execute-api.us-east-2.amazonaws.com/v1';
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  timeout: 30000,
};

console.log('API Config:', {
  platform: Capacitor.isNativePlatform() ? 'mobile' : 'web',
  apiBaseUrl: config.apiBaseUrl,
}); 