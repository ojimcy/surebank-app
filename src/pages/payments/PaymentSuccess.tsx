import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home, ExternalLink, Smartphone } from 'lucide-react';
import { useToast } from '@/lib/toast-provider';
import { useLoader } from '@/lib/loader-provider';
import packagesApi, { IBPackage } from '@/lib/api/packages';
import { formatDateTime } from '@/lib/utils';
import { isMobile } from '@/lib/utils/platform';
import storage from '@/lib/api/storage';
import { Button } from '@/components/ui/button';

const CONTRIBUTION_DATA_KEY = 'contributionData';
const IBS_PACKAGE_DATA_KEY = 'ibsPackageData';

// Enhanced payment data interface for hybrid approach
interface PaymentData {
  type: string;
  packageId?: string;
  packageName?: string;
  amount?: number;
  reference?: string;
  platform?: string;
  packageDetails?: IBPackage;
  [key: string]: string | number | boolean | Date | IBPackage | undefined;
}

interface PaymentSuccessProps {
  // Optional props for customization
  onMobileRedirect?: (deepLink: string) => void;
  onWebSuccess?: (paymentData: PaymentData) => void;
}

// Declare gtag type for analytics
declare global {
  function gtag(command: string, action: string, parameters: Record<string, string | number | boolean>): void;
}

/**
 * PaymentSuccess Component - Web Bridge Solution
 * 
 * This component implements the Web Bridge architecture for handling
 * mobile payment redirects from Paystack:
 * 
 * Flow:
 * 1. Mobile App → Backend API (with mobile headers)
 * 2. Backend API → Generates web URL with platform=mobile
 * 3. Paystack → Redirects to this React component
 * 4. React Component → Detects platform=mobile and auto-redirects to mobile app
 * 
 * Routes:
 * - Mobile: ?platform=mobile → Auto-redirect to surebank://payment/callback
 * - Web: (no platform) → Show success page
 * 
 * CRITICAL: This route MUST be public (no authentication required)
 */
