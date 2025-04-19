import api from './axios';

export interface ProductResponse {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  price?: number;
  costPrice?: number;
  sellingPrice?: number;
  discount?: number;
  quantity?: number;
  images?: string[];
  category?: string;
  isAvailable?: boolean;
  isSbAvailable?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  merchantId?: string;
  variations?: unknown[];
  reviews?: unknown[];
  productId?: {
    name: string;
    description?: string;
    slug: string;
    categoryId?: {
      title: string;
      id: string;
    };
    brand?: {
      name: string;
      id: string;
    };
    status?: string;
    features?: unknown[];
    tags?: string[];
    isFeatured?: boolean;
    isOutOfStock?: boolean;
    isSbAvailable?: boolean;
    barcode?: string;
    variations?: unknown[];
    reviews?: unknown[];
    createdAt: string;
    updatedAt: string;
    id: string;
    price?: number;
    costPrice?: number;
    sellingPrice?: number;
    [key: string]: unknown; // For any other properties in the productId object
  };
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  sellingPrice?: number;
  discount?: number;
  quantity?: number;
  images: string[];
  category: string;
  isAvailable: boolean;
  isSbAvailable?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  productId?: {
    name: string;
    description?: string;
    slug: string;
    categoryId?: {
      title: string;
      id: string;
    };
    brand?: {
      name: string;
      id: string;
    };
    createdAt: string;
    updatedAt: string;
    id: string;
    [key: string]: unknown; // For any other properties in the productId object
  };
}

export interface PaginatedResponse<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Define the category interface
export interface Category {
  title: string;
  slug?: string;
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

const productsApi = {
  // Get all products that are available for SB with pagination
  getSBProducts: async (
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<ProductResponse>>(
      `/products/catalogue?page=${page}&limit=${limit}`
    );

    return {
      results: response.data.results.map(normalizeProduct),
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages,
      totalResults: response.data.totalResults,
    };
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<ProductResponse>(
      `/products/catalogue/${id}`
    );
    return normalizeProduct(response.data);
  },

  // Get products by category with pagination
  getProductsByCategory: async (
    categoryId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<ProductResponse>>(
      `/products/catalogue?categoryId=${categoryId}&page=${page}&limit=${limit}`
    );

    return {
      results: response.data.results.map(normalizeProduct),
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages,
      totalResults: response.data.totalResults,
    };
  },

  // Search products with pagination
  searchProducts: async (
    query: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<ProductResponse>>(
      `/products/catalogue?search=${query}&page=${page}&limit=${limit}`
    );

    return {
      results: response.data.results.map(normalizeProduct),
      page: response.data.page,
      limit: response.data.limit,
      totalPages: response.data.totalPages,
      totalResults: response.data.totalResults,
    };
  },

  // Get product categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/stores/categories');
    return response.data;
  },
};

// Helper function to normalize product data
// This handles the case where productId contains nested product information
function normalizeProduct(product: ProductResponse): Product {
  // If product has a productId object with name, use that as the source for NAME and DESCRIPTION
  // but keep using the catalog product for PRICE information if available
  if (product.productId && typeof product.productId === 'object') {
    const price =
      product.sellingPrice ||
      product.costPrice ||
      product.price ||
      0;

    return {
      _id: product.id || product._id || '',
      // Get name and description from productId if available
      name: product.name,
      description: product.description,
      // Get price information from either source
      price: price,
      costPrice: product.costPrice || undefined,
      sellingPrice: product.sellingPrice,
      discount: product.discount,
      quantity: product.quantity,
      images: product.images || [],
      // Get category from productId if available
      category: product.productId.categoryId?.title || product.category || '',
      isAvailable: product.isAvailable !== false,
      isSbAvailable: product.isSbAvailable,
      tags: product.tags,
      createdAt: product.createdAt || '',
      updatedAt: product.updatedAt || '',
      productId: product.productId,
    };
  }

  // Otherwise, return the product as is with guaranteed fields
  return {
    _id: product.id || product._id || '',
    name: product.name,
    description: product.description,
    price: product.sellingPrice || product.costPrice || product.price || 0,
    costPrice: product.costPrice,
    sellingPrice: product.sellingPrice,
    discount: product.discount,
    quantity: product.quantity,
    images: product.images || [],
    category: product.category || '',
    isAvailable: product.isAvailable !== false,
    isSbAvailable: product.isSbAvailable,
    tags: product.tags,
    createdAt: product.createdAt || '',
    updatedAt: product.updatedAt || '',
    productId: product.productId,
  };
}

export default productsApi;
