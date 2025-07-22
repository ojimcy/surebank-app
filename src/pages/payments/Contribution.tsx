import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import packagesApi, {
  DailySavingsPackage,
  SBPackage,
  InitializeContributionParams,
  PaymentStatus,
} from '@/lib/api/packages';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Check, Circle, Loader2, Package, Wallet } from 'lucide-react';
import storage from '@/lib/api/storage';
import { getRedirectUrl, isMobile, getPlatformInfo } from '@/lib/utils/platform';
import { paymentPolling } from '@/lib/services/payment-polling';
import { logger } from '@/lib/utils/logger';
import { paymentLogger } from '@/lib/utils/payment-logger';
import api from '@/lib/api/axios';

// Create a logger instance for the contribution component
const contributionLogger = logger.create('Contribution');

// Define package type options
type PackageType = 'ds' | 'sb';

interface PackageOption {
  id: string;
  name: string;
  type: string;
  balance: number;
  target?: number;
  amountPerDay?: number;
  status?: string;
  totalCount?: number; // For tracking contribution days
}

const CONTRIBUTION_DATA_KEY = 'contributionData';

function Contribution() {
  const [selectedType, setSelectedType] = useState<PackageType>('ds');
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingPackages, setFetchingPackages] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { user } = useAuth();

  // Enhanced validation for DS packages
  const validateDSContribution = (
    packageData: PackageOption,
    contributionAmount: number
  ): { isValid: boolean; error?: string } => {
    if (packageData.type !== 'Daily Savings' || !packageData.amountPerDay) {
      return { isValid: true }; // Not a DS package or no amountPerDay, so no validation needed
    }

    // Check if amount is a multiple of amountPerDay
    if (contributionAmount % packageData.amountPerDay !== 0) {
      return {
        isValid: false,
        error: `Amount must be a multiple of ₦${packageData.amountPerDay.toLocaleString()} (daily amount for this package)`
      };
    }

    // Calculate contribution days
    const contributionDays = Math.round(contributionAmount / packageData.amountPerDay);
    
    // Check minimum contribution (at least 1 day)
    if (contributionDays <= 0) {
      return {
        isValid: false,
        error: 'Contribution amount is too small for this package'
      };
    }

    // Check contribution circle limit (31 days max cycle)
    const CONTRIBUTION_CIRCLE = 31;
    const currentTotalCount = packageData.totalCount || 0;
    const newTotalCount = currentTotalCount + contributionDays;
    
    if (newTotalCount > CONTRIBUTION_CIRCLE) {
      const remainingDays = CONTRIBUTION_CIRCLE - currentTotalCount;
      const maxAllowedAmount = remainingDays * packageData.amountPerDay;
      return {
        isValid: false,
        error: `Contribution exceeds 31-day cycle limit. Maximum allowed: ₦${maxAllowedAmount.toLocaleString()} (${remainingDays} days)`
      };
    }

    return { isValid: true };
  };

  // Real-time validation when amount changes
  const handleAmountChange = (value: string) => {
    setAmount(value);
    setValidationError(null);

    if (!selectedPackage || !value) return;

    const selectedPackageData = packages.find(pkg => pkg.id === selectedPackage);
    if (!selectedPackageData) return;

    const contributionAmount = parseFloat(value);
    if (isNaN(contributionAmount) || contributionAmount <= 0) return;

    // Validate DS contribution
    if (selectedPackageData.type === 'Daily Savings') {
      const validation = validateDSContribution(selectedPackageData, contributionAmount);
      if (!validation.isValid) {
        setValidationError(validation.error || null);
      }
    }
  };

  // Clear validation error when package selection changes
  useEffect(() => {
    setValidationError(null);
    if (amount && selectedPackage) {
      const selectedPackageData = packages.find(pkg => pkg.id === selectedPackage);
      if (selectedPackageData?.type === 'Daily Savings') {
        const contributionAmount = parseFloat(amount);
        if (!isNaN(contributionAmount) && contributionAmount > 0) {
          const validation = validateDSContribution(selectedPackageData, contributionAmount);
          if (!validation.isValid) {
            setValidationError(validation.error || null);
          }
        }
      }
    }
  }, [selectedPackage, packages, amount]);

  // Fetch packages based on selected type
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserPackages = async () => {
      setFetchingPackages(true);
      setSelectedPackage(null);
      try {
        let dsPackages, sbPackages;
        let activeDS, activeSB;

        switch (selectedType) {
          case 'ds':
            dsPackages = await packagesApi.getDailySavings(user.id);
            // Filter out closed packages
            activeDS = dsPackages.filter(pkg => pkg.status !== 'closed');
            setPackages(
              activeDS.map((pkg: DailySavingsPackage) => ({
                id: pkg.id,
                name: pkg.target || 'Daily Savings',
                type: 'Daily Savings',
                balance: pkg.totalContribution,
                target: pkg.targetAmount,
                amountPerDay: pkg.amountPerDay,
                status: pkg.status,
                totalCount: pkg.totalCount || 0
              }))
            );
            break;
          case 'sb':
            sbPackages = await packagesApi.getSBPackages(user.id);
            // Filter out closed packages
            activeSB = sbPackages.filter(pkg => pkg.status !== 'closed');
            setPackages(
              activeSB.map((pkg: SBPackage) => ({
                id: pkg._id,
                name: pkg.product?.name || 'SureBank Package',
                type: 'SB Package',
                balance: pkg.totalContribution,
                target: pkg.targetAmount,
                status: pkg.status
              }))
            );
            break;
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast.error('Failed to fetch packages. Please try again.');
      } finally {
        setFetchingPackages(false);
      }
    };

    fetchUserPackages();
  }, [selectedType, user?.id]);

  const handleSubmit = async () => {
    if (!selectedPackage || !amount || parseFloat(amount) <= 0) {
      toast.error('Please select a package and enter a valid amount.');
      return;
    }

    const selectedPackageData = packages.find(pkg => pkg.id === selectedPackage);
    if (!selectedPackageData) {
      toast.error('Package information not found.');
      return;
    }

    const contributionAmount = parseFloat(amount);

    // Enhanced validation for DS contribution
    if (selectedPackageData.type === 'Daily Savings') {
      const validation = validateDSContribution(selectedPackageData, contributionAmount);
      if (!validation.isValid) {
        toast.error(validation.error || 'Invalid contribution amount');
        return;
      }
    }

    setLoading(true);
    try {
      // Log platform info for debugging
      const platformInfo = getPlatformInfo();
      contributionLogger.info('Platform info:', platformInfo);

      // Add headers for platform detection
      if (isMobile()) {
        // Make sure the API knows this is a mobile request
        api.defaults.headers['x-app-platform'] = 'mobile';
        api.defaults.headers['x-mobile-app'] = 'true';
        contributionLogger.info('Setting mobile headers for API request');
      }

      // Initialize payment through Paystack
      const paymentData: InitializeContributionParams = {
        packageId: selectedPackage,
        amount: contributionAmount,
        contributionType: selectedType === 'ds' ? 'daily_savings' : 'savings_buying',
      };

      // Add redirect URL for both web and mobile
      const successPath = `/payments/success?success=true&type=${selectedType === 'ds' ? 'daily_savings' : 'savings_buying'}&packageId=${selectedPackage}`;
      const redirectUrl = getRedirectUrl(successPath);
      if (redirectUrl) {
        paymentData.redirect_url = redirectUrl;
        contributionLogger.info('Using redirect URL:', redirectUrl);
      } else {
        contributionLogger.warn('No redirect URL available');
      }

      // Use the dedicated payment logger
      paymentLogger.logInitialize({
        packageId: selectedPackage,
        packageName: selectedPackageData.name,
        amount: contributionAmount,
        contributionType: paymentData.contributionType,
        redirectUrl: paymentData.redirect_url
      });

      contributionLogger.info('Initializing contribution with data:', paymentData);

      const response = await packagesApi.initializeContribution(paymentData);
      paymentLogger.logApiResponse('/payments/init-contribution', response);

      const paymentReference = response.reference;
      contributionLogger.info('Payment reference:', paymentReference);

      // Get the authorization URL (supporting both snake_case and camelCase)
      const authorizationUrl = response.authorization_url || response.authorizationUrl;

      if (!authorizationUrl) {
        paymentLogger.logError('Missing authorization URL', response);
        throw new Error('No authorization URL received from payment initialization');
      }

      paymentLogger.logStatus(paymentReference, 'initialized', {
        authorizationUrl
      });

      try {
        // Store contribution details
        await storage.setItem(
          CONTRIBUTION_DATA_KEY,
          JSON.stringify({
            packageId: selectedPackage,
            packageName: selectedPackageData.name,
            amount: contributionAmount,
            contributionType: paymentData.contributionType,
            paymentReference,
            authorizationUrl,
          })
        );
        contributionLogger.info('Contribution data stored successfully');
      } catch (storageError) {
        contributionLogger.warn('Failed to store contribution data:', storageError);
        // Continue even if storage fails
      }

      if (isMobile()) {
        contributionLogger.info('Mobile device detected, starting payment polling');
        // For mobile: start polling and redirect to payment page
        paymentPolling.startPolling({
          reference: paymentReference,
          onSuccess: (status: PaymentStatus) => {
            paymentLogger.logComplete(status.reference, true, {
              status: status.status,
              amount: status.amount,
              packageId: status.packageId,
              packageType: status.packageType,
              createdAt: status.createdAt,
              updatedAt: status.updatedAt
            });
            toast.success('Payment successful!');
            window.location.href = `/payments/success?reference=${status.reference}&success=true`;
          },
          onError: (status: PaymentStatus) => {
            paymentLogger.logComplete(status.reference, false, {
              status: status.status,
              amount: status.amount,
              packageId: status.packageId,
              packageType: status.packageType,
              createdAt: status.createdAt,
              updatedAt: status.updatedAt
            });
            toast.error('Payment failed. Please try again.');
            window.location.href = `/payments/error?reference=${status.reference}&success=false`;
          },
          onTimeout: () => {
            paymentLogger.logError('Payment polling timeout', { reference: paymentReference });
            toast.error('Payment verification timed out. Please contact support if money was deducted.');
            window.location.href = `/payments/error?reference=${paymentReference}&message=timeout`;
          }
        });
      }

      // Redirect to Paystack payment page
      paymentLogger.logRedirect(authorizationUrl, {
        reference: paymentReference,
        isMobile: isMobile()
      });

      // Use setTimeout to ensure logs are processed before redirect
      setTimeout(() => {
        // Use window.location.assign which is better for redirects than href
        contributionLogger.info('Executing redirect now...');
        window.location.assign(authorizationUrl);
      }, 1000);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      paymentLogger.logError('Failed to initialize payment', error);
      
      // Handle specific API errors with user-friendly messages
      let errorMessage = 'Failed to process your contribution. Please try again.';
      
      if (apiError?.response?.data?.message) {
        // Use the specific error message from the backend
        errorMessage = apiError.response.data.message;
      } else if (apiError?.response?.status === 400) {
        // Handle common 400 errors
        errorMessage = 'Invalid contribution details. Please check your input and try again.';
      } else if (apiError?.response?.status === 403) {
        errorMessage = 'You do not have permission to contribute to this package.';
      } else if (apiError?.response?.status === 404) {
        errorMessage = 'Package not found. Please refresh and try again.';
      } else if (apiError?.message) {
        errorMessage = apiError.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (paymentPolling.isCurrentlyPolling()) {
        paymentPolling.stopPolling();
      }
    };
  }, []);

  const getTypeIcon = (type: PackageType) => {
    switch (type) {
      case 'ds':
        return <Wallet className="h-5 w-5" />;
      case 'sb':
        return <Package className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Make Contribution</h1>

      {/* Package Type Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Package Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedType('ds')}
            className={cn(
              'flex flex-col items-center justify-center py-4 px-2 rounded-lg border transition-all',
              selectedType === 'ds'
                ? 'border-[#0066A1] bg-blue-50 text-[#0066A1]'
                : 'border-gray-300 hover:bg-gray-50'
            )}
          >
            <Wallet className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Daily Savings</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('sb')}
            className={cn(
              'flex flex-col items-center justify-center py-4 px-2 rounded-lg border transition-all',
              selectedType === 'sb'
                ? 'border-[#7952B3] bg-purple-50 text-[#7952B3]'
                : 'border-gray-300 hover:bg-gray-50'
            )}
          >
            <Package className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">SB Package</span>
          </button>
        </div>
      </div>

      {/* Package Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label
          htmlFor="package"
          className="block text-sm font-medium text-gray-700 mb-3"
        >
          Select Package
        </label>

        {fetchingPackages ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : packages.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackage(pkg.id)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg border transition-all',
                  selectedPackage === pkg.id
                    ? 'border-[#0066A1] bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                )}
              >
                <div className="flex items-center">
                  <div className="mr-3">{getTypeIcon(selectedType)}</div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{pkg.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(pkg.balance)}{' '}
                      {pkg.type === 'Daily Savings' && pkg.amountPerDay && (
                        <span className="text-xs text-gray-500">
                          - {pkg.amountPerDay} per day
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {selectedPackage === pkg.id ? (
                  <Check className="h-5 w-5 text-[#0066A1]" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg py-10 px-4 text-center">
            <p className="text-gray-500">
              No{' '}
              {selectedType === 'ds'
                ? 'Daily Savings'
                : selectedType === 'sb'
                  ? 'SureBank'
                  : 'Interest-Based Savings'}{' '}
              packages found
            </p>
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 mb-3"
        >
          Enter Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-lg">₦</span>
          </div>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={cn(
              "block w-full pl-10 pr-12 py-3 border rounded-md bg-white text-2xl font-bold text-right",
              validationError
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            )}
            placeholder="0.00"
            disabled={!selectedPackage}
          />
          {validationError && (
            <div className="mt-2 text-sm text-red-600">
              {validationError}
            </div>
          )}
        </div>
        {selectedPackage && (
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>
              Current Balance:{' '}
              {formatCurrency(
                packages.find((p) => p.id === selectedPackage)?.balance || 0
              )}
            </span>
            {packages.find((p) => p.id === selectedPackage)?.target && (
              <span>
                Target:{' '}
                {formatCurrency(
                  packages.find((p) => p.id === selectedPackage)?.target || 0
                )}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Preset Amounts */}
      <div className="grid grid-cols-3 gap-3">
        {(() => {
          // If no package is selected, use default preset amounts
          if (!selectedPackage) {
            return [1000, 5000, 10000].map((presetAmount) => (
              <button
                key={presetAmount}
                type="button"
                disabled={true}
                className="bg-white py-3 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed font-medium"
              >
                ₦{presetAmount.toLocaleString()}
              </button>
            ));
          }

          // Get the selected package
          const selectedPkg = packages.find((p) => p.id === selectedPackage);

          // For Daily Savings packages, use multiples of amountPerDay
          if (
            selectedPkg?.type === 'Daily Savings' &&
            selectedPkg.amountPerDay
          ) {
            // Calculate multiples (1x, 2x, 5x) of the daily amount
            const multipliers = [1, 2, 5];
            return multipliers.map((multiplier) => {
              const amount = Math.round(selectedPkg.amountPerDay! * multiplier);
              return (
                <button
                  key={multiplier}
                  type="button"
                  onClick={() => handleAmountChange(amount.toString())}
                  className="bg-white py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <span>₦{amount.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">
                      {multiplier} days
                    </span>
                  </div>
                </button>
              );
            });
          }

          // For other package types, use default preset amounts
          return [1000, 5000, 10000].map((presetAmount) => (
            <button
              key={presetAmount}
              type="button"
              onClick={() => handleAmountChange(presetAmount.toString())}
              className="bg-white py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium transition-colors"
            >
              ₦{presetAmount.toLocaleString()}
            </button>
          ));
        })()}
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <input
              id="card"
              name="payment-method"
              type="radio"
              className="h-4 w-4 text-[#0066A1] focus:ring-[#0066A1]"
              defaultChecked
            />
            <label htmlFor="card" className="flex items-center">
              <span className="ml-2 block font-medium text-gray-900">
                Paystack
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </label>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <Button
        type="button"
        disabled={!selectedPackage || !amount || loading || !!validationError}
        onClick={handleSubmit}
        className="w-full bg-[#0066A1] text-white rounded-md py-4 font-semibold hover:bg-[#007DB8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          'Proceed to Payment'
        )}
      </Button>
    </div>
  );
}

export default Contribution;
