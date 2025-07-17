import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import packagesApi, {
  DailySavingsPackage,
  IBWithdrawalParams,
} from "@/lib/api/packages";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Check, Loader2, Wallet, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

interface PackageOption {
  id: string;
  name: string;
  type: string;
  balance: number;
  target?: number;
  amountPerDay?: number;
  accountNumber: string;
  totalCount?: number;
}

function Withdrawal() {
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingPackages, setFetchingPackages] = useState(false);
  const [selectedPackageData, setSelectedPackageData] =
    useState<PackageOption | null>(null);
  const [showCloseWarning, setShowCloseWarning] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState<string>("");
  const [withdrawnPackageName, setWithdrawnPackageName] = useState<string>("");

  const { user } = useAuth();

  // Validate withdrawal amount based on available balance
  const validateWithdrawal = (
    packageData: PackageOption,
    withdrawalAmount: number
  ): boolean => {
    // Check if withdrawal amount is less than or equal to available balance
    return withdrawalAmount <= packageData.balance;
  };

  // Fetch Daily Savings packages
  const fetchUserPackages = async () => {
    if (!user?.id) return;

    setFetchingPackages(true);
    try {
      const dsPackages = await packagesApi.getDailySavings(user.id);
      setPackages(
        dsPackages
          .filter((pkg: DailySavingsPackage) => pkg.totalContribution > 0)
          .map((pkg: DailySavingsPackage) => ({
            id: pkg.id,
            name: pkg.target || "Daily Savings",
            type: "Daily Savings",
            balance: pkg.totalContribution,
            target: typeof pkg.target === 'string' ? (isNaN(parseFloat(pkg.target)) ? 0 : parseFloat(pkg.target)) : (pkg.target || 0),
            amountPerDay: pkg.amountPerDay,
            accountNumber: pkg.accountNumber,
          }))
      );
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to fetch packages. Please try again.");
    } finally {
      setFetchingPackages(false);
    }
  };

  // Fetch packages when user changes
  useEffect(() => {
    if (!user?.id) return;
    setSelectedPackage(null);
    setSelectedPackageData(null);
    setWithdrawalSuccess(false);
    fetchUserPackages();
  }, [user?.id]);

  // Update selected package data when a package is selected
  useEffect(() => {
    if (selectedPackage) {
      const packageData = packages.find((pkg) => pkg.id === selectedPackage);
      setSelectedPackageData(packageData || null);
    } else {
      setSelectedPackageData(null);
    }
  }, [selectedPackage, packages]);

  const checkEarlyWithdrawal = (): boolean => {
    if (!selectedPackageData) return false;

    // For DS packages, we'll consider early withdrawal based on other criteria
    // Since totalCount doesn't exist, we'll use a different approach
    return false; // Simplified for now
  };

  const resetForm = () => {
    setAmount("");
    setSelectedPackage(null);
    setShowCloseWarning(false);
  };

  const startNewWithdrawal = () => {
    setWithdrawalSuccess(false);
    setWithdrawnAmount("");
    setWithdrawnPackageName("");
  };

  const showSuccessScreen = (amount: string, packageName: string) => {
    // First set all the withdrawal success data
    setWithdrawnAmount(amount);
    setWithdrawnPackageName(packageName);

    // Then set withdrawal success to true to trigger the UI change
    setTimeout(() => {
      setWithdrawalSuccess(true);
    }, 100);
  };

  const processWithdrawal = async () => {
    if (!selectedPackage) return;
    if (!amount || parseFloat(amount) <= 0) return;
    if (!selectedPackageData) return;

    setLoading(true);
    try {
      // Save withdrawal details before processing
      const withdrawalAmount = parseFloat(amount);
      const packageName = selectedPackageData.name;

      // Create withdrawal data
      const withdrawalData: IBWithdrawalParams = {
        packageId: selectedPackage,
        amount: withdrawalAmount,
      };

      // Use the API function with the package type "ds"
      await packagesApi.withdrawFromPackage(withdrawalData, "ds");

      // Show persistent success toast
      toast.success(
        "Withdrawal successful! Amount has been added to your available balance.",
        {
          duration: 5000, // Show for 5 seconds
          position: "top-center",
          icon: "🎉",
        }
      );

      // Reload packages to reflect the update
      await fetchUserPackages();

      // Reset form and show success screen
      resetForm();

      // Show success screen with the withdrawal amount and package name
      showSuccessScreen(withdrawalAmount.toLocaleString(), packageName);

    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to process withdrawal. Please try again.", {
        duration: 4000,
        position: "top-center",
      });
      setWithdrawalSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPackage) {
      toast.error("Please select a package to withdraw from.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!selectedPackageData) {
      toast.error("Package information not found.");
      return;
    }

    // Validate withdrawal amount
    const withdrawalAmount = parseFloat(amount);
    if (!validateWithdrawal(selectedPackageData, withdrawalAmount)) {
      toast.error(
        `Withdrawal amount cannot exceed available balance of ₦${selectedPackageData.balance.toLocaleString()}`
      );
      return;
    }

    // Check for early withdrawal warning
    if (checkEarlyWithdrawal()) {
      setShowCloseWarning(true);
    } else {
      // Proceed with withdrawal immediately if no warning needed
      await processWithdrawal();
    }
  };

  // If withdrawal was successful, show success message
  if (withdrawalSuccess) {
    return (
      <div className="max-w-md mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Successful!</h1>
          <div className="py-1 px-3 bg-green-100 text-green-800 rounded-full inline-block mb-6">
            Amount added to your balance
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Withdrawal Details</p>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">₦{withdrawnAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">From</span>
              <span className="font-medium">{withdrawnPackageName}</span>
            </div>
          </div>

          <Button
            onClick={startNewWithdrawal}
            className="w-full bg-[#0066A1] text-white rounded-md py-4 font-semibold hover:bg-[#007DB8] transition-colors h-auto"
          >
            Make Another Withdrawal
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
      <p className="text-gray-600">
        Withdraw funds from your Daily Savings package to your available balance.
      </p>

      {/* Package Selection */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium text-gray-900 mb-3">Select Package</h3>
        {fetchingPackages ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066A1]" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No packages found. Create a Daily Savings package first.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackage(pkg.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border",
                  selectedPackage === pkg.id
                    ? "bg-[#0066A1] text-white border-[#0066A1]"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                )}
              >
                <div className="flex items-center">
                  <Wallet className="h-5 w-5" />
                  <div className="ml-3 text-left">
                    <p
                      className={cn(
                        "font-medium",
                        selectedPackage === pkg.id
                          ? "text-white"
                          : "text-gray-900"
                      )}
                    >
                      {pkg.name}
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        selectedPackage === pkg.id
                          ? "text-white/80"
                          : "text-gray-500"
                      )}
                    >
                      Balance: ₦{pkg.balance.toLocaleString()}
                    </p>
                    {/* Account number is hidden from UI but kept in the data */}
                  </div>
                </div>
                {selectedPackage === pkg.id && (
                  <Check className="h-5 w-5 text-white" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium text-gray-900 mb-3">Enter Amount</h3>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">₦</span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            className="focus:ring-[#0066A1] focus:border-[#0066A1] block w-full pl-7 pr-12 py-3 sm:text-sm border-gray-300 rounded-md"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!selectedPackage}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">NGN</span>
          </div>
        </div>

        {/* Max Amount Button */}
        <div className="mt-3">
          {(() => {
            if (!selectedPackage) {
              return (
                <button
                  type="button"
                  disabled={true}
                  className="w-50 bg-white py-3 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed font-medium"
                >
                  Max
                </button>
              );
            }

            // Get the selected package
            const selectedPkg = packages.find((p) => p.id === selectedPackage);

            if (!selectedPkg) return null;

            return (
              <button
                type="button"
                onClick={() => setAmount(selectedPkg.balance.toString())}
                className="w-full bg-white py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium transition-colors"
              >
                Max (₦{selectedPkg.balance.toLocaleString()})
              </button>
            );
          })()}
        </div>
      </div>

      {/* Package and Withdrawal Summary */}
      {selectedPackageData && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-medium text-gray-900 mb-3">Withdrawal Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Package</span>
              <span className="font-medium">{selectedPackageData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Available Balance</span>
              <span className="font-medium">
                ₦{selectedPackageData.balance.toLocaleString()}
              </span>
            </div>
            {amount && (
              <div className="flex justify-between">
                <span className="text-gray-500">Withdrawal Amount</span>
                <span className="font-medium">
                  ₦{parseFloat(amount).toLocaleString()}
                </span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between">
                <span className="text-gray-500">Remaining Balance</span>
                <span className="font-medium">
                  ₦
                  {Math.max(
                    0,
                    selectedPackageData.balance - parseFloat(amount || "0")
                  ).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ds Early Withdrawal Warning */}
      {showCloseWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">Package Closure Warning</h4>
              <p className="text-amber-700 text-sm mt-1">
                This package has less than 31 contributions. Withdrawing now will close the package.
                Are you sure you want to continue?
              </p>
              <div className="flex gap-3 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCloseWarning(false)}
                  className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={processWithdrawal}
                  className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
                >
                  Proceed Anyway
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proceed Button */}
      <Button
        type="button"
        disabled={
          !selectedPackage || !amount || loading || parseFloat(amount) <= 0 || showCloseWarning
        }
        onClick={handleSubmit}
        className="w-full bg-[#0066A1] text-white rounded-md py-4 font-semibold hover:bg-[#007DB8] transition-colors h-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          "Withdraw Funds"
        )}
      </Button>
    </div>
  );
}

export default Withdrawal;
