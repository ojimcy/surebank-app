import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authApi, {
  LoginPayload,
  RegisterPayload,
  VerifyPayload,
  ResetPasswordPayload,
  VerifyResetCodePayload,
  NewPasswordPayload,
  User,
} from '@/lib/api/auth';
import { useEffect, useState } from 'react';
import storage, { STORAGE_KEYS } from '@/lib/api/storage';

// Custom hook for auth-related queries and mutations
export function useAuthQueries() {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(false);

  // Check for token on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      setHasToken(!!token);
    };
    
    checkToken();
  }, []);

  // Get current user query (will run on component mount if enabled)
  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: 1,
    enabled: hasToken, // Only run if token exists
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (user) => {
      // Update user data in the cache
      queryClient.setQueryData(['currentUser'], user);
      setHasToken(true);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
  });

  // Verify account mutation
  const verifyAccountMutation = useMutation({
    mutationFn: (payload: VerifyPayload) => authApi.verifyAccount(payload),
    onSuccess: (user) => {
      // Update user data in the cache
      queryClient.setQueryData(['currentUser'], user);
    },
  });

  // Resend verification code mutation
  const resendVerificationMutation = useMutation({
    mutationFn: (identifier: string) => authApi.resendVerification(identifier),
  });

  // Request password reset mutation
  const requestPasswordResetMutation = useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      authApi.requestPasswordReset(payload),
  });

  // Verify reset code mutation
  const verifyResetCodeMutation = useMutation({
    mutationFn: (payload: VerifyResetCodePayload) =>
      authApi.verifyResetCode(payload),
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (payload: NewPasswordPayload) => authApi.resetPassword(payload),
  });

  // Logout function with client-side cache clearing
  const logout = async () => {
    await authApi.logout();
    // Clear user from cache
    queryClient.setQueryData(['currentUser'], null);
    // Invalidate all queries
    queryClient.invalidateQueries();
    setHasToken(false);
  };

  return {
    // User data and loading state
    user: currentUserQuery.data as User | undefined,
    isLoading: currentUserQuery.isLoading,
    isError: currentUserQuery.isError,

    // Auth mutations
    login: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,

    register: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,

    verifyAccount: verifyAccountMutation.mutateAsync,
    isVerifyLoading: verifyAccountMutation.isPending,

    resendVerification: resendVerificationMutation.mutateAsync,
    isResendLoading: resendVerificationMutation.isPending,

    requestPasswordReset: requestPasswordResetMutation.mutateAsync,
    isResetRequestLoading: requestPasswordResetMutation.isPending,

    verifyResetCode: verifyResetCodeMutation.mutateAsync,
    isVerifyResetLoading: verifyResetCodeMutation.isPending,

    resetPassword: resetPasswordMutation.mutateAsync,
    isResetPasswordLoading: resetPasswordMutation.isPending,

    // Logout function
    logout,
  };
}
