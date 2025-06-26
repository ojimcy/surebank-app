import api from './axios';
import storage, { STORAGE_KEYS } from './storage';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  role: string;
  isActive: boolean;
  kycStatus: string;
  kycType: string;
  isEmailVerified: boolean;
  isTwoFactorAuthEnabled: boolean;
  passwordAttempts: number;
  lastPasswordChange: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  identifier: string; // email or phone
  password: string;
}

export interface RegisterPayload {
  email?: string;
  phoneNumber?: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
}

export interface VerifyPayload {
  code: string;
  email?: string;
}

export interface ResetPasswordPayload {
  email: string;
}

export interface VerifyResetCodePayload {
  code: string;
  email: string;
}

export interface NewPasswordPayload {
  password: string;
  code: string;
  email: string;
}

export interface TokenResponse {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

// Authentication API functions
const authApi = {
  // Login with email/phone and password
  login: async (payload: LoginPayload): Promise<User> => {
    const response = await api.post<{ user: User; tokens: TokenResponse }>(
      '/auth/login',
      payload
    );

    // Store tokens using cross-platform storage
    if (response.data.tokens.access.token) {
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.tokens.access.token);
      await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.tokens.refresh.token);
    }

    return response.data.user;
  },

  // Register a new user
  register: async (
    payload: RegisterPayload
  ): Promise<{ success: boolean; identifier: string }> => {
    const response = await api.post<{ success: boolean; identifier: string }>(
      '/auth/register',
      payload
    );
    return response.data;
  },

  // Verify account with code
  verifyAccount: async (payload: VerifyPayload): Promise<User> => {
    const response = await api.post<{ user: User; tokens: TokenResponse }>(
      '/auth/verify-email',
      payload
    );

    // Store tokens using cross-platform storage
    if (response.data.tokens.access.token) {
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.tokens.access.token);
      await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.tokens.refresh.token);
    }

    return response.data.user;
  },

  // Resend verification code
  resendVerification: async (
    identifier: string
  ): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      '/auth/send-verification-email',
      { identifier }
    );
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (
    payload: ResetPasswordPayload
  ): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      '/auth/forgot-password',
      payload
    );
    return response.data;
  },

  // Verify password reset code
  verifyResetCode: async (
    payload: VerifyResetCodePayload
  ): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      '/auth/verify-reset-code',
      payload
    );
    return response.data;
  },

  // Reset password with new password
  resetPassword: async (
    payload: NewPasswordPayload
  ): Promise<{ success: boolean }> => {
    const response = await api.post<{ success: boolean }>(
      '/auth/reset-password',
      payload
    );
    return response.data;
  },

  // Logout and clear token
  logout: async (): Promise<void> => {
    await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

export default authApi;
