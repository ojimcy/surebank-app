import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import productsApi, { Product } from '@/lib/api/products';
import packagesApi from '@/lib/api/packages';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

interface ChangeProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: {
    _id: string;
    product?: {
      _id?: string;
      name: string;
      sellingPrice?: number;
    };
  };
  onSuccess: () => void;
}

export function ChangeProductModal({ isOpen, onClose, packageData, onSuccess }: ChangeProductModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productDetails, setProductDetails] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await productsApi.getSBProducts();
        setProducts(response.results);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const handleProductSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedProductId(value);
    const selectedProductDetails = products.find(
      (product) => product._id === value
    );
    
    if (selectedProductDetails) {
      setProductDetails(selectedProductDetails);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }

    try {
      setIsSubmitting(true);
      await packagesApi.changeProduct(packageData._id, {
        newProductId: selectedProductId
      });
      
      toast.success('Product changed successfully!');
      onSuccess();
      onClose();
    } catch (error) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Product</DialogTitle>
        </DialogHeader>
        
        {packageData && packageData.product && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Current Product</h3>
              <div className="font-medium">{packageData.product.name}</div>
              <div className="text-sm text-gray-500">
                Price: {packageData.product.sellingPrice ? formatCurrency(packageData.product.sellingPrice) : 'N/A'}
              </div>
            </div>

            <div>
              <label htmlFor="product" className="block text-sm font-medium mb-1">Select New Product</label>
              <select
                id="product"
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={isLoading}
                onChange={handleProductSelection}
                value={selectedProductId}
              >
                <option value="">Select new product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
              {isLoading && (
                <div className="flex items-center justify-center p-2">
                  <Spinner size="sm" />
                </div>
              )}
            </div>

            {productDetails && (
              <div className="bg-gray-100 p-3 rounded-md text-center">
                <div className="font-medium">{productDetails.name}</div>
                <div className="text-lg font-bold">
                  {productDetails.sellingPrice
                    ? formatCurrency(productDetails.sellingPrice)
                    : 'Price not available'}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedProductId}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm"  />
                    Changing Product...
                  </>
                ) : (
                  'Change Product'
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
