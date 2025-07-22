import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import packagesApi, { IBPackage, IBWithdrawalParams } from "@/lib/api/packages";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Check,
  Loader2,
  Wallet,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { usePinVerification } from "@/hooks/usePinVerification";

interface PackageOption {
  id: string;
  name: string;
  principalAmount: number;
  interestRate: number;
  lockPeriod: number;
  interestAccrued: number;
  currentBalance: number;
  maturityDate: string;
  status: string;
  accountNumber: string;
}

function IBWithdrawal() {
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingPackages, setFetchingPackages] = useState(false);
  const [selectedPackageData, setSelectedPackageData] =
    useState<PackageOption | null>(null);
  const [showEarlyWithdrawalWarning, setShowEarlyWithdrawalWarning] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState<string>("");
  const [withdrawnPackageName, setWithdrawnPackageName] = useState<string>("");
  const [isMatured, setIsMatured] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);

  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedPackageId = searchParams.get('packageId');
  const { verifyPin, PinVerificationModal } = usePinVerification();

  // Validate withdrawal amount based on available balance
  const validateWithdrawal = (
    packageData: PackageOption,
    withdrawalAmount: number
  ): boolean => {
    return withdrawalAmount <= packageData.currentBalance;
  };

  // Check if package is matured
  const checkMaturity = (maturityDate: string): boolean => {
    try {
      const today = Date.now(); // Use timestamp for comparison
      let maturityTimestamp: number;

      // Check if it's a number or numeric string (Unix timestamp)
      if (!isNaN(Number(maturityDate))) {
        // Convert to number (already in milliseconds)
        maturityTimestamp = Number(maturityDate);
      } else {
        // Try as regular date string and convert to timestamp
        maturityTimestamp = new Date(maturityDate).getTime();
      }

      // Check if the timestamp is valid
      if (isNaN(maturityTimestamp)) {
        console.error("Invalid maturity date:", maturityDate);
        return false;
      }


      return today >= maturityTimestamp;
    } catch (error) {
      console.error("Error checking maturity:", error);
      return false;
    }
  };

  // Calculate penalty for early withdrawal
  const calculatePenalty = (packageData: PackageOption): number => {
    // 50% penalty on accrued interest for early withdrawal
    return packageData.interestAccrued * 0.5;
  };

  // Format maturity date with better handling for Unix timestamps
  const formatMaturityDate = (dateStr: string): string => {
    try {
      // Try to parse as number first (Unix timestamp)
      if (!isNaN(Number(dateStr))) {
        const timestamp = Number(dateStr);
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        }
      }

      // Fall back to trying as date string
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-NG', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }

      return "Invalid date";
    } catch (error) {
      console.error("Error formatting maturity date:", error);
      return "Invalid date";
    }
  };

  // Fetch Interest Based Savings packages
  const fetchUserPackages = async () => {
    if (!user?.id) return;

    setFetchingPackages(true);
    try {
      const ibPackages = await packagesApi.getIBPackages();
      setPackages(
        ibPackages
          .filter((pkg: IBPackage) => {
            // Filter out packages that cannot be withdrawn from
            const isActive = pkg.status &&
              pkg.status.toLowerCase() !== "closed" &&
              pkg.status.toLowerCase() !== "terminated" &&
              pkg.status.toLowerCase() !== "inactive";

            const hasBalance = pkg.currentBalance && pkg.currentBalance > 0;

            return isActive && hasBalance;
          })
          .map((pkg: IBPackage) => {
            try {
              // Ensure maturityDate is a string
              const maturityDateStr = String(pkg.maturityDate || "");

              return {
                id: pkg._id || "",
                name: pkg.name || "Unnamed Package",
                principalAmount: pkg.principalAmount || 0,
                interestRate: pkg.interestRate || 0,
                lockPeriod: pkg.lockPeriod || 0,
                interestAccrued: pkg.interestAccrued || 0,
                currentBalance: pkg.currentBalance || 0,
                maturityDate: maturityDateStr,
                status: pkg.status || "unknown",
                accountNumber: pkg.accountNumber || "",
              };
            } catch (error) {
              console.error("Error processing package data:", error, pkg);
              // Return a default object with minimal data to avoid crashes
              return {
                id: pkg._id || "unknown",
                name: "Error: Invalid Package Data",
                principalAmount: 0,
                interestRate: 0,
                lockPeriod: 0,
                interestAccrued: 0,
                currentBalance: 0,
                maturityDate: "",
                status: "unknown",
                accountNumber: "",
              };
            }
          })
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

  // Pre-select package if packageId is provided in URL
  useEffect(() => {
    if (preselectedPackageId && packages.length > 0 && !selectedPackage) {
      const packageExists = packages.find(pkg => pkg.id === preselectedPackageId);
      if (packageExists) {
        setSelectedPackage(preselectedPackageId);
      }
    }
  }, [preselectedPackageId, packages, selectedPackage]);

  // Update selected package data when a package is selected
  useEffect(() => {
    if (selectedPackage) {
      const packageData = packages.find((pkg) => pkg.id === selectedPackage);
      setSelectedPackageData(packageData || null);

      if (packageData) {
        // Check if package is matured
        const matured = checkMaturity(packageData.maturityDate);
        setIsMatured(matured);

        // Calculate penalty if it's early withdrawal
        if (!matured) {
          const penalty = calculatePenalty(packageData);
          setPenaltyAmount(penalty);
        } else {
          setPenaltyAmount(0);
        }
      }
    } else {
      setSelectedPackageData(null);
      setIsMatured(false);
      setPenaltyAmount(0);
    }
  }, [selectedPackage, packages]);

  const resetForm = () => {
    setAmount("");
    setSelectedPackage(null);
    setShowEarlyWithdrawalWarning(false);
  };

  const startNewWithdrawal = () => {
    setWithdrawalSuccess(false);
    setWithdrawnAmount("");
    setWithdrawnPackageName("");
  };
  const withdrawableAmount = parseFloat(amount) - penaltyAmount;


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

    // Save withdrawal details before processing
    const withdrawalAmount = parseFloat(amount);
    const packageName = selectedPackageData.name;

    // Verify PIN before processing withdrawal
    const pinVerified = await verifyPin({
      title: 'Confirm IB Package Withdrawal',
      description: `Enter your PIN to withdraw ₦${withdrawalAmount.toLocaleString()} from ${packageName}${!isMatured ? ` (Early withdrawal penalty: ₦${penaltyAmount.toLocaleString()})` : ''}`
    });

    if (!pinVerified) {
      return;
    }

    setLoading(true);
    try {

      // Create withdrawal data
      const withdrawalData: IBWithdrawalParams = {
        packageId: selectedPackage,
        amount: withdrawalAmount,
      };

      // Use the API function for IB package withdrawal
      await packagesApi.requestIBWithdrawal(withdrawalData);

      // Show persistent success toast
      toast.success(
        "Funds successfully moved to your available balance! You can now withdraw to your bank account from the main balance.",
        {
          duration: 6000, // Show for 6 seconds (longer message)
          position: "top-center",
          icon: "💰",
        }
      );

      // Reload packages to reflect the update
      await fetchUserPackages();

      // Reset form and show success screen
      resetForm();

      // Show success screen with the withdrawal amount and package name
      showSuccessScreen(withdrawableAmount.toLocaleString(), packageName);

    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to process withdrawal request. Please try again.", {
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
      toast.error("Please select a package to transfer from.");
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

    // Validate transfer amount
    const transferAmount = parseFloat(amount);
    if (!validateWithdrawal(selectedPackageData, transferAmount)) {
      toast.error(
        `Transfer amount cannot exceed available balance of ₦${selectedPackageData.currentBalance.toLocaleString()}`
      );
      return;
    }

    // Check for early withdrawal warning
    if (!isMatured) {
      setShowEarlyWithdrawalWarning(true);
    } else {
      // Proceed with transfer immediately if no warning needed
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Funds Transferred Successfully!</h1>
          <div className="py-1 px-3 bg-green-100 text-green-800 rounded-full inline-block mb-6">
            Available in your balance
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Transfer Details</p>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount Transferred</span>
              <span className="font-medium">₦{withdrawnAmount}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">From Package</span>
              <span className="font-medium">{withdrawnPackageName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">To</span>
              <span className="font-medium">Available Balance</span>
            </div>
            {!isMatured && (
              <div className="flex justify-between mt-2 text-amber-600">
                <span>Early Withdrawal Penalty</span>
                <span className="font-medium">₦{penaltyAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-green-600">Completed</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-700">
              💡 <strong>Next step:</strong> To withdraw to your bank account, go to your main balance and select "Withdraw to Bank".
            </p>
          </div>

          <Button
            onClick={startNewWithdrawal}
            className="w-full bg-[#0066A1] text-white rounded-md py-4 font-semibold hover:bg-[#007DB8] transition-colors h-auto"
          >
            Make Another Transfer
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Transfer from Interest Savings</h1>
      <p className="text-gray-600">
        Transfer funds from your interest-based savings package to your available balance. From there, you can withdraw to your bank account.
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
            <div className="mb-4">
              <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            </div>
            <p className="font-medium mb-2">No Active Packages Available</p>
            <p className="text-sm">
              You don't have any active interest savings packages with available balance to transfer from.
            </p>
            <p className="text-sm mt-1">
              Create a new Interest Savings package to get started.
            </p>
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
                    <div className="flex flex-col">
                      <p
                        className={cn(
                          "text-sm",
                          selectedPackage === pkg.id
                            ? "text-white/80"
                            : "text-gray-500"
                        )}
                      >
                        Balance: ₦{pkg.currentBalance.toLocaleString()}
                      </p>
                      <p
                        className={cn(
                          "text-sm",
                          selectedPackage === pkg.id
                            ? "text-white/80"
                            : "text-gray-500"
                        )}
                      >
                        Matures: {formatMaturityDate(pkg.maturityDate)}
                      </p>
                    </div>
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
                onClick={() => setAmount(selectedPkg.currentBalance.toString())}
                className="w-full bg-white py-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium transition-colors"
              >
                Max (₦{selectedPkg.currentBalance.toLocaleString()})
              </button>
            );
          })()}
        </div>
      </div>

      {/* Package and Withdrawal Summary */}
      {selectedPackageData && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-medium text-gray-900 mb-3">Transfer Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Package</span>
              <span className="font-medium">{selectedPackageData.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Principal Amount</span>
              <span className="font-medium">
                ₦{selectedPackageData.principalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Accrued Interest</span>
              <span className="font-medium">
                ₦{selectedPackageData.interestAccrued.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Balance</span>
              <span className="font-medium">
                ₦{selectedPackageData.currentBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Maturity Date</span>
              <span className="font-medium">
                {formatMaturityDate(selectedPackageData.maturityDate)}
                {isMatured && (
                  <span className="ml-2 text-xs py-0.5 px-2 bg-green-100 text-green-800 rounded-full">
                    Matured
                  </span>
                )}
                {!isMatured && (
                  <span className="ml-2 text-xs py-0.5 px-2 bg-amber-100 text-amber-800 rounded-full">
                    Not Matured
                  </span>
                )}
              </span>
            </div>
            {amount && (
              <div className="flex justify-between">
                <span className="text-gray-500">Transfer Amount</span>
                <span className="font-medium">
                  ₦{parseFloat(amount).toLocaleString()}
                </span>
              </div>
            )}
            {!isMatured && selectedPackageData.interestAccrued > 0 && (
              <div className="flex justify-between items-center mt-1 pt-2 border-t border-gray-200">
                <span className="text-amber-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Early Withdrawal Penalty (50%)
                </span>
                <span className="font-medium text-amber-600">
                  ₦{penaltyAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Early Withdrawal Warning */}
      {showEarlyWithdrawalWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">Early Withdrawal Warning</h4>
              <p className="text-amber-700 text-sm mt-1">
                This package has not yet reached its maturity date. Withdrawing now will result in a 50% penalty
                on your accrued interest of ₦{selectedPackageData?.interestAccrued.toLocaleString()}.
              </p>
              <div className="bg-white rounded-lg p-3 mt-2 border border-amber-200">
                <div className="flex justify-between text-sm">
                  <span>Penalty Amount:</span>
                  <span className="font-medium">₦{penaltyAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEarlyWithdrawalWarning(false)}
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
          !selectedPackage || !amount || loading || parseFloat(amount) <= 0 || showEarlyWithdrawalWarning
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
          "Transfer Funds"
        )}
      </Button>

      {/* PIN Verification Modal */}
      <PinVerificationModal />
    </div>
  );
}

export default IBWithdrawal; 