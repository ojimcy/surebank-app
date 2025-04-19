import api from './axios';

export interface ProductResponse {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  price?: number;
  costPrice?: number;
  sellingPrice?: number;
  images?: string[];
  category?: string;
  isAvailable?: boolean;
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
  sellingPrice?: number;
  images: string[];
  category: string;
  isAvailable: boolean;
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
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
    limit = 10
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<ProductResponse[]>(
      `/products/catalogue?page=${page}&limit=${limit}`
    );

    // If the API doesn't return pagination info, simulate it
    const total =
      parseInt(response.headers['x-total-count'] || '0', 10) ||
      response.data.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: response.data.map(normalizeProduct),
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
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
    const response = await api.get<ProductResponse[]>(
      `/products/catalogue?categoryId=${categoryId}&page=${page}&limit=${limit}`
    );

    // If the API doesn't return pagination info, simulate it
    const total =
      parseInt(response.headers['x-total-count'] || '0', 10) ||
      response.data.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: response.data.map(normalizeProduct),
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  },

  // Search products with pagination
  searchProducts: async (
    query: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<ProductResponse[]>(
      `/products/catalogue?search=${query}&page=${page}&limit=${limit}`
    );

    // If the API doesn't return pagination info, simulate it
    const total =
      parseInt(response.headers['x-total-count'] || '0', 10) ||
      response.data.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data: response.data.map(normalizeProduct),
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
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
      product.productId.sellingPrice ||
      product.productId.costPrice ||
      product.productId.price ||
      0;

    return {
      _id: product.id || product._id || '',
      // Get name and description from productId if available
      name: product.productId.name || product.name,
      description: product.productId.description || product.description,
      // Get price information from either source
      price: price,
      sellingPrice: product.sellingPrice || product.productId.sellingPrice,
      images: product.images || [],
      // Get category from productId if available
      category: product.productId.categoryId?.title || product.category || '',
      isAvailable: product.isAvailable !== false,
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
    sellingPrice: product.sellingPrice,
    images: product.images || [],
    category: product.category || '',
    isAvailable: product.isAvailable !== false,
    createdAt: product.createdAt || '',
    updatedAt: product.updatedAt || '',
    productId: product.productId,
  };
}

export default productsApi;
