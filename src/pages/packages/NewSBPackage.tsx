import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import packagesApi, { CreateSBPackageParams } from '../../lib/api/packages';
import productsApi, {
  Product,
  Category,
  PaginatedResponse,
} from '../../lib/api/products';
import { toast } from 'react-hot-toast';
import { useAccountQueries } from '@/hooks/queries/useAccountQueries';
import { SelectAccountType } from '@/components/accounts/SelectAccountType';
import { ProductCard } from '@/components/ui/product-card';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

// Error type for API errors
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message: string;
}

function NewSBPackage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasRequiredAccount, setHasRequiredAccount] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const pageSize = 20; // Increased from 9 to 20 products per page
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Get the createAccount function
  const { createAccount, isCreateAccountLoading } = useAccountQueries();

  useEffect(() => {
    const checkAccount = async () => {
      setIsLoading(true);
      try {
        const hasAccount = await packagesApi.checkAccountType('sb');
        setHasRequiredAccount(hasAccount);
      } catch (error) {
        console.error('Error checking account:', error);
        setHasRequiredAccount(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccount();
  }, []);

  // Recheck account status after account creation attempt
  useEffect(() => {
    if (!isCreateAccountLoading && hasRequiredAccount === false) {
      // Only recheck if we previously didn't have an account
      const recheckAccount = async () => {
        try {
          const hasAccount = await packagesApi.checkAccountType('sb');
          if (hasAccount) {
            setHasRequiredAccount(true);
          }
        } catch (error) {
          console.error('Error rechecking account:', error);
        }
      };

      recheckAccount();
    }
  }, [isCreateAccountLoading, hasRequiredAccount]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['productCategories'],
    queryFn: () => productsApi.getCategories(),
    enabled: hasRequiredAccount === true,
  });

  const {
    data: productData,
    isLoading: isProductsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PaginatedResponse<Product>>({
    queryKey: ['products', selectedCategory, searchQuery, pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const page = Number(pageParam);
      if (searchQuery) {
        return productsApi.searchProducts(searchQuery, page, pageSize);
      }
      if (selectedCategory) {
        return productsApi.getProductsByCategory(
          selectedCategory,
          page,
          pageSize
        );
      }
      return productsApi.getSBProducts(page, pageSize);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.page < lastPage.totalPages
        ? lastPage.page + 1
        : undefined;
    },
    enabled: hasRequiredAccount === true,
  });

  const allProducts = productData?.pages.flatMap((page) => page.results) || [];
  const totalResults = productData?.pages[0]?.totalResults || 0;

  // Intersection observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isProductsLoading || isFetchingNextPage) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isProductsLoading, isFetchingNextPage, fetchNextPage, hasNextPage]
  );

  const createPackageMutation = useMutation({
    mutationFn: (data: CreateSBPackageParams) =>
      packagesApi.createSBPackage(data),
    onSuccess: () => {
      toast.success('SB package created successfully!');
      navigate('/packages/new/success', {
        state: {
          packageType: 'sb',
          product: selectedProduct?.name,
          amount: selectedProduct?.price,
        },
      });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to create package');
    },
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a product first');
      return;
    }

    const packageData: CreateSBPackageParams = {
      product: selectedProduct._id,
    };

    createPackageMutation.mutate(packageData);
  };

  const handleCreateAccount = (accountType: 'ds' | 'sb' | 'ibs') => {
    createAccount(accountType);
    // The useEffect watching isCreateAccountLoading will recheck if we have the required account
    // Modal will close automatically when account creation completes via the hook's built-in behavior
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasRequiredAccount === false) {
    return (
      <div className="space-y-6">
        <div className="flex items-center mb-4">
          <Link
            to="/packages/new"
            className="p-2 rounded-full bg-[#F6F8FA] hover:bg-[#E5E8ED] transition-colors mr-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[#212529]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-[#212529]">SB Package</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-lg font-medium text-[#212529] mb-2">
              SB Account Required
            </h2>
            <p className="text-[#6c757d] mb-6">
              You need to have an SB account before creating a package. Click
              the button below to create your SB account.
            </p>
            <button
              onClick={() => setShowAccountTypeModal(true)}
              className="inline-block px-4 py-2 bg-[#0066A1] text-white rounded-lg hover:bg-[#005085] transition-colors"
            >
              Create SB Account
            </button>
          </div>
        </div>

        {/* Account Type Selection Modal */}
        {showAccountTypeModal && (
          <SelectAccountType
            onSelect={handleCreateAccount}
            onCancel={() => setShowAccountTypeModal(false)}
            isLoading={isCreateAccountLoading}
            preselectedType="sb"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <Link
          to="/packages/new"
          className="p-2 rounded-full bg-[#F6F8FA] hover:bg-[#E5E8ED] transition-colors mr-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#212529]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-[#212529]">SB Package</h1>
      </div>

      {!selectedProduct ? (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#6c757d]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 p-3 border border-[#CED4DA] rounded-lg focus:ring-2 focus:ring-[#0066A1] focus:border-[#0066A1] outline-none transition"
                />
              </div>

              <div className="flex overflow-x-auto pb-2 space-x-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                    selectedCategory === ''
                      ? 'bg-[#0066A1] text-white'
                      : 'bg-[#F6F8FA] text-[#495057] hover:bg-[#E5E8ED]'
                  } transition-colors`}
                >
                  All Products
                </button>
                {categories.map((category, index) => (
                  <button
                    key={category.id || index}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-[#0066A1] text-white'
                        : 'bg-[#F6F8FA] text-[#495057] hover:bg-[#E5E8ED]'
                    } transition-colors`}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-[#212529]">
                Select a Product
              </h2>
              {totalResults > 0 && (
                <p className="text-sm text-[#6c757d]">
                  Showing products ({totalResults} total)
                </p>
              )}
            </div>

            {isProductsLoading && allProducts.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : allProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 bg-[#F6F8FA] rounded-full flex items-center justify-center text-[#6c757d]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-[#6c757d]">No products found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {allProducts.map((product, index) => {
                    // Add ref to the last product for infinite scroll
                    const isLastProduct = index === allProducts.length - 1;
                    const price = product.sellingPrice || product.price || 0;

                    return (
                      <div
                        key={product._id}
                        ref={isLastProduct ? lastProductRef : null}
                      >
                        <div
                          onClick={() => handleProductSelect(product)}
                          className="h-full relative"
                        >
                          <ProductCard
                            id={product._id}
                            name={product.name}
                            description={product.description || ''}
                            price={price}
                            image={product.images?.[0] || ''}
                            category={product.category}
                            className={cn(
                              'cursor-pointer transition-all duration-200',
                              selectedProduct &&
                                (selectedProduct as Product)._id === product._id
                                ? 'ring-2 ring-primary transform scale-[1.02]'
                                : 'hover:scale-[1.01]'
                            )}
                          />
                          {selectedProduct &&
                            (selectedProduct as Product)._id ===
                              product._id && (
                              <div className="absolute top-3 right-3 bg-primary text-white p-1 rounded-full">
                                <CheckCircle className="h-5 w-5" />
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Loading indicator at the bottom when fetching more products */}
                {isFetchingNextPage && (
                  <div className="flex justify-center items-center py-4 mt-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}

                {/* Invisible element to trigger loading more items */}
                <div ref={loadMoreRef} className="h-1" />
              </>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={() => setSelectedProduct(null)}
              className="p-2 rounded-full bg-[#F6F8FA] hover:bg-[#E5E8ED] transition-colors mr-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#212529]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-lg font-medium text-[#212529]">
              Review SB Package
            </h2>
          </div>

          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            <div className="md:w-1/3">
              <div className="h-40 md:h-auto overflow-hidden bg-[#F6F8FA] rounded-lg">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#6c757d]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-2/3">
              <h3 className="text-xl font-bold text-[#212529] mb-2">
                {selectedProduct.name}
              </h3>
              <p className="text-[#6c757d] mb-4">
                {selectedProduct.description}
              </p>

              <div className="bg-[#F6F8FA] p-4 rounded-lg mb-6">
                <p className="text-[#495057] mb-1">Target Amount</p>
                <p className="text-[#0066A1] font-bold text-lg">
                  ₦
                  {selectedProduct.sellingPrice?.toLocaleString() ||
                    selectedProduct.price?.toLocaleString() ||
                    '0'}
                </p>
                <p className="text-xs text-[#6c757d] mt-1">
                  You can save any amount towards this goal
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={createPackageMutation.isPending}
                    className="w-full bg-[#0066A1] text-white py-3 px-4 rounded-lg hover:bg-[#005085] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#0066A1] disabled:opacity-70"
                  >
                    {createPackageMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating Package...
                      </span>
                    ) : (
                      'Create Package'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewSBPackage;
