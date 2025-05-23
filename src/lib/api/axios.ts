import axios from 'axios';
import storage, { STORAGE_KEYS } from './storage';

// Create an Axios instance with custom config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://19igw0ftch.execute-api.us-east-2.amazonaws.com/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from cross-platform storage
    const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
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
