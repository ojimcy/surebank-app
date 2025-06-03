import { useQuery, useQueryClient } from '@tanstack/react-query';
import transactionsApi, { Transaction, TransactionFilters } from '@/lib/api/transactions';
import { useToast } from '@/lib/toast-provider';
import { AxiosError } from 'axios';
import { useEffect } from 'react';

export interface FormattedTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'other';
  category: string;
  amount: number;
  date: string;
  time: string;
  rawTransaction: Transaction;
}

export function useTransactionQueries(filters: TransactionFilters = {}) {
  const { page = 1 } = filters;
  const { error: showError } = useToast();

  // Helper function to determine transaction category from narration
  const getCategoryFromNarration = (transaction: Transaction): string => {
    const narration = transaction.narration.toLowerCase();
    
    if (narration.includes('daily contribution')) {
      return 'DS Contribution';
    } else if (narration.includes('sb contribution')) {
      return 'SB Contribution';
    } else if (
      narration.includes('interest package withdrawal: Mature withdrawal') || 
      narration.includes('interest package withdrawal: early withdrawal') || 
      narration.includes('sb transfer')
    ) {
      return 'Move to Available Balance';
    } else if (
      narration.includes('withdrawal request') || 
      narration.includes('self withdrawal request - ds') || 
      narration.includes('request cash')
    ) {
      return 'Withdrawal';
    } else if (
      narration.includes('ibs payment') || 
      narration.includes('ibs via paystack') || 
      narration.includes('ibs contribution') ||
      narration.includes('paystack payment')
    ) {
      return 'IBS Payment';
    } else if (narration.includes('payment for order')) {
      return 'Order Payment';
    } else {
      return 'Transaction';
    }
  };

  // Helper function to format date for display
  const formatTransactionDate = (date: number): { dateString: string; timeString: string } => {
    const transactionDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateString: string;
    if (transactionDate.toDateString() === today.toDateString()) {
      dateString = 'Today';
    } else if (transactionDate.toDateString() === yesterday.toDateString()) {
      dateString = 'Yesterday';
    } else {
      dateString = transactionDate.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    
    const timeString = transactionDate.toLocaleTimeString('en-NG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return { dateString, timeString };
  };

  // Helper function to determine transaction type
  const getTransactionType = (transaction: Transaction): 'deposit' | 'withdrawal' | 'other' => {
    if (transaction.narration.toLowerCase().includes('payment for order')) {
      return 'other';
    }
    return transaction.direction === 'inflow' ? 'deposit' : 'withdrawal';
  };

  // Format transactions for UI display
  const formatTransactions = (transactions: Transaction[]): FormattedTransaction[] => {
    return transactions.map(transaction => {
      const { dateString, timeString } = formatTransactionDate(transaction.date);
      
      return {
        id: transaction.id,
        type: getTransactionType(transaction),
        category: getCategoryFromNarration(transaction),
        amount: transaction.amount,
        date: dateString,
        time: timeString,
        rawTransaction: transaction
      };
    });
  };

  const queryClient = useQueryClient();

  // Get user transactions query
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    isError: isTransactionsError,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const response = await transactionsApi.getUserTransactions(filters);
      return {
        ...response,
        formattedTransactions: formatTransactions(response.transactions)
      };
    },
  });
  
  // Prefetch next page
  const prefetchNextPage = async () => {
    if (transactionsData && page < transactionsData.totalPages) {
      const nextPageFilters = { ...filters, page: page + 1 };
      await queryClient.prefetchQuery({
        queryKey: ['transactions', nextPageFilters],
        queryFn: async () => {
          const response = await transactionsApi.getUserTransactions(nextPageFilters);
          return {
            ...response,
            formattedTransactions: formatTransactions(response.transactions)
          };
        },
      });
    }
  };

  // Effect for handling query errors (logging/toast)
  useEffect(() => {
    if (isTransactionsError && transactionsError) {
      const axiosError = transactionsError as AxiosError<{ message?: string }>;
      console.error('Transactions query error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });

      showError({
        title: 'Error fetching transactions',
        description:
          axiosError.response?.data?.message ||
          'Could not fetch your transactions',
      });
    }
  }, [isTransactionsError, transactionsError, showError]);

  return {
    // Transactions data
    transactions: transactionsData?.transactions || [],
    formattedTransactions: transactionsData?.formattedTransactions || [],
    pagination: transactionsData ? {
      page: transactionsData.page,
      limit: transactionsData.limit,
      totalPages: transactionsData.totalPages,
      totalResults: transactionsData.totalResults
    } : null,

    // Loading/error states
    isTransactionsLoading,
    isTransactionsError,
    
    // Actions
    refetchTransactions,
    prefetchNextPage,
  };
}
