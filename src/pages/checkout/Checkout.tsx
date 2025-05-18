import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, ShoppingCart, MapPin, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/lib/toast-provider';
import cartApi, { CartResponse } from '@/lib/api/cart';
import ordersApi from '@/lib/api/orders';
import branchesApi, { Branch } from '@/lib/api/branches';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { AnimatePresence, motion } from 'framer-motion';
import { AxiosError } from 'axios';

function Checkout() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [cartData, setCartData] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState('home_delivery');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
  });
  const [pickupStation, setPickupStation] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [validation, setValidation] = useState({
    fullName: true,
    phoneNumber: true,
    address: true,
    city: true,
    pickupStation: true
  });
  const [checkoutStep, setCheckoutStep] = useState(1);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const data = await cartApi.getCart();
        setCartData(data);
      } catch (error) {
        console.error('Error fetching cart:', error);
        addToast({
          title: 'Error',
          description: 'Failed to load cart. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [addToast]);
  
  // Fetch branches for pickup stations
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingBranches(true);
        const branchesData = await branchesApi.getBranches();
        
        // Filter out the 'online' branch
        const filteredBranches = branchesData.filter(branch => 
          branch.name.toLowerCase() !== 'online'
        );
        
        setBranches(filteredBranches || []);
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };

    // Only fetch branches if delivery method is pickup_station
    if (deliveryMethod === 'pickup_station') {
      fetchBranches();
    } else {
      // Reset branches when switching delivery methods
      setBranches([]);
    }
  }, [deliveryMethod]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryAddress(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user types
    setValidation(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    const newValidation = {
      fullName: !!deliveryAddress.fullName,
      phoneNumber: !!deliveryAddress.phoneNumber,
      address: deliveryMethod === 'home_delivery' ? !!deliveryAddress.address : true,
      city: deliveryMethod === 'home_delivery' ? !!deliveryAddress.city : true,
      pickupStation: deliveryMethod === 'pickup_station' ? !!pickupStation : true
    };

    setValidation(newValidation);
    return Object.values(newValidation).every(isValid => isValid);
  };

  const goToNextStep = () => {
    if (checkoutStep === 1) {
      if (validateForm()) {
        setCheckoutStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const goToPreviousStep = () => {
    if (checkoutStep === 2) {
      setCheckoutStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setProcessingOrder(true);
      
      // Construct order data
      const orderData = {
        deliveryAddress: {
          fullName: deliveryAddress.fullName,
          phoneNumber: deliveryAddress.phoneNumber,
          address: deliveryMethod === 'home_delivery' ? deliveryAddress.address : selectedBranch?.address,
          city: deliveryMethod === 'home_delivery' ? deliveryAddress.city : undefined,
          // Set branch ID based on delivery method
          branchId: deliveryMethod === 'pickup_station' && selectedBranch && selectedBranch._id ? 
            selectedBranch._id : '67ea4ca91059af22703a3c49' // Default branch ID if none selected
        },
        paymentMethod: 'sb_balance' 
      };
      
      // Create the order
      const orders = await ordersApi.createOrder(orderData);
      
      if (orders && orders.length > 0) {
        const orderId = orders[0].id;
        
        // Get the package ID from the first product in the order
        let packageId = null;
        if (orders[0].products && orders[0].products.length > 0) {
          packageId = orders[0].products[0]?.packageId;
        } else if (cartData && cartData.cartItems && cartData.cartItems.length > 0) {
          // Fallback: try to get package ID from cart
          packageId = cartData.cartItems[0].packageId;
        }
        
        // Process payment using SB-Pay if we have a package ID
        if (packageId) {
          try {
            await ordersApi.processPayment(orderId, packageId);
          } catch (paymentError) {
            console.error('Payment processing error:', paymentError);
            // Continue with order flow even if payment processing fails
            // The order is created and can be paid later
          }
        } else {
          console.warn('No package ID found for payment processing');
        }

        addToast({
          title: 'Order placed successfully',
          description: 'Your order has been placed and is being processed.',
          variant: 'success',
        });
        
        // Navigate to order details page
        navigate(`/orders/${orderId}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Handle error with proper typing
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error instanceof AxiosError && error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        const message = error.response.data.message;
        errorMessage = typeof message === 'string' ? message : 'Failed to place order. Please try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      addToast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleClearCart = async () => {
    try {
      await cartApi.clearCart();
      addToast({
        title: 'Cart cleared',
        description: 'Your cart has been cleared.',
        variant: 'success',
      });
      navigate('/packages/new/sb');
    } catch (error) {
      console.error('Error clearing cart:', error);
      addToast({
        title: 'Error',
        description: 'Failed to clear cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-48 ml-2" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
    return (
      <div className="container max-w-7xl py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGoBack}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCart}
            className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={processingOrder}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            Clear Cart
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 text-center py-10">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-muted p-6">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">Your cart is empty</h2>
              <p className="text-muted-foreground">Add some products to your cart to proceed with checkout.</p>
              <Button onClick={() => navigate('/packages/new/sb')}>
                Browse Products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Checkout</h1>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCart}
          className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={processingOrder}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          Clear Cart
        </Button>
      </div>

      {/* Checkout progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${checkoutStep >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} transition-colors`}>
              <Truck className="h-5 w-5" />
            </div>
            <span className={`text-sm mt-2 ${checkoutStep >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Delivery</span>
          </div>
          <div className={`h-1 flex-1 mx-2 ${checkoutStep >= 2 ? 'bg-primary' : 'bg-muted'} transition-colors`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${checkoutStep >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} transition-colors`}>
              <CreditCard className="h-5 w-5" />
            </div>
            <span className={`text-sm mt-2 ${checkoutStep >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Payment</span>
          </div>
          <div className={`h-1 flex-1 mx-2 ${checkoutStep >= 3 ? 'bg-primary' : 'bg-muted'} transition-colors`}></div>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${checkoutStep >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'} transition-colors`}>
              <Package className="h-5 w-5" />
            </div>
            <span className={`text-sm mt-2 ${checkoutStep >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>Complete</span>
          </div>
        </div>
      </div>
      
      {/* Checkout content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Delivery and Payment */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {checkoutStep === 1 && (
              <motion.div 
                key="delivery-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Delivery Method */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Delivery Method</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={deliveryMethod} 
                      onValueChange={(value) => {
                        setDeliveryMethod(value);
                      }}
                      className="space-y-3"
                    >
                      <div 
                        className={`relative flex items-center space-x-3 border-2 rounded-md p-5 cursor-pointer transition-all duration-200 ${deliveryMethod === 'home_delivery' 
                          ? 'bg-primary/10 border-primary shadow-md scale-[1.02] z-10' 
                          : 'border-muted hover:border-primary/30 hover:bg-muted/50'}`}
                        onClick={() => setDeliveryMethod('home_delivery')}
                      >
                        {deliveryMethod === 'home_delivery' && (
                          <div className="absolute -right-2 -top-2 bg-primary text-white rounded-full p-1 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        )}
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${deliveryMethod === 'home_delivery' ? 'bg-primary text-white' : 'bg-muted text-primary'}`}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-lg ${deliveryMethod === 'home_delivery' ? 'text-primary' : ''}`}>Home Delivery</div>
                          <div className="text-sm text-muted-foreground">Deliver to your address</div>
                          {deliveryMethod === 'home_delivery' && (
                            <div className="mt-2 text-xs text-primary font-medium">Delivery fee: {formatCurrency(1000)}</div>
                          )}
                        </div>
                      </div>
                      <div 
                        className={`relative flex items-center space-x-3 border-2 rounded-md p-5 cursor-pointer transition-all duration-200 ${deliveryMethod === 'pickup_station' 
                          ? 'bg-primary/10 border-primary shadow-md scale-[1.02] z-10' 
                          : 'border-muted hover:border-primary/30 hover:bg-muted/50'}`}
                        onClick={() => setDeliveryMethod('pickup_station')}
                      >
                        {deliveryMethod === 'pickup_station' && (
                          <div className="absolute -right-2 -top-2 bg-primary text-white rounded-full p-1 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        )}
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${deliveryMethod === 'pickup_station' ? 'bg-primary text-white' : 'bg-muted text-primary'}`}>
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium text-lg ${deliveryMethod === 'pickup_station' ? 'text-primary' : ''}`}>Pickup Station</div>
                          <div className="text-sm text-muted-foreground">Pick up from a designated location</div>
                          {deliveryMethod === 'pickup_station' && (
                            <div className="mt-2 text-xs text-green-600 font-medium">Free pickup (No delivery fee)</div>
                          )}
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Delivery Address or Pickup Station */}
                <AnimatePresence mode="wait">
                  {deliveryMethod === 'home_delivery' ? (
                    <motion.div
                      key="home-delivery"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center">
                            <Truck className="h-5 w-5 mr-2 text-primary" />
                            <CardTitle>Delivery Address</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fullName" className="flex items-center">
                                Full Name <span className="text-destructive ml-1">*</span>
                              </Label>
                              <Input 
                                id="fullName" 
                                name="fullName" 
                                value={deliveryAddress.fullName}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className={!validation.fullName ? 'border-destructive focus:ring-destructive' : ''}
                              />
                              {!validation.fullName && (
                                <p className="text-destructive text-xs flex items-center mt-1">
                                  <AlertCircle className="h-3 w-3 mr-1" /> Full name is required
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phoneNumber" className="flex items-center">
                                Phone Number <span className="text-destructive ml-1">*</span>
                              </Label>
                              <Input 
                                id="phoneNumber" 
                                name="phoneNumber" 
                                value={deliveryAddress.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                className={!validation.phoneNumber ? 'border-destructive focus:ring-destructive' : ''}
                              />
                              {!validation.phoneNumber && (
                                <p className="text-destructive text-xs flex items-center mt-1">
                                  <AlertCircle className="h-3 w-3 mr-1" /> Phone number is required
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="address" className="flex items-center">
                              Address <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Textarea 
                              id="address" 
                              name="address" 
                              value={deliveryAddress.address}
                              onChange={handleInputChange}
                              placeholder="Enter your delivery address"
                              rows={3}
                              className={!validation.address ? 'border-destructive focus:ring-destructive' : ''}
                            />
                            {!validation.address && (
                              <p className="text-destructive text-xs flex items-center mt-1">
                                <AlertCircle className="h-3 w-3 mr-1" /> Address is required
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city" className="flex items-center">
                              City <span className="text-destructive ml-1">*</span>
                            </Label>
                            <Input 
                              id="city" 
                              name="city" 
                              value={deliveryAddress.city}
                              onChange={handleInputChange}
                              placeholder="Enter your city"
                              className={!validation.city ? 'border-destructive focus:ring-destructive' : ''}
                            />
                            {!validation.city && (
                              <p className="text-destructive text-xs flex items-center mt-1">
                                <AlertCircle className="h-3 w-3 mr-1" /> City is required
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="pickup-station"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-primary" />
                            <CardTitle>Pickup Details</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="fullName" className="flex items-center">
                                Full Name <span className="text-destructive ml-1">*</span>
                              </Label>
                              <Input 
                                id="fullName" 
                                name="fullName" 
                                value={deliveryAddress.fullName}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                className={!validation.fullName ? 'border-destructive focus:ring-destructive' : ''}
                              />
                              {!validation.fullName && (
                                <p className="text-destructive text-xs flex items-center mt-1">
                                  <AlertCircle className="h-3 w-3 mr-1" /> Full name is required
                                </p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phoneNumber" className="flex items-center">
                                Phone Number <span className="text-destructive ml-1">*</span>
                              </Label>
                              <Input 
                                id="phoneNumber" 
                                name="phoneNumber" 
                                value={deliveryAddress.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                className={!validation.phoneNumber ? 'border-destructive focus:ring-destructive' : ''}
                              />
                              {!validation.phoneNumber && (
                                <p className="text-destructive text-xs flex items-center mt-1">
                                  <AlertCircle className="h-3 w-3 mr-1" /> Phone number is required
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pickupStation" className="flex items-center">
                              Select Pickup Station <span className="text-destructive ml-1">*</span>
                            </Label>
                            <select
                              id="pickupStation"
                              name="pickupStation"
                              value={pickupStation}
                              onChange={(e) => {
                                const value = e.target.value;
                                setPickupStation(value);
                                
                                // If a branch is selected
                                if (value && value !== '') {
                                  // Find the selected branch
                                  const selectedOption = e.target.options[e.target.selectedIndex];
                                  const index = selectedOption.getAttribute('data-index');
                                  
                                  if (index !== null && branches[Number(index)]) {
                                    // Set the selected branch using the index
                                    const branch = branches[Number(index)];
                                    setSelectedBranch(branch);
                                    setValidation(prev => ({ ...prev, pickupStation: true }));
                                  } else {
                                    // Fallback: try to find by ID
                                    const branch = branches.find(b => b._id === value);
                                    setSelectedBranch(branch || null);
                                    setValidation(prev => ({ ...prev, pickupStation: !!branch }));
                                  }
                                } else {
                                  // No branch selected
                                  setSelectedBranch(null);
                                  setValidation(prev => ({ ...prev, pickupStation: false }));
                                }
                              }}
                              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                !validation.pickupStation ? 'border-destructive focus:ring-destructive' : ''
                              }`}
                              disabled={loadingBranches}
                            >
                              <option key="default" value="">Select a pickup station</option>
                              {loadingBranches ? (
                                <option key="loading" value="" disabled>Loading branches...</option>
                              ) : branches.length > 0 ? (
                                branches.map((branch, index) => (
                                  <option key={branch._id || index} value={branch._id} data-index={index}>
                                    {branch.name} - {branch.address || ''}
                                  </option>
                                ))
                              ) : (
                                <option key="no-branches" value="" disabled>No branches available</option>
                              )}
                            </select>
                            {!validation.pickupStation && (
                              <p className="text-destructive text-xs flex items-center mt-1">
                                <AlertCircle className="h-3 w-3 mr-1" /> Please select a pickup station
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={goToNextStep} 
                    className="px-6"
                    disabled={processingOrder}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </motion.div>
            )}

            {checkoutStep === 2 && (
              <motion.div 
                key="payment-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Payment Method - Only SB Balance available */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-primary" />
                      <CardTitle>Payment Method</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 border rounded-md p-3 bg-muted/50">
                      <div className="h-4 w-4 rounded-full border border-primary bg-primary mr-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">SB Balance</div>
                        <div className="text-sm text-muted-foreground">Pay using your SureBank balance</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Note: Only SB Balance is currently available for payment.</p>
                  </CardContent>
                </Card>

                {/* Order Summary for Mobile (displayed on step 2) */}
                <Card className="lg:hidden">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {cartData.cartItems.map((item) => (
                        <div key={item._id} className="flex justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right">
                            {formatCurrency(item.subTotal)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(cartData.cart.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>{formatCurrency(deliveryMethod === 'home_delivery' ? 1000 : 0)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(cartData.cart.total + (deliveryMethod === 'home_delivery' ? 1000 : 0))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary of delivery information */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center">
                      {deliveryMethod === 'home_delivery' ? (
                        <Truck className="h-5 w-5 mr-2 text-primary" />
                      ) : (
                        <MapPin className="h-5 w-5 mr-2 text-primary" />
                      )}
                      <CardTitle>Delivery Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-1 text-sm">
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Delivery Method:</span>
                        <span>{deliveryMethod === 'home_delivery' ? 'Home Delivery' : 'Pickup Station'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Full Name:</span>
                        <span>{deliveryAddress.fullName}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b">
                        <span className="font-medium">Phone Number:</span>
                        <span>{deliveryAddress.phoneNumber}</span>
                      </div>
                      {deliveryMethod === 'home_delivery' ? (
                        <>
                          <div className="flex justify-between py-1 border-b">
                            <span className="font-medium">Address:</span>
                            <span className="text-right">{deliveryAddress.address}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="font-medium">City:</span>
                            <span>{deliveryAddress.city}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between py-1" data-component-name="Checkout">
                          <span className="font-medium">Pickup Station:</span>
                          <span className="text-right">
                            {selectedBranch ? (
                              <>
                                {selectedBranch.name}<br />
                                {selectedBranch.address}
                              </>
                            ) : (
                              'No pickup station selected'
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-right">
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-primary" 
                        onClick={goToPreviousStep}
                      >
                        Edit delivery information
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={goToPreviousStep}>
                    Back
                  </Button>
                  <Button 
                    onClick={handlePlaceOrder} 
                    className="px-6"
                    disabled={processingOrder}
                  >
                    {processingOrder ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Right column - Order Summary */}
        <div className="hidden lg:block">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {cartData.cartItems.map((item) => (
                  <div key={item._id} className="flex items-center space-x-3 py-2 border-b">
                    {item.product.images && item.product.images.length > 0 ? (
                      <div className="h-16 w-16 rounded-md bg-muted overflow-hidden">
                        <img src={item.product.images[0]} alt={item.name ?? 'product image'} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      {formatCurrency(item.subTotal)}
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Order Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(cartData.cart.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{formatCurrency(deliveryMethod === 'home_delivery' ? 1000 : 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(cartData.cart.total + (deliveryMethod === 'home_delivery' ? 1000 : 0))}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-4">
              {checkoutStep === 2 && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={processingOrder}
                >
                  {processingOrder ? 'Processing...' : 'Place Order'}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleClearCart}
                disabled={processingOrder}
              >
                Cancel Order
              </Button>
              
              <div className="flex items-center justify-center text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 mr-1" />
                <span>Secure checkout</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
