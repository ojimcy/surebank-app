import axios from 'axios';

// Create an Axios instance with custom config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-token');
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

      // You could implement a token refresh mechanism here
      // For now, just redirect to login
      localStorage.removeItem('auth-token');
      window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
