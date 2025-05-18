import { useQuery } from '@tanstack/react-query';
import ordersApi  from '@/lib/api/orders';
import { useToast } from '@/lib/toast-provider';
import { AxiosError } from 'axios';
import { useEffect } from 'react';

export function useOrderQueries() {
  const { error: showError } = useToast();

  // Get single order by ID
  const useOrderDetails = (orderId: string) => {
    const {
      data: order,
      isLoading,
      isError,
      error,
      refetch,
    } = useQuery({
      queryKey: ['order', orderId],
      queryFn: async () => {
        const response = await ordersApi.getOrder(orderId);
        return response;
      },
      enabled: !!orderId,
    });

    // Effect for handling query errors (logging/toast)
    useEffect(() => {
      if (isError && error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error('Order query error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message,
        });

        showError({
          title: 'Error fetching order',
          description:
            axiosError.response?.data?.message ||
            'Could not fetch your order details',
        });
      }
    }, [isError, error, showError]);

    return {
      order,
      isLoading,
      isError,
      refetch,
    };
  };

  // Get all orders for the current user
  const useUserOrders = () => {
    const {
      data: orders,
      isLoading,
      isError,
      error,
      refetch,
    } = useQuery({
      queryKey: ['orders'],
      queryFn: async () => {
        const response = await ordersApi.getUserOrders();
        return response;
      },
    });

    // Effect for handling query errors (logging/toast)
    useEffect(() => {
      if (isError && error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        console.error('Orders query error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          message: axiosError.message,
        });

        showError({
          title: 'Error fetching orders',
          description:
            axiosError.response?.data?.message ||
            'Could not fetch your orders',
        });
      }
    }, [isError, error, showError]);

    return {
      orders: orders || [],
      isLoading,
      isError,
      refetch,
    };
  };

  return {
    useOrderDetails,
    useUserOrders,
  };
}
