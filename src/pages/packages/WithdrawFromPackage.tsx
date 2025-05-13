import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import packagesApi, {
  DailySavingsPackage,
  SBPackage,
  WithdrawalParams,
} from "@/lib/api/packages";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Check, Circle, Loader2, Package, Wallet } from "lucide-react";

// Define package type options
type PackageType = "ds" | "sb";

interface PackageOption {
  id: string;
  name: string;
  type: string;
  balance: number;
  target?: number;
  amountPerDay?: number;
  accountNumber: string;
  product?: string;
}

function Withdrawal() {
  const [selectedType, setSelectedType] = useState<PackageType>("ds");
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingPackages, setFetchingPackages] = useState(false);
  const [selectedPackageData, setSelectedPackageData] =
    useState<PackageOption | null>(null);

  const { user } = useAuth();

  // Validate withdrawal amount based on available balance
  const validateWithdrawal = (
    packageData: PackageOption,
    withdrawalAmount: number
  ): boolean => {
    // Check if withdrawal amount is less than or equal to available balance
    return withdrawalAmount <= packageData.balance;
  };

  // Fetch packages based on selected type
  useEffect(() => {
    if (!user?.id) return;

    const fetchUserPackages = async () => {
      setFetchingPackages(true);
      setSelectedPackage(null);
      setSelectedPackageData(null);
      try {
        let dsPackages, sbPackages;

        switch (selectedType) {
          case "ds":
            dsPackages = await packagesApi.getDailySavings(user.id);
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
            break;
          case "sb":
            sbPackages = await packagesApi.getSBPackages(user.id);
            setPackages(
              sbPackages
                .filter((pkg: SBPackage) => pkg.totalContribution > 0)
                .map((pkg: SBPackage) => ({
                  id: pkg._id,
                  name: pkg.product?.name || "SureBank Package",
                  type: "SB Package",
                  balance: pkg.totalContribution,
                  target: pkg.targetAmount,
                  accountNumber: pkg.accountNumber,
                  product: pkg.product?.id,
                }))
            );
            break;
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
        toast.error("Failed to fetch packages. Please try again.");
      } finally {
        setFetchingPackages(false);
      }
    };

    fetchUserPackages();
  }, [selectedType, user?.id]);
  // Update selected package data when a package is selected
  useEffect(() => {
    if (selectedPackage) {
      const packageData = packages.find((pkg) => pkg.id === selectedPackage);
      setSelectedPackageData(packageData || null);
    } else {
      setSelectedPackageData(null);
    }
  }, [selectedPackage, packages]);

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

    setLoading(true);
    try {
      // Process withdrawal based on package type
      const isDS = selectedPackageData.type === "Daily Savings";
      const packageType = isDS ? "ds" : "sb";
      // Create withdrawal data
      const withdrawalData: WithdrawalParams = {
        packageId: selectedPackage,
        amount: withdrawalAmount,
        target: selectedPackageData.name,
        accountNumber: selectedPackageData.accountNumber,
        product: selectedPackageData.product,
      };
      
      // Use the updated API function with the package type
      await packagesApi.withdrawFromPackage(withdrawalData, packageType);

      toast.success(
        "Withdrawal successful! Amount has been added to your available balance."
      );

      // Reset form
      setAmount("");
      setSelectedPackage(null);
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to process withdrawal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get icon for package type
  const getTypeIcon = (type: PackageType) => {
    switch (type) {
      case "ds":
        return <Wallet className="h-5 w-5" />;
      case "sb":
        return <Package className="h-5 w-5" />;
      default:
        return <Circle className="h-5 w-5" />;
    }
  };

  // Helper function removed as it's not being used

  return (
    <div className="max-w-md mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
      <p className="text-gray-600">
        Withdraw funds from your package to your available balance.
      </p>

      {/* Package Type Selection */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium text-gray-900 mb-3">Select Package Type</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSelectedType("ds")}
            className={cn(
              "flex items-center justify-center p-3 rounded-lg border",
              selectedType === "ds"
                ? "bg-[#0066A1] text-white border-[#0066A1]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            <Wallet className="h-5 w-5 mr-2" />
            <span>Daily Savings</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("sb")}
            className={cn(
              "flex items-center justify-center p-3 rounded-lg border",
              selectedType === "sb"
                ? "bg-[#0066A1] text-white border-[#0066A1]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            <Package className="h-5 w-5 mr-2" />
            <span>SB Package</span>
          </button>
        </div>
      </div>

      {/* Package Selection */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium text-gray-900 mb-3">Select Package</h3>
        {fetchingPackages ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066A1]" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No packages found. Create a package first.</p>
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
                  {getTypeIcon(selectedType)}
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

      {/* Proceed Button */}
      <Button
        type="button"
        disabled={
          !selectedPackage || !amount || loading || parseFloat(amount) <= 0
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
