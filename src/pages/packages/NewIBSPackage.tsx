import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { useToast } from '@/lib/toast-provider';
import { useLoader } from '@/lib/loader-provider';
import packagesApi, {
  InterestRateOption,
} from '@/lib/api/packages';
import { StyledButton } from '@/components/ui/styled-button';
import { getUserAccountByType, createAccount } from '@/lib/api/accounts';
import { useQuery } from '@tanstack/react-query';
import storage from '@/lib/api/storage';
import { getPaymentSuccessUrl } from '@/lib/utils/payment-redirect';
import { paymentLogger } from '@/lib/utils/payment-logger';
import { logger } from '@/lib/utils/logger';
import { getPlatformInfo } from '@/lib/utils/platform';
import NestedHeader from '@/components/layout/NestedHeader';

// Create a logger instance for the IBS package component
const ibsLogger = logger.create('IBSPackage');

// Lock period options in days (1 month, 3 months, 6 months, 1 year, 2 years)
const lockPeriodOptions = [
  { label: '1 Month', value: 30 },
  { label: '3 Months', value: 90 },
  { label: '6 Months', value: 180 },
  { label: '1 Year', value: 365 },
  { label: '2 Years', value: 730 },
];

const IBS_PACKAGE_DATA_KEY = 'ibsPackageData';

