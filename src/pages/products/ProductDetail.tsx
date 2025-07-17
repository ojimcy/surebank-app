import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/lib/toast-provider';
import packagesApi from '@/lib/api/packages';
import cartApi from '@/lib/api/cart';

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  sellingPrice: number;
  discount: number;
  quantity: number;
  images?: string[];
  packageId?: string;
}

function ProductDetail() {
  const { productId, packageId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        // In a real implementation, you would fetch the product details from an API
        // For now, we'll use the data passed via state or fetch from the package if packageId is provided
        if (packageId) {
          // Fetch the SB package to get the product details
          const response = await packagesApi.getSBPackageById(packageId);
          console.log(response);
          if (response && response.product) {
            setProduct({
              id: response._id,
              name: response.product.name,
              description: 'No description available',
              sellingPrice: 0,
              discount: 0,
              quantity: 1,
              images: response.product.images || [],
              packageId: packageId
            });
          }
        } else if (productId) {
          // In a real app, you would fetch the product by ID
          // For now, we'll just show a placeholder message
          setProduct({
            id: productId,
            name: 'Product Name',
            description: 'Product description would be loaded here.',
            sellingPrice: 45000,
            discount: 10,
            quantity: 1,
            images: ['https://placehold.co/600x400/e2e8f0/1e293b?text=Product+Image']
          });
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        addToast({
          title: 'Error',
          description: 'Failed to load product details. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, packageId, addToast]);

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      setPaymentInitiated(true);

      // Add the product to cart
      await cartApi.addToCart({
        productCatalogueId: product.id,
        quantity: 1,
        ...(product.packageId ? { packageId: product.packageId } : {}),
      });

      addToast({
        title: 'Product added to cart',
        description: 'Redirecting to checkout...',
        variant: 'success',
      });

      // Redirect to checkout page
      navigate('/checkout');
    } catch (error) {
      console.error('Error adding product to cart:', error);
      setPaymentInitiated(false);
      addToast({
        title: 'Error',
        description: 'Failed to add product to cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAddToCart = () => {
    addToast({
      title: 'Added to cart',
      description: 'Product has been added to your cart.',
      variant: 'success',
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48 ml-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Product Not Found</h1>
        </div>
        <p className="text-gray-500">The product you're looking for could not be found.</p>
        <Button className="mt-4" onClick={handleGoBack}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={handleGoBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Product Details</h1>
      </div>

      {/* Product content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product image */}
        <div className="rounded-lg overflow-hidden bg-gray-100">
          <img
            src={product.images && product.images.length > 0
              ? product.images[0]
              : 'https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover aspect-square"
          />
        </div>

        {/* Product details */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>

          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(product.discount)}
            </span>
            {product.discount > 0 && product.discount < product.sellingPrice && (
              <>
                <span className="text-lg text-gray-500 line-through">
                  {formatCurrency(product.sellingPrice)}
                </span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {product.sellingPrice > 0 ?
                    Math.round(((product.sellingPrice - product.discount) / product.sellingPrice) * 100) : 0}% OFF
                </span>
              </>
            )}
          </div>

          <div className="py-4 border-t border-b border-gray-200">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <Check className="h-4 w-4 text-green-500 mr-2" />
            <span>In stock: {product.quantity} available</span>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handleBuyNow}
              disabled={paymentInitiated}
            >
              {paymentInitiated ? 'Processing...' : 'Continue to Checkout'}
            </Button>

            {!product.packageId && (
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
