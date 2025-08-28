import { useState, useEffect, useCallback } from 'react';
import { Search, ShoppingCart, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/ui/product-card';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useAllCategories } from '@/hooks/queries/useCategories';

// Server product data interface based on API response
interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  sellingPrice: number;
  costPrice: number;
  discount: number;
  quantity: number;
  images: string[];
  tags: string[];
  isSbAvailable: boolean;
  reviews: {
    userId: string;
    rating: number;
    reviewText: string;
    date: string;
  }[];
  averageRating: number;
  reviewCount: number;
  variations: unknown[];
  merchantId: string;
  createdAt: string;
  updatedAt: string;
  productId: {
    status: string;
    features: unknown[];
    tags: string[];
    isFeatured: boolean;
    isOutOfStock: boolean;
    isSbAvailable: boolean;
    name: string;
    description: string;
    barcode: string;
    categoryId: {
      _id: string;
      title: string;
      slug: string;
    } | null;
    brand: {
      _id: string;
      name: string;
    } | null;
    variations: unknown[];
    slug: string;
    reviews: unknown[];
    ratings?: number;
    createdAt: string;
    updatedAt: string;
    id: string;
  };
}

// API Response interface
interface ApiResponse {
  results: Product[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Category interface
interface CategoryOption {
  _id: string;
  title: string;
  slug: string;
}

type CategoryValue = 'All' | string;

function ProductCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryValue>('All');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 20,
  });
  const [cartCount, setCartCount] = useState(0);

  // API base URL - you may need to adjust this based on your setup
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1';

  // Get categories from API
  const { data: categoriesData, isLoading: categoriesLoading } = useAllCategories();

  // Update categories when data is loaded
  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  // Fetch products from server
  const fetchProducts = useCallback(async (page: number = 1, limit: number = 20, search?: string, categoryId?: string) => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE_URL}/products/catalogue?page=${page}&limit=${limit}`;
      if (search && search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }
      if (categoryId && categoryId !== 'All') {
        url += `&categoryId=${encodeURIComponent(categoryId)}`;
      }

      const response = await axios.get<ApiResponse>(url);
      const data = response.data;

      setProducts(data.results || []);
      setPagination({
        currentPage: data.page,
        totalPages: data.totalPages,
        totalResults: data.totalResults,
        limit: data.limit,
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Effect for initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() || searchQuery === '') {
        const categoryId = selectedCategory === 'All' ? undefined : selectedCategory;
        fetchProducts(1, 20, searchQuery, categoryId);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, fetchProducts]);

  // Products are already filtered server-side, so we can use them directly
  const filteredProducts = products;

  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    const categoryId = selectedCategory === 'All' ? undefined : selectedCategory;
    fetchProducts(page, pagination.limit, searchQuery, categoryId);
  };

  // Handle category change
  const handleCategoryChange = (category: CategoryValue) => {
    setSelectedCategory(category);
    // The effect will handle the API call
  };

  // Generate category options
  const categoryOptions = [
    { _id: 'All', title: 'All', slug: 'all' },
    ...categories,
  ];

  const handleAddToCart = (id: string) => {
    // Implementation would go here in a real app
    console.log(`Added product ${id} to cart`);
    setCartCount(prev => prev + 1);

    // You can add toast notification here
    // toast.success('Product added to cart!');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header with page title and cart button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          {!loading && pagination.totalResults > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {pagination.totalResults} products available
            </p>
          )}
        </div>
        <button className="p-2 relative rounded-full hover:bg-gray-100 transition-colors">
          <ShoppingCart className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {categoriesLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading categories...</span>
          </div>
        ) : (
          categoryOptions.map((category) => (
            <button
              key={category._id}
              className={cn(
                'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors',
                selectedCategory === category._id
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
              onClick={() => handleCategoryChange(category._id)}
            >
              {category.title}
            </button>
          ))
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      ) : error ? (
        /* Error State */
        <div className="py-10 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts(1, pagination.limit, searchQuery)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredProducts.length > 0 ? (
        /* Product Grid */
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id || product._id || ''}
                name={product.name}
                description={product.description || 'No description available'}
                price={product.sellingPrice}
                image={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/300x200/e2e8f0/1e293b?text=No+Image'}
                category={product.productId?.categoryId?.title || 'General'}
                rating={product.averageRating || 0}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Results Info */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalResults)} of{' '}
            {pagination.totalResults} products
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="py-10 text-center">
          <p className="text-gray-500">
            {searchQuery
              ? `No products found for "${searchQuery}". Try a different search term.`
              : 'No products available at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;