const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onMobileRedirect, onWebSuccess }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { showLoader, hideLoader } = useLoader();
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Extract payment data from URL parameters
  const urlPaymentData: PaymentData = {
    type: searchParams.get('type') || 'payment',
    packageId: searchParams.get('packageId') || undefined,
    reference: searchParams.get('reference') || undefined,
    platform: searchParams.get('platform') || undefined,
  };

  useEffect(() => {
    const initializePaymentSuccess = async () => {
      try {
        showLoader();

        // Web Bridge Solution: Detect mobile primarily from platform parameter
        const isMobileRequest = urlPaymentData.platform === 'mobile';

        // Fallback detection for edge cases
        const isMobileFallback = 
          isMobile() ||
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Use platform parameter as primary detection (Web Bridge)
        const finalIsMobile = isMobileRequest || isMobileFallback;
        setIsMobileDevice(finalIsMobile);

        console.log('Payment success page loaded (Web Bridge):', {
          ...urlPaymentData,
          isMobileFromPlatform: isMobileRequest,
          isMobileFallback: isMobileFallback,
          finalIsMobile: finalIsMobile,
          userAgent: navigator.userAgent,
        });

        // Fetch payment data from storage or API
        const fetchedData = await fetchPaymentData();
        
        if (finalIsMobile) {
          // Handle mobile redirect (Web Bridge auto-redirect)
          handleMobileRedirect(fetchedData);
        } else {
          // Handle web success
          handleWebSuccess(fetchedData);
        }
      } catch (error) {
        console.error('Failed to initialize payment success:', error);
        toast.error({ title: 'Failed to load payment details' });
      } finally {
        setLoading(false);
        hideLoader();
      }
    };

    initializePaymentSuccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer for mobile redirect
  useEffect(() => {
    if (isMobileDevice && redirecting && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMobileDevice, redirecting, countdown]);

  const fetchPaymentData = async (): Promise<PaymentData> => {
    const reference = urlPaymentData.reference;
    
    // Determine payment type from reference prefix if available
    let paymentType: string = urlPaymentData.type || 'other';
    if (reference) {
      if (reference.startsWith('ds_')) paymentType = 'daily_savings';
      else if (reference.startsWith('sb_')) paymentType = 'savings_buying';
      else if (reference.startsWith('ibs_')) paymentType = 'interest_package';
    }

    // Check storage for data first (for direct redirects from payment gateways)
    const contributionData = await storage.getItem(CONTRIBUTION_DATA_KEY);
    const ibsPackageData = await storage.getItem(IBS_PACKAGE_DATA_KEY);

    let finalPaymentData: PaymentData = { 
      ...urlPaymentData, 
      type: paymentType 
    };

    if (contributionData) {
      // Handle contribution payment
      const parsedData = JSON.parse(contributionData);
      finalPaymentData = {
        ...urlPaymentData,
        ...parsedData,
        type: 'contribution',
      };
      await storage.removeItem(CONTRIBUTION_DATA_KEY);
    } else if (ibsPackageData) {
      // Handle IBS package data
      const parsedData = JSON.parse(ibsPackageData);
      finalPaymentData = {
        ...urlPaymentData,
        ...parsedData,
        type: 'interest_package',
      };
      await storage.removeItem(IBS_PACKAGE_DATA_KEY);
    } else if (reference && paymentType === 'interest_package') {
      // Fetch IBS package by reference if no local data
      try {
        const packageDetails = await packagesApi.getIBPackageByReference(reference);
        finalPaymentData = {
          ...urlPaymentData,
          type: 'interest_package',
          reference,
          packageDetails,
        };
      } catch (error) {
        console.error('Failed to fetch IBS package:', error);
      }
    }

    setPaymentData(finalPaymentData);
    return finalPaymentData;
  };

  const handleMobileRedirect = (data: PaymentData) => {
    setRedirecting(true);

    // Web Bridge Solution: Generate deep link URL for mobile app
    const baseScheme = 'surebank';
    const deepLinkParams = new URLSearchParams({
      type: data.type,
      status: 'success',
      ...(data.packageId && { packageId: data.packageId }),
      ...(data.reference && { reference: data.reference }),
    });

    const deepLinkUrl = `${baseScheme}://payment/callback?${deepLinkParams.toString()}`;

    console.log('Web Bridge: Generated deep link for mobile app:', {
      deepLinkUrl,
      paymentData: data,
      platform: urlPaymentData.platform,
    });

    // Call custom handler if provided
    if (onMobileRedirect) {
      onMobileRedirect(deepLinkUrl);
    }

    // Web Bridge: Automatic redirect after showing success message (5 seconds)
    setTimeout(() => {
      console.log('Web Bridge: Attempting to redirect to mobile app...');
      window.location.href = deepLinkUrl;

      // Hide loading after redirect attempt
      setTimeout(() => {
        setRedirecting(false);
      }, 3000);
    }, 5000);
  };

  const handleWebSuccess = (data: PaymentData) => {
    // Call custom handler if provided
    if (onWebSuccess) {
      onWebSuccess(data);
    }

    // Optional: Track analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'payment_success', {
        platform: 'web',
        payment_type: data.type,
      });
    }
  };

  const handleManualAppOpen = () => {
    if (!paymentData) return;
    
    const baseScheme = 'surebank';
    const deepLinkParams = new URLSearchParams({
      type: paymentData.type,
      status: 'success',
      ...(paymentData.packageId && { packageId: paymentData.packageId }),
      ...(paymentData.reference && { reference: paymentData.reference }),
    });

    const deepLinkUrl = `${baseScheme}://payment/callback?${deepLinkParams.toString()}`;
    window.location.href = deepLinkUrl;
  };

  const handleViewPackage = () => {
    if (isMobileDevice) {
      // For mobile, redirect to the app instead of web navigation
      if (!paymentData) return;
      
      const baseScheme = 'surebank';
      const deepLinkParams = new URLSearchParams({
        action: 'navigate',
        route: paymentData.type === 'contribution' && paymentData.packageId 
          ? `/packages/${paymentData.packageId}` 
          : '/packages',
      });

      const deepLinkUrl = `${baseScheme}://navigate?${deepLinkParams.toString()}`;
      window.location.href = deepLinkUrl;
      return;
    }

    // Web navigation (original logic)
    if (paymentData?.type === 'contribution' && paymentData.packageId) {
      navigate(`/packages/${paymentData.packageId}`);
      return;
    }
    
    // Default case: navigate to packages list
    navigate('/packages');
  };

  const handleBackToHome = () => {
    if (isMobileDevice) {
      // For mobile, redirect to the app instead of web navigation
      const baseScheme = 'surebank';
      const deepLinkParams = new URLSearchParams({
        action: 'navigate',
        route: '/dashboard',
      });

      const deepLinkUrl = `${baseScheme}://navigate?${deepLinkParams.toString()}`;
      window.location.href = deepLinkUrl;
      return;
    }

    // Web navigation (original logic)
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-xl p-8 max-w-md w-full text-center shadow-lg border">
          <div className="w-16 h-16 flex items-center justify-center mb-6 mx-auto">
            <div className="h-10 w-10 border-4 border-t-primary border-muted rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">Processing Your Payment</h1>
          <p className="text-muted-foreground mb-6">Please wait while we confirm your transaction...</p>
        </div>
      </div>
    );
  }

  // Mobile UI with enhanced design
  if (isMobileDevice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card rounded-xl p-8 max-w-md w-full text-center shadow-lg border">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-4 text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Your {paymentData?.type === 'interest_package' ? 'investment package' : 'payment'} has been processed successfully.
          </p>

          {paymentData?.reference && (
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Reference</p>
              <p className="font-mono text-sm text-foreground">{paymentData.reference}</p>
            </div>
          )}

          {redirecting ? (
            <div className="bg-primary/10 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <Smartphone className="h-8 w-8 text-primary mr-3" />
                <div className="text-primary font-semibold">Opening SureBank App</div>
              </div>
              
              <div className="relative mb-4">
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                You will be redirected to the SureBank mobile app automatically
              </p>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm mb-3 text-foreground">App didn't open automatically?</p>
              <Button
                onClick={handleManualAppOpen}
                className="w-full"
                size="lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open SureBank App
              </Button>
            </div>
          )}

          {/* Mobile-specific navigation buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              onClick={handleViewPackage}
              variant="outline"
              className="flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {paymentData?.type === 'interest_package' ? 'View Packages' : 'View Package'}
            </Button>

            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="flex items-center justify-center"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Web UI - Enhanced with proper design system
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card rounded-xl p-8 max-w-md w-full text-center shadow-lg border">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold mb-4 text-foreground">
          {paymentData?.type === 'interest_package'
            ? 'Package Created Successfully!'
            : paymentData?.type === 'contribution'
            ? 'Contribution Successful!'
            : 'Payment Successful!'}
        </h1>

        <p className="text-muted-foreground mb-6">
          {paymentData?.type === 'interest_package'
            ? 'Your investment package has been created successfully.'
            : paymentData?.type === 'contribution'
            ? 'Your contribution has been processed successfully.'
            : 'Your transaction has been processed successfully.'} 
          Thank you for using SureBank!
        </p>

        {/* Payment Details */}
        <div className="bg-muted/50 rounded-xl p-6 w-full mb-6 text-left">
          <div className="space-y-4">
            {/* IBS Package Details */}
            {paymentData?.type === 'interest_package' && paymentData.packageDetails && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package Name</span>
                  <span className="font-medium text-foreground">
                    {paymentData.packageDetails.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Principal Amount</span>
                  <span className="font-medium text-foreground">
                    ₦{paymentData.packageDetails.principalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium text-foreground">
                    {paymentData.packageDetails.interestRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lock Period</span>
                  <span className="font-medium text-foreground">
                    {paymentData.packageDetails.lockPeriod} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maturity Date</span>
                  <span className="font-medium text-foreground">
                    {formatDateTime(paymentData.packageDetails.maturityDate)}
                  </span>
                </div>
              </>
            )}

            {/* Common Details */}
            {paymentData?.reference && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-medium text-foreground font-mono text-sm">
                  {paymentData.reference.length > 12
                    ? `${paymentData.reference.substring(0, 12)}...`
                    : paymentData.reference}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">
                {new Date().toLocaleDateString('en-NG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {paymentData?.type && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Type</span>
                <span className="font-medium text-foreground">
                  {paymentData.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            onClick={handleViewPackage}
            className="flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {paymentData?.type === 'interest_package' ? 'View Packages' : 'View Package'}
          </Button>

          <Button
            onClick={handleBackToHome}
            variant="outline"
            className="flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
