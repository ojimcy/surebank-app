import api from './axios';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  isSbAvailable: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

const productsApi = {
  // Get all products that are available for SB
  getSBProducts: async (): Promise<Product[]> => {
    const response = await api.get<Product[]>(
      '/products/catalogue?isSbAvailable=true'
    );
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/catalogue/${id}`);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(
      `/products/catalogue?category=${category}&isSbAvailable=true`
    );
    return response.data;
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(
      `/products/catalogue?search=${query}&isSbAvailable=true`
    );
    return response.data;
  },

  // Get product categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/products/categories');
    return response.data;
  },
};

export default productsApi;
