import { useMutation, useQueryClient } from '@tanstack/react-query';
import usersApi, { UpdateUserPayload } from '@/lib/api/users';
import { User } from '@/lib/api/auth';

// Custom hook for user-related mutations
export function useUserQueries() {
  const queryClient = useQueryClient();

  // Update user profile mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserPayload }) => 
      usersApi.updateUser(userId, data),
    onSuccess: (updatedUser: User) => {
      // Update user data in the cache
      queryClient.setQueryData(['currentUser'], updatedUser);
    },
  });

  return {
    updateUser: updateUserMutation.mutateAsync,
    isUpdateLoading: updateUserMutation.isPending,
    updateError: updateUserMutation.error,
  };
} 