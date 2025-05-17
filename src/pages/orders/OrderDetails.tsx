import { useParams, Link } from 'react-router-dom';
import { useOrderQueries } from '@/hooks/queries/useOrderQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Phone, User, Clock, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';

// Define a normalized order structure to handle API response variations
interface NormalizedProduct {
  name: string;
  price: number;
  quantity: number;
  productId?: string;
}

interface NormalizedDeliveryAddress {
  fullName: string;
  phoneNumber: string;
  address?: string;
  city?: string;
  state?: string;
  branchId?: string;
}

interface NormalizedOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  products: NormalizedProduct[];
  deliveryAddress: NormalizedDeliveryAddress;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { useOrderDetails } = useOrderQueries();
  const { order: rawOrder, isLoading, isError, refetch } = useOrderDetails(orderId || '');
  const [order, setOrder] = useState<NormalizedOrder | null>(null);

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);
  
  // Normalize order data when it's loaded
  useEffect(() => {
    if (rawOrder) {
      try {
        // Normalize products
        const normalizedProducts: NormalizedProduct[] = [];
        
        // Safely access nested properties
        const getNestedValue = <T,>(obj: unknown, path: string, defaultValue: T): T => {
          if (!obj || typeof obj !== 'object') return defaultValue;
          
          const keys = path.split('.');
          let current: unknown = obj;
          
          for (const key of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
              return defaultValue;
            }
            current = (current as Record<string, unknown>)[key];
          }
          
          return (current as unknown as T) ?? defaultValue; // nullish coalescing
        };
        
        // Handle products array
        const products = getNestedValue<unknown[]>(rawOrder, 'products', []);
        if (Array.isArray(products) && products.length > 0) {
          products.forEach(product => {
            if (product && typeof product === 'object') {
              const catalogueName = getNestedValue<string>(product, 'productCatalogueId.name', '');
              const productName = getNestedValue<string>(product, 'name', '');
              const sellingPrice = getNestedValue<number>(product, 'sellingPrice', 0);
              const price = getNestedValue<number>(product, 'price', 0);
              const quantity = getNestedValue<number>(product, 'quantity', 1);
              const productId = getNestedValue<string>(product, 'productId', '') || 
                                getNestedValue<string>(product, 'id', '');
              
              normalizedProducts.push({
                name: catalogueName || productName || 'Unnamed product',
                price: sellingPrice || price || 0,
                quantity: quantity || 1,
                productId
              });
            }
          });
        } else if (getNestedValue<string>(rawOrder, 'productId', '') && getNestedValue<string>(rawOrder, 'name', '')) {
          // Handle single product order
          normalizedProducts.push({
            name: getNestedValue<string>(rawOrder, 'name', 'Unnamed product'),
            price: getNestedValue<number>(rawOrder, 'price', 0),
            quantity: getNestedValue<number>(rawOrder, 'quantity', 1),
            productId: getNestedValue<string>(rawOrder, 'productId', '')
          });
        }
        
        // If still no products, add a placeholder
        if (normalizedProducts.length === 0) {
          normalizedProducts.push({
            name: 'Unknown product',
            price: 0,
            quantity: 1
          });
        }
        
        // Normalize delivery address
        const deliveryAddress: NormalizedDeliveryAddress = {
          fullName: getNestedValue<string>(rawOrder, 'deliveryAddress.fullName', 'Not provided'),
          phoneNumber: getNestedValue<string>(rawOrder, 'deliveryAddress.phoneNumber', 'Not provided'),
          address: getNestedValue<string>(rawOrder, 'deliveryAddress.address', ''),
          city: getNestedValue<string>(rawOrder, 'deliveryAddress.city', ''),
          state: getNestedValue<string>(rawOrder, 'deliveryAddress.state', ''),
          branchId: getNestedValue<string>(rawOrder, 'deliveryAddress.branchId', '')
        };
        
        // Calculate total if needed
        const apiTotal = getNestedValue<number>(rawOrder, 'total', 0) || 
                         getNestedValue<number>(rawOrder, 'totalAmount', 0);
        const calculatedTotal = normalizedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        
        // Create normalized order
        const normalizedOrder: NormalizedOrder = {
          id: getNestedValue<string>(rawOrder, 'id', ''),
          orderNumber: getNestedValue<string>(rawOrder, 'orderNumber', '') || 
                      `Order-${getNestedValue<string>(rawOrder, 'id', '').substring(0, 8) || 'Unknown'}`,
          status: getNestedValue<string>(rawOrder, 'status', 'pending'),
          total: apiTotal || calculatedTotal,
          products: normalizedProducts,
          deliveryAddress,
          paymentMethod: getNestedValue<string>(rawOrder, 'paymentMethod', 'Not specified'),
          createdAt: getNestedValue<string>(rawOrder, 'createdAt', new Date().toISOString()),
          updatedAt: getNestedValue<string>(rawOrder, 'updatedAt', '') || 
                    getNestedValue<string>(rawOrder, 'createdAt', new Date().toISOString())
        };
        
        setOrder(normalizedOrder);
      } catch (error) {
        console.error('Error normalizing order data:', error);
      }
    }
  }, [rawOrder]);
  
  // Separate effect for title update to prevent infinite loops
  useEffect(() => {
    // Only update the title when we have stable data
    if (order || isLoading) {
      document.title = isLoading ? 'Loading Order...' : `Order #${order?.orderNumber || 'Details'} | SureBank`;
    }
  }, [isLoading, order?.orderNumber, order]);

  // Format date for display
  const formatDate = (dateString: string) => {
return new Date(dateString).toLocaleString('en-NG', {
   day: 'numeric',
   month: 'long',
   year: 'numeric',
   hour: '2-digit',
   minute: '2-digit',
 });
  };

  // Get status badge color based on order status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'processing':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <>

      <div className="container max-w-4xl py-8 px-4 md:px-6">
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            {isLoading ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              `Order #${order?.orderNumber}`
            )}
          </h1>
          <div className="text-muted-foreground mt-1">
            {isLoading ? (
              <Skeleton className="h-5 w-48" />
            ) : (
              order?.createdAt && `Placed on ${formatDate(order.createdAt)}`
            )}
          </div>
        </div>

        {isError && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-lg font-medium text-destructive mb-4">Failed to load order details</p>
                <Button onClick={() => refetch()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((item) => (
                    <div key={item} className="flex justify-between">
                      <div className="flex gap-4">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-end gap-4 sm:flex-row sm:justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-24" />
              </CardFooter>
            </Card>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Status</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Last updated: {formatDate(order.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  Products included in your order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order?.products && order.products.map((product, index) => (
                    <div key={index} className="flex items-start justify-between py-2">
                      <div className="flex gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {product.quantity} × {formatCurrency(product.price)}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(product.price * product.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <Separator />
              <CardFooter className="flex flex-col items-end gap-4 sm:flex-row sm:justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Payment Method: <span className="font-medium">{order.paymentMethod === 'sb_balance' ? 'SureBank Balance' : order.paymentMethod}</span>
                </div>
                <div className="text-lg font-bold">
                  Total: {formatCurrency(order.total)}
                </div>
              </CardFooter>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{order.deliveryAddress.fullName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p>{order.deliveryAddress.phoneNumber}</p>
                    </div>
                  </div>
                  
                  {order.deliveryAddress.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{order.deliveryAddress.address}</p>
                        {order.deliveryAddress.city && (
                          <p className="text-sm text-muted-foreground">
                            {order.deliveryAddress.city}
                            {order.deliveryAddress.state && `, ${order.deliveryAddress.state}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Payment Method</p>
                      <p className="text-sm text-muted-foreground">
                        {order.paymentMethod === 'sb_balance' ? 'SureBank Balance' : order.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/support">
                    Need Help? Contact Support
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : null}
      </div>
    </>
  );
}
