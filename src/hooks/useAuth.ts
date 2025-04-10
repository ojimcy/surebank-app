import { useAuthQueries } from './queries/useAuthQueries';

// This hook provides a simplified interface to auth functionality
// It wraps the React Query mutations and queries into a simple API
export function useAuth() {
  const authQueries = useAuthQueries();

  return {
    // User state
    user: authQueries.user,
    isAuthenticated: !!authQueries.user,
    isLoading: authQueries.isLoading,
    isError: authQueries.isError,

    // Authentication methods with simpler API
    login: authQueries.login,
    register: authQueries.register,
    verifyCode: authQueries.verifyAccount,
    resendVerificationCode: authQueries.resendVerification,
    requestPasswordReset: authQueries.requestPasswordReset,
    verifyPasswordResetCode: authQueries.verifyResetCode,
    resetPassword: authQueries.resetPassword,
    logout: authQueries.logout,

    // Loading states
    isLoginLoading: authQueries.isLoginLoading,
    isRegisterLoading: authQueries.isRegisterLoading,
    isVerifyLoading: authQueries.isVerifyLoading,
    isResendLoading: authQueries.isResendLoading,
    isResetRequestLoading: authQueries.isResetRequestLoading,
    isVerifyResetLoading: authQueries.isVerifyResetLoading,
    isResetPasswordLoading: authQueries.isResetPasswordLoading,
  };
}
