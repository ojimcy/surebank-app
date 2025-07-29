import axios from 'axios';
import storage, { STORAGE_KEYS } from './storage';

const baseURL = import.meta.env.VITE_API_URL || 'https://19igw0ftch.execute-api.us-east-2.amazonaws.com/v1';

// Create a separate axios instance for fetching CSRF tokens (to avoid infinite loops)
const tokenFetcher = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create an Axios instance with custom config
const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and CSRF tokens
api.interceptors.request.use(
  async (config) => {
    // Get auth token from cross-platform storage
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For protected methods (POST, PUT, PATCH, DELETE), ensure we have CSRF tokens
    const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (protectedMethods.includes(config.method?.toUpperCase() || '')) {
      let csrfToken = await storage.getItem(STORAGE_KEYS.CSRF_TOKEN);
      let csrfSecret = await storage.getItem(STORAGE_KEYS.CSRF_SECRET);
      
      // If we don't have tokens, make a quick GET request to get them
      if (!csrfToken || !csrfSecret) {
        try {
          const tokenResponse = await tokenFetcher.get('/users/me', {
            headers: { Authorization: token ? `Bearer ${token}` : undefined }
          });
          csrfToken = tokenResponse.headers['x-csrf-token'];
          csrfSecret = tokenResponse.headers['x-csrf-secret'];
          
          if (csrfToken && csrfSecret) {
            await storage.setItem(STORAGE_KEYS.CSRF_TOKEN, csrfToken);
            await storage.setItem(STORAGE_KEYS.CSRF_SECRET, csrfSecret);
          }
        } catch (error) {
          console.warn('Failed to fetch CSRF tokens:', error);
        }
      }
      
      if (csrfToken && csrfSecret) {
        config.headers['X-CSRF-Token'] = csrfToken;
        config.headers['X-CSRF-Secret'] = csrfSecret;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration and CSRF tokens
api.interceptors.response.use(
  async (response) => {
    // Extract and store CSRF tokens from response headers
    const csrfToken = response.headers['x-csrf-token'];
    const csrfSecret = response.headers['x-csrf-secret'];
    
    if (csrfToken) {
      await storage.setItem(STORAGE_KEYS.CSRF_TOKEN, csrfToken);
    }
    if (csrfSecret) {
      await storage.setItem(STORAGE_KEYS.CSRF_SECRET, csrfSecret);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized) errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear tokens from cross-platform storage
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.CSRF_TOKEN);
      await storage.removeItem(STORAGE_KEYS.CSRF_SECRET);
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
