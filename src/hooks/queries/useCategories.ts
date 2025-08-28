import { useQuery } from '@tanstack/react-query';
import categoriesApi from '@/lib/api/categories';

// Query keys for React Query
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
  allCategories: () => [...categoryKeys.all, 'all'] as const,
};

// Hook to get all categories (without pagination)
export const useAllCategories = () => {
  return useQuery({
    queryKey: categoryKeys.allCategories(),
    queryFn: categoriesApi.getAllCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Hook to get categories with pagination
export const useCategories = (params?: {
  page?: number;
  limit?: number;
  title?: string;
  slug?: string;
  sortBy?: string;
}) => {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoriesApi.getCategories(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get category by ID
export const useCategory = (categoryId: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(categoryId),
    queryFn: () => categoriesApi.getCategoryById(categoryId),
    enabled: !!categoryId, // Only run if categoryId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export default {
  useAllCategories,
  useCategories,
  useCategory,
};