import React, { createContext, useContext, useState } from 'react';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
}

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (params: {
    email?: string;
    phone?: string;
    password: string;
    name: string;
    address?: Address;
  }) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  resendVerificationCode: () => Promise<void>;
  logout: () => void;
  pendingVerification: boolean;
  verificationIdentifier?: string;
  pendingAddress?: Address;
  requestPasswordReset: (identifier: string) => Promise<void>;
  verifyPasswordResetCode: (code: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
  passwordResetRequested: boolean;
  passwordResetVerified: boolean;
  resetIdentifier?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pendingVerification, setPendingVerification] =
    useState<boolean>(false);
  const [verificationIdentifier, setVerificationIdentifier] = useState<
    string | undefined
  >(undefined);
  const [pendingAddress, setPendingAddress] = useState<Address | undefined>(
    undefined
  );
  const [passwordResetRequested, setPasswordResetRequested] =
    useState<boolean>(false);
  const [passwordResetVerified, setPasswordResetVerified] =
    useState<boolean>(false);
  const [resetIdentifier, setResetIdentifier] = useState<string | undefined>(
    undefined
  );

  // Mock login function - would be replaced with actual API call
  const login = async (identifier: string, password: string) => {
    setIsLoading(true);

    try {
      // Determine if identifier is email or phone
      const isEmail = identifier.includes('@');

      // In a real implementation, we would validate the password here
      // Mock successful login only if password is not empty
      if (!password) throw new Error('Password is required');

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API delay

      // Mock user data - in production, this would come from your API
      const userData: User = {
        id: 'user-123',
        name: 'John Doe',
        ...(isEmail ? { email: identifier } : { phone: identifier }),
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
      };

      setUser(userData);

      // Save auth token to localStorage (in production use secure storage)
      localStorage.setItem('auth-token', 'mock-jwt-token');
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (params: {
    email?: string;
    phone?: string;
    password: string;
    name: string;
    address?: Address;
  }) => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store the identifier (email or phone) for verification
      const identifier = params.email || params.phone;
      if (!identifier) throw new Error('Email or phone is required');

      // Store address for later user creation
      if (params.address) {
        setPendingAddress(params.address);
      }

      setVerificationIdentifier(identifier);
      setPendingVerification(true);

      // In a real app, this would send the verification code via email or SMS
      console.log('Verification code sent to', identifier);
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify the code sent to email/phone
  const verifyCode = async (code: string) => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would validate the code with the backend
      if (code !== '123456') {
        // Mock validation
        throw new Error('Invalid verification code');
      }

      // Create user after successful verification
      const userData: User = {
        id: 'user-' + Date.now(),
        name: 'New User',
        ...(verificationIdentifier?.includes('@')
          ? { email: verificationIdentifier }
          : { phone: verificationIdentifier }),
        // Include address if provided during registration
        ...(pendingAddress ? { address: pendingAddress } : {}),
      };

      setUser(userData);
      setPendingVerification(false);
      setVerificationIdentifier(undefined);
      setPendingAddress(undefined);

      // Save auth token
      localStorage.setItem('auth-token', 'mock-jwt-token');
    } catch (error) {
      console.error('Verification failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const resendVerificationCode = async () => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!verificationIdentifier) {
        throw new Error('No identifier for verification');
      }

      // In a real app, this would resend the verification code
      console.log('Verification code resent to', verificationIdentifier);
    } catch (error) {
      console.error('Failed to resend verification code', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Request password reset
  const requestPasswordReset = async (identifier: string) => {
    setIsLoading(true);

    try {
      // Validate identifier
      if (!identifier) throw new Error('Email or phone is required');

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would send a reset code to the user's email or phone
      console.log('Password reset code sent to', identifier);

      // Store the identifier and set reset requested flag
      setResetIdentifier(identifier);
      setPasswordResetRequested(true);
      setPasswordResetVerified(false);
    } catch (error) {
      console.error('Password reset request failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify password reset code
  const verifyPasswordResetCode = async (code: string) => {
    setIsLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would validate the code with the backend
      if (code !== '123456') {
        // Mock validation
        throw new Error('Invalid reset code');
      }

      // Mark reset code as verified
      setPasswordResetVerified(true);
    } catch (error) {
      console.error('Reset code verification failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (newPassword: string) => {
    setIsLoading(true);

    try {
      // Validate new password
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (!passwordResetVerified) {
        throw new Error('Reset code has not been verified');
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would update the password in the backend
      console.log('Password has been reset for', resetIdentifier);

      // Reset states
      setPasswordResetRequested(false);
      setPasswordResetVerified(false);
      setResetIdentifier(undefined);
    } catch (error) {
      console.error('Password reset failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setPendingVerification(false);
    setVerificationIdentifier(undefined);
    setPendingAddress(undefined);
    setPasswordResetRequested(false);
    setPasswordResetVerified(false);
    setResetIdentifier(undefined);
    localStorage.removeItem('auth-token');
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        verifyCode,
        resendVerificationCode,
        logout,
        pendingVerification,
        verificationIdentifier,
        pendingAddress,
        requestPasswordReset,
        verifyPasswordResetCode,
        resetPassword,
        passwordResetRequested,
        passwordResetVerified,
        resetIdentifier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
