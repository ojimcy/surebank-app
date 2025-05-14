import { useUserQueries } from './queries/useUserQueries';
import { UpdateUserPayload } from '@/lib/api/users';
import { useToast } from '@/lib/toast-provider';
import { extractErrorMessage } from '@/lib/utils';

// This hook provides a simplified interface to user profile functionality
export function useUserProfile() {
  const userQueries = useUserQueries();
  const { success, error: showError } = useToast();

  // Update user profile wrapper with toast notifications
  const updateProfile = async (userId: string, data: UpdateUserPayload) => {
    try {
      const updatedUser = await userQueries.updateUser({ userId, data });
      success({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.',
      });
      return updatedUser;
    } catch (err) {
      console.error('Profile update failed', err);
      const errorMessage = extractErrorMessage(err);
      showError({
        title: 'Update Failed',
        description: errorMessage,
      });
      throw err;
    }
  };

  return {
    updateProfile,
    isUpdateLoading: userQueries.isUpdateLoading,
    updateError: userQueries.updateError,
  };
} 