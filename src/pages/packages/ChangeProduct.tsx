import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/ui/Spinner';
import { Product } from '@/lib/api/products';
import api from '@/lib/api/axios';
import packagesApi from '@/lib/api/packages';
import { formatCurrency } from '@/lib/utils';

interface LocationState {
  packageId: string;
  currentProduct?: {
    id?: string;
    name: string;
    sellingPrice?: number;
  };
}

function ChangeProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const packageData = location.state as LocationState;

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch available products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('products/catalogue');
      // Extract products from the results array in the response
      const productsData = response.data?.results || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle product selection
  const handleProductSelection = (value: string) => {
    setSelectedProductId(value);
    const selectedProductDetails = products.find(
      (product) => product._id === value
    );
    console.log(selectedProductDetails, 'selectedProductDetails');
    console.log(value, 'value');
    console.log(products, 'products');

    if (selectedProductDetails) {
      setProductDetails(selectedProductDetails);
    } else {
      setProductDetails(null);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }

    if (!packageData?.packageId) {
      toast.error('Package information is missing');
      return;
    }

    // Check if selected product is different from current product
    if (packageData.currentProduct?.id === selectedProductId) {
      toast.error('Please select a different product');
      return;
    }

    try {
      setIsSubmitting(true);

      console.log('Submitting product change:', {
        packageId: packageData.packageId,
        newProductId: selectedProductId,
        selectedProduct: productDetails
      });

      const response = await packagesApi.changeProduct(packageData.packageId, {
        newProductId: selectedProductId
      });

      console.log('Product change response:', response);

      toast.success('Product changed successfully!');
      navigate(`/packages/${packageData.packageId}`);
    } catch (error) {
      console.error('Error changing product:', error);

      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        // Backend error with a specific error message
        const errorMessage = error.response.data.message as string;
        toast.error(errorMessage);
      } else {
        // Network error or other error
        toast.error('Something went wrong. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no package data was passed, redirect back
  useEffect(() => {
    if (!packageData?.packageId) {
      toast.error('No package selected');
      navigate('/packages');
    }
  }, [packageData, navigate]);

  console.log(selectedProductId, 'selectedProductId');
  console.log(products, 'products');
  return (
    <div className="container max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Change Product</CardTitle>
          <CardDescription>
            Select a new product for your SureBank package
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {packageData?.currentProduct && (
            <div className="space-y-2 bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium">Current Product</h3>
              <div className="font-medium">{packageData.currentProduct.name}</div>
              <div className="text-sm text-gray-500">
                Price: {packageData.currentProduct.sellingPrice
                  ? formatCurrency(packageData.currentProduct.sellingPrice)
                  : 'N/A'}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="product">Select New Product</Label>
            <Select
              disabled={isLoading}
              value={selectedProductId}
              onValueChange={handleProductSelection}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="Select new product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name} - {formatCurrency(product.sellingPrice || 0)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoading && (
              <div className="flex items-center justify-center p-2">
                <Spinner size="sm" />
              </div>
            )}
          </div>

          {productDetails && (
            <div className="bg-gray-100 p-3 rounded-md text-center border border-gray-200">
              <div className="font-medium">{productDetails.name}</div>
              <div className="text-lg font-bold">
                {productDetails.sellingPrice
                  ? formatCurrency(productDetails.sellingPrice)
                  : 'Price not available'}
              </div>
              {productDetails.description && (
                <div className="text-sm text-gray-600 mt-2">
                  {productDetails.description}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            className="w-full"
            disabled={isSubmitting || !selectedProductId}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                Changing Product...
              </>
            ) : (
              'Change Product'
            )}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ChangeProduct;
