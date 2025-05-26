import axios from 'axios';
import storage, { STORAGE_KEYS } from './storage';
import { isMobile } from '@/lib/utils/platform';
import { config } from '@/lib/config';

// Create an Axios instance with custom config
const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and mobile headers
api.interceptors.request.use(
  async (config) => {
    try {
      // Log request details for debugging
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        platform: isMobile() ? 'mobile' : 'web'
      });

      // Get token from cross-platform storage
      const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add mobile platform headers when on mobile
      if (isMobile()) {
        config.headers['X-App-Platform'] = 'mobile';
        config.headers['X-Mobile-App'] = 'true';
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor failed:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  async (error) => {
    // Log error details for debugging
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    });

    const originalRequest = error.config;

    // Handle 401 (Unauthorized) errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token from cross-platform storage
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
