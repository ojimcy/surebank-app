import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrderQueries } from '@/hooks/queries/useOrderQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, ShoppingCart, Clock, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// We need types from the API but don't use the API directly in this component
// import type { OrderResponse } from '@/lib/api/orders';

// Define a normalized order structure to handle API response variations
interface NormalizedOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  products: {
    name: string;
    price: number;
    quantity: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function Orders() {
  const { useUserOrders } = useOrderQueries();
  const { orders, isLoading, isError, refetch } = useUserOrders();
  const [filteredOrders, setFilteredOrders] = useState<NormalizedOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);
  
  // Normalize order data to handle API response variations
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeOrders = (apiOrders: any[]): NormalizedOrder[] => {
    return apiOrders.map(order => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalizedProducts = (order.products || []).map((product: any) => ({
        name: product.productCatalogueId?.name || 'Unnamed product',
        price: product.sellingPrice || 0,
        quantity: product.quantity || 1,
      }));

      return {
        id: order.id || '',
        /**
         * Coerce `id` to string first to safely use `substring`,
         * protecting against numeric IDs from the API.
         */
        orderNumber:
          order.orderNumber ||
          `Order-${String(order.id ?? '').substring(0, 8) || 'Unknown'}`,
        status: order.status || 'pending',
        total: order.totalAmount || 0,
        products: normalizedProducts,
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: order.updatedAt || new Date().toISOString(),
      };
    });
  };

  useEffect(() => {
    if (orders) {
      // Check if orders is an array
      if (!Array.isArray(orders)) {
        console.error('Orders is not an array:', orders);
        setFilteredOrders([]);
        return;
      }
      
      // Normalize the orders data
      const normalizedOrders = normalizeOrders(orders);
      
      let result = [...normalizedOrders];
      
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(order => {
          const orderNumberMatch = order.orderNumber?.toLowerCase().includes(term) || false;
          const productsMatch = order.products?.some(product => 
            product?.name?.toLowerCase().includes(term)
          ) || false;
          return orderNumberMatch || productsMatch;
        });
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        result = result.filter(order => 
          order.status?.toLowerCase() === statusFilter
        );
      }
      
      // Sort by most recent first
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setFilteredOrders(result);
    }
  }, [orders, searchTerm, statusFilter]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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

  // Get product summary text with additional safety checks
  const getProductSummary = (order: NormalizedOrder) => {
    // Check if products array exists and is valid
    if (!order.products || !Array.isArray(order.products) || order.products.length === 0) {
      return 'No products';
    }
    
    // Check if first product has a name
    if (order.products.length === 1) {
      return order.products[0]?.name || 'Unnamed product';
    }
    
    // Check if first product has a name for multiple products
    const firstName = order.products[0]?.name || 'Unnamed product';
    return `${firstName} and ${order.products.length - 1} more item${order.products.length > 2 ? 's' : ''}`;
  };
  return (
    <div className="container max-w-4xl py-8 px-4 md:px-6">
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
        <p className="text-muted-foreground mt-1">
          View and track all your orders
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-medium text-destructive mb-4">Failed to load your orders</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Card key={item} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3 flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Order #{order.orderNumber}</h3>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="space-y-2">
                  <div className="flex justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{getProductSummary(order)}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Placed on {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3 flex justify-between">
                <div className="text-xs text-muted-foreground">
                  {(Array.isArray(order.products) ? order.products.length : 0)} {(Array.isArray(order.products) && order.products.length === 1) ? 'item' : 'items'}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/orders/${order.id}`} className="inline-flex items-center gap-1">
                    View Details
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No orders found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {!orders || orders.length === 0
                ? "You haven't placed any orders yet."
                : "No orders match your current filters."}
            </p>
            {(orders?.length ?? 0) === 0 ? (
               <Button asChild>
                 <Link to="/products">Browse Products</Link>
               </Button>
            ) : (
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