function NewIBSPackage() {
  const toast = useToast();
  const loader = useLoader();
  const { user } = useAuth();
  const [interestRates, setInterestRates] = useState<InterestRateOption[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    principalAmount: 0,
    interestRate: 0,
    lockPeriod: 0,
  });

  // Form errors
  const [formErrors, setFormErrors] = useState({
    name: '',
    principalAmount: '',
    interestRate: '',
    lockPeriod: '',
  });

  // Check if user has IBS account
  const { data: ibsAccount, isLoading } = useQuery({
    queryKey: ['ibsAccount', user?.id],
    queryFn: async () => {
      try {
        return await getUserAccountByType('ibs');
      } catch (error) {
        console.error('Error fetching account:', error);
        toast.error({ title: 'Error checking IBS account' });
        throw error;
      }
    },
  });

  // Load interest rate options from server
  useEffect(() => {
    const fetchInterestRates = async () => {
      try {
        const rates = await packagesApi.getInterestRateOptions();
        setInterestRates(rates);
      } catch (error) {
        console.error('Error fetching interest rates:', error);
        toast.error({ title: 'Failed to load interest rate options' });
      }
    };

    fetchInterestRates();
  }, [toast]);

  // Handle input change
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'principalAmount' || name === 'lockPeriod') {
      const newValue = Number(value);

      // If lock period changed, update the interest rate automatically based on server config
      if (name === 'lockPeriod' && newValue > 0) {
        // Find the appropriate interest rate based on lock period from server data
        const matchingRate = interestRates.find(rate => 
          newValue >= rate.minLockPeriod && newValue <= rate.maxLockPeriod
        );

        if (matchingRate) {
          setFormData({
            ...formData,
            [name]: newValue,
            interestRate: matchingRate.rate,
          });
        } else {
          // Just update lock period if no matching rate found
          setFormData({
            ...formData,
            [name]: newValue,
          });
        }
      } else {
        setFormData({
          ...formData,
          [name]: newValue,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };


  // Get current interest rate information
  const getCurrentInterestRate = () => {
    if (!formData.lockPeriod || !formData.interestRate) return null;

    // Return a simplified rate object based on current form data
    return {
      rate: formData.interestRate,
      lockPeriod: formData.lockPeriod,
    };
  };

  const currentRate = getCurrentInterestRate();

  // Validate form
  const validateForm = () => {
    const errors = {
      name: '',
      principalAmount: '',
      interestRate: '',
      lockPeriod: '',
    };

    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Package name is required';
      isValid = false;
    }

    if (formData.principalAmount < 1000) {
      errors.principalAmount = 'Principal amount must be at least ₦1,000';
      isValid = false;
    }

    if (formData.lockPeriod < 30) {
      errors.lockPeriod = 'Lock period must be at least 30 days';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      loader.showLoader('Initiating payment...');

      // Log platform info for debugging
      const platformInfo = getPlatformInfo();
      ibsLogger.info('Platform info:', platformInfo);

      const paymentData = {
        contributionType: 'interest_package' as const,
        amount: formData.principalAmount,
        name: formData.name,
        principalAmount: formData.principalAmount,
        interestRate: formData.interestRate,
        lockPeriod: formData.lockPeriod,
        redirect_url: getPaymentSuccessUrl(),
      };

      // Log payment initialization
      paymentLogger.logInitialize({
        name: formData.name,
        principalAmount: formData.principalAmount,
        lockPeriod: formData.lockPeriod,
        redirectUrl: getPaymentSuccessUrl()
      });

      // Initiate payment using the universal init-contribution endpoint
      const response = await packagesApi.initializeContribution(paymentData);
      console.log('Payment initiation response:', response);
      paymentLogger.logApiResponse('/payments/init-contribution', response);

      // Store package details using cross-platform storage
      await storage.setItem(
        IBS_PACKAGE_DATA_KEY,
        JSON.stringify({
          ...formData, // Store complete form data including interestRate
          paymentReference: response.reference,
        })
      );
      ibsLogger.info('IBS package data stored successfully');

      // Get the correct authorization URL (supporting both snake_case and camelCase formats)
      const paymentUrl = response.authorization_url || response.authorizationUrl;

      if (!paymentUrl) {
        paymentLogger.logError('No payment URL received', response);
        throw new Error('Payment initiation failed: No payment URL received');
      }

      // Log the redirect
      paymentLogger.logStatus(response.reference, 'initialized', {
        authorizationUrl: paymentUrl
      });

      paymentLogger.logRedirect(paymentUrl, {
        reference: response.reference
      });

      console.log('Redirecting to payment page:', paymentUrl);

      // Redirect to payment gateway - using a small timeout to ensure logs are processed
      setTimeout(() => {
        ibsLogger.info('Executing redirect now...');
        window.location.assign(paymentUrl);
      }, 300);
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      paymentLogger.logError('Failed to initiate IBS payment', error);
      toast.error({ title: 'Failed to initiate payment' });
    } finally {
      loader.hideLoader();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        Loading account information...
      </div>
    );
  }

  // If user doesn't have an IBS account, show creation option
  if (!ibsAccount) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-2">Create IBS Account</h2>
        <p className="text-gray-500 mb-4">
          You need an Interest-Based Savings account to create packages
        </p>
        <StyledButton
          text="Create IBS Account"
          variant="primary"
          onClick={async () => {
            try {
              loader.showLoader('Creating account...');
              await createAccount('ibs');
              toast.success({ title: 'IBS account created successfully' });
              window.location.reload();
            } catch (error) {
              console.error('Failed to create account:', error);
              toast.error({ title: 'Failed to create account' });
            } finally {
              loader.hideLoader();
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <NestedHeader title="Create Interest-Based Savings Package" />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Package Details</h2>
          <p className="text-sm text-gray-500">
            Set up your investment package parameters
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Package Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Retirement Fund"
              className={`w-full p-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs">{formErrors.name}</p>
            )}
            <p className="text-xs text-gray-500">
              Give your investment package a meaningful name
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="principalAmount"
              className="block text-sm font-medium"
            >
              Principal Amount (₦)
            </label>
            <input
              id="principalAmount"
              name="principalAmount"
              type="number"
              value={formData.principalAmount}
              onChange={handleChange}
              placeholder="10000"
              className={`w-full p-2 border rounded-md ${formErrors.principalAmount
                ? 'border-red-500'
                : 'border-gray-300'
                }`}
            />
            {formErrors.principalAmount && (
              <p className="text-red-500 text-xs">
                {formErrors.principalAmount}
              </p>
            )}
            <p className="text-xs text-gray-500">
              The initial amount you want to invest
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="lockPeriod" className="block text-sm font-medium">
              Lock Period (days)
            </label>
            <select
              id="lockPeriod"
              name="lockPeriod"
              value={formData.lockPeriod}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${formErrors.lockPeriod ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">Select lock period</option>
              {lockPeriodOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formErrors.lockPeriod && (
              <p className="text-red-500 text-xs">{formErrors.lockPeriod}</p>
            )}
            <p className="text-xs text-gray-500">
              Number of days your funds will be locked
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Interest Rate</label>
            <div className="p-2 bg-gray-50 rounded-md border border-gray-300">
              {currentRate ? (
                <div className="flex flex-col">
                  <span className="font-medium text-lg">
                    {currentRate.rate}%
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">
                  Select a lock period to see the applicable interest rate
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Interest rate is determined by your chosen lock period
            </p>
          </div>

          <StyledButton
            text="Proceed to Payment"
            variant="secondary"
            type="submit"
          />
        </form>
      </div>
    </div>
  );
}

export default NewIBSPackage;
