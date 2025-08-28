import api from './axios';

// Category interfaces
export interface Category {
  _id: string;
  id: string;
  title: string;
  slug: string;
  image?: string;
  icon?: string;
  categoryId?: {
    _id: string;
    title: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

// API Response interface for paginated categories
export interface CategoriesResponse {
  results: Category[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Categories API functions
const categoriesApi = {
  // Get all categories (without pagination)
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories/all');
    return response.data;
  },

  // Get categories with pagination
  getCategories: async (params?: {
    page?: number;
    limit?: number;
    title?: string;
    slug?: string;
    sortBy?: string;
  }): Promise<CategoriesResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.title) queryParams.append('title', params.title);
    if (params?.slug) queryParams.append('slug', params.slug);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    const url = queryParams.toString() 
      ? `/categories?${queryParams.toString()}` 
      : '/categories';
      
    const response = await api.get<CategoriesResponse>(url);
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (categoryId: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${categoryId}`);
    return response.data;
  },
};

export default categoriesApi;