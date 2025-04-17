import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import packagesApi, { CreateSBPackageParams } from '../../lib/api/packages';
import productsApi, { Product } from '../../lib/api/products';
import { toast } from 'react-hot-toast';

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
  const [customTargetAmount, setCustomTargetAmount] = useState<
    number | undefined
  >(undefined);
  const [hasRequiredAccount, setHasRequiredAccount] = useState<boolean | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

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

  const { data: categories = [] } = useQuery({
    queryKey: ['productCategories'],
    queryFn: () => productsApi.getCategories(),
    enabled: hasRequiredAccount === true,
  });

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ['products', selectedCategory, searchQuery],
    queryFn: async () => {
      if (searchQuery) {
        return productsApi.searchProducts(searchQuery);
      }
      if (selectedCategory) {
        return productsApi.getProductsByCategory(selectedCategory);
      }
      return productsApi.getSBProducts();
    },
    enabled: hasRequiredAccount === true,
  });

  const createPackageMutation = useMutation({
    mutationFn: (data: CreateSBPackageParams) =>
      packagesApi.createSBPackage(data),
    onSuccess: () => {
      toast.success('SB package created successfully!');
      navigate('/packages/new/success', {
        state: {
          packageType: 'sb',
          product: selectedProduct?.name,
          amount: customTargetAmount || selectedProduct?.price,
        },
      });
    },
    onError: (error: ApiError) => {
      toast.error(error.response?.data?.message || 'Failed to create package');
    },
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCustomTargetAmount(product.price);
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

    if (customTargetAmount && customTargetAmount !== selectedProduct.price) {
      packageData.targetAmount = customTargetAmount;
    }

    createPackageMutation.mutate(packageData);
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
              Savings-Buying Account Required
            </h2>
            <p className="text-[#6c757d] mb-6">
              You need to have a Savings-Buying account before creating a
              package. Please visit one of our branches to set up your account.
            </p>
            <Link
              to="/packages"
              className="inline-block px-4 py-2 bg-[#0066A1] text-white rounded-lg hover:bg-[#005085] transition-colors"
            >
              Back to Packages
            </Link>
          </div>
        </div>
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
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-[#0066A1] text-white'
                        : 'bg-[#F6F8FA] text-[#495057] hover:bg-[#E5E8ED]'
                    } transition-colors`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-medium text-[#212529] mb-4">
              Select a Product
            </h2>

            {isProductsLoading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : products.length === 0 ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductSelect(product)}
                    className="border border-[#E5E8ED] rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="h-40 overflow-hidden bg-[#F6F8FA]">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
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
                    <div className="p-4">
                      <h3 className="font-medium text-[#212529] mb-1">
                        {product.name}
                      </h3>
                      <p className="text-[#0066A1] font-bold">
                        ₦{product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
              Configure SB Package
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
              <p className="text-[#0066A1] font-bold text-lg mb-6">
                ₦{selectedProduct.price.toLocaleString()}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="targetAmount"
                    className="block text-sm font-medium text-[#495057] mb-1"
                  >
                    Target Amount (₦)
                  </label>
                  <input
                    type="number"
                    id="targetAmount"
                    value={customTargetAmount}
                    onChange={(e) =>
                      setCustomTargetAmount(Number(e.target.value))
                    }
                    min={selectedProduct.price}
                    className="w-full p-3 border border-[#CED4DA] rounded-lg focus:ring-2 focus:ring-[#0066A1] focus:border-[#0066A1] outline-none transition"
                  />
                  <p className="text-xs text-[#6c757d] mt-1">
                    Minimum amount: ₦{selectedProduct.price.toLocaleString()}{' '}
                    (Product price)
                  </p>
                </div>

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
