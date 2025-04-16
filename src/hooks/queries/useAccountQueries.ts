import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAccount,
  getUserAccounts,
  getUserAccountByType,
  Account,
} from '@/lib/api/accounts';
import { useToast } from '@/lib/toast-provider';
import { AxiosError } from 'axios';
import { useEffect } from 'react';

export function useAccountQueries() {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToast();

  // Get user accounts query
  const {
    data: accounts = [] as Account[],
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    error: accountsError,
    refetch: refetchAccounts,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const fetchedAccounts = await getUserAccounts();
      console.log('Fetched accounts:', fetchedAccounts);
      return fetchedAccounts;
    },
  });

  // Get specific account by type
  const getAccountByType = async (accountType: 'ds' | 'sb' | 'ibs') => {
    try {
      return await getUserAccountByType(accountType);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Get account by type error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      showError({
        title: 'Error fetching account',
        description:
          axiosError.response?.data?.message ||
          `Could not fetch the ${accountType} account`,
      });

      throw error;
    }
  };

  // Effect for handling query errors (logging/toast)
  useEffect(() => {
    if (isAccountsError && accountsError) {
      const axiosError = accountsError as AxiosError<{ message?: string }>;
      if (axiosError.response?.status !== 404) {
        console.error('Account query error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message,
        });

        showError({
          title: 'Error fetching accounts',
          description:
            axiosError.response?.data?.message ||
            'Could not fetch your accounts',
        });
      }
    }
  }, [isAccountsError, accountsError, showError]);

  // Create account mutation
  const {
    mutate: createUserAccount,
    isPending: isCreateAccountLoading,
    isError: isCreateAccountError,
  } = useMutation({
    mutationFn: async (accountType: 'ds' | 'sb' | 'ibs') => {
      try {
        console.log('Creating account:', accountType);
        const result = await createAccount(accountType);
        console.log('Create account result:', result);
        return result;
      } catch (error) {
        console.error('Error creating account:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refetch accounts after creating a new one
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      showSuccess({
        title: 'Account Created',
        description: 'Your new account has been created successfully',
      });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      console.error('Create account error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      showError({
        title: 'Error creating account',
        description:
          axiosError.response?.data?.message ||
          'Could not create account. Please try again.',
      });
    },
  });

  // Calculate total balance across all accounts
  const totalAvailableBalance = accounts.reduce(
    (total: number, account: Account) =>
      total + (account.availableBalance || 0),
    0
  );

  return {
    // Queries data
    accounts,
    totalAvailableBalance,
    hasAccounts: accounts.length > 0,

    // Action methods
    createAccount: createUserAccount,
    refetchAccounts,
    getAccountByType,

    // Loading/error states
    isAccountsLoading,
    isAccountsError,
    isCreateAccountLoading,
    isCreateAccountError,
  };
}
