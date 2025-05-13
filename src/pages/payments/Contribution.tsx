import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import packagesApi, {
  DailySavingsPackage,
  SBPackage,
  InitiateContributionParams,
} from '@/lib/api/packages';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Check, Circle, Loader2, Package, Wallet } from 'lucide-react';

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
}

function Contribution() {
  const [selectedType, setSelectedType] = useState<PackageType>('ds');
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingPackages, setFetchingPackages] = useState(false);

  const { user } = useAuth();

  // Validate contribution amount for DS packages based on amountPerDay
  const validateDSContribution = (
    packageData: PackageOption,
    contributionAmount: number
  ): boolean => {
    if (packageData.type !== 'Daily Savings' || !packageData.amountPerDay) {
      return true; // Not a DS package or no amountPerDay, so no validation needed
    }

    // Check if amount is a multiple of amountPerDay
    return contributionAmount % packageData.amountPerDay === 0;
  };

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
                status: pkg.status
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
    if (!selectedPackage) {
      toast.error('Please select a package to contribute to.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    const selectedPackageData = packages.find(
      (pkg) => pkg.id === selectedPackage
    );
    if (!selectedPackageData) {
      toast.error('Package information not found.');
      return;
    }

    // For DS packages, validate that amount is a multiple of amountPerDay
    const contributionAmount = parseFloat(amount);
    if (
      selectedPackageData.type === 'Daily Savings' &&
      !validateDSContribution(selectedPackageData, contributionAmount)
    ) {
      toast.error(
        `Amount must be a multiple of ₦${selectedPackageData.amountPerDay?.toLocaleString()}`
      );
      return;
    }

    setLoading(true);
    try {
      // Initialize payment through Paystack
      const paymentData: InitiateContributionParams = {
        packageId: selectedPackage,
        amount: contributionAmount,
        packageType: selectedType,
        redirect_url: `${window.location.origin}/payments/success`,
      };

      const response = await packagesApi.initializeContribution(paymentData);

      // Store contribution details in localStorage for retrieval after payment
      localStorage.setItem(
        'contributionData',
        JSON.stringify({
          packageId: selectedPackage,
          packageName: selectedPackageData.name,
          amount: contributionAmount,
          packageType: selectedType,
          paymentReference: response.reference,
        })
      );

      // Redirect to Paystack payment page
      window.location.href = response.authorizationUrl;
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      toast.error('Failed to process your contribution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md bg-white text-2xl font-bold text-right"
            placeholder="0.00"
            disabled={!selectedPackage}
          />
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
                  onClick={() => setAmount(amount.toString())}
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
              onClick={() => setAmount(presetAmount.toString())}
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
        disabled={!selectedPackage || !amount || loading}
        onClick={handleSubmit}
        className="w-full bg-[#0066A1] text-white rounded-md py-4 font-semibold hover:bg-[#007DB8] transition-colors h-auto"
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
