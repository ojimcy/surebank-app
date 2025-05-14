import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from '@/lib/toast-provider';
import { Check, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Account, getUserAccounts } from "@/lib/api/accounts";
import paymentsApi from "@/lib/api/payments";

interface Bank {
  name: string;
  code: string;
}

function Withdraw() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [selectedAccountData, setSelectedAccountData] = useState<Account | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [withdrawnAmount, setWithdrawnAmount] = useState<string>("");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [fetchingBanks, setFetchingBanks] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankAccountName, setBankAccountName] = useState<string>("");
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Validate withdrawal amount based on available balance
  const validateWithdrawal = (
    accountData: Account,
    withdrawalAmount: number
  ): boolean => {
    // Check if withdrawal amount is less than or equal to available balance
    return withdrawalAmount <= accountData.availableBalance;
  };

  // Fetch user accounts
  const fetchUserAccounts = useCallback(async () => {
    if (!user?.id) return;
    
    setFetchingAccounts(true);
    try {
      const userAccounts = await getUserAccounts();
      setAccounts(
        userAccounts.filter((account: Account) => account.availableBalance > 0)
      );
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error({ title: "Failed to fetch accounts. Please try again." });
    } finally {
      setFetchingAccounts(false);
    }
  }, [user?.id, toast]);

  // Fetch banks
  const fetchBanks = useCallback(async () => {
    setFetchingBanks(true);
    try {
      // We'll use the payments API to fetch banks
      const banksList = await paymentsApi.getBanks();
      setBanks(banksList);
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast.error({ title: "Failed to fetch banks. Please try again." });
    } finally {
      setFetchingBanks(false);
    }
  }, [toast]);

  // Verify bank account
  const verifyBankAccount = useCallback(async () => {
    if (!selectedBank || !bankAccountNumber) return;
    
    setVerifyingAccount(true);
    setAccountVerified(false);
    
    try {
      const bankCode = banks.find(bank => bank.code === selectedBank)?.code;
      if (!bankCode) {
        toast.error({ title: "Invalid bank selected" });
        return;
      }
      
      const accountDetails = await paymentsApi.verifyBankAccount(bankCode, bankAccountNumber);
      setBankAccountName(accountDetails.accountName);
      setAccountVerified(true);
    } catch (error) {
      console.error("Error verifying account:", error);
      toast.error({ title: "Failed to verify account. Please check the details and try again." });
      setBankAccountName("");
    } finally {
      setVerifyingAccount(false);
    }
  }, [selectedBank, bankAccountNumber, banks, toast]);

  // Fetch accounts and banks when user changes
  useEffect(() => {
    if (!user?.id) return;
    setSelectedAccount(null);
    setSelectedAccountData(null);
    setWithdrawalSuccess(false);
    fetchUserAccounts();
    fetchBanks();
  }, [user?.id]);

  // Update selected account data when an account is selected
  useEffect(() => {
    if (selectedAccount) {
      const accountData = accounts.find((acc) => acc._id === selectedAccount);
      setSelectedAccountData(accountData || null);
    } else {
      setSelectedAccountData(null);
    }
  }, [selectedAccount, accounts]);

  // Verify bank account when bank and account number are entered
  useEffect(() => {
    if (selectedBank && bankAccountNumber.length === 10) {
      verifyBankAccount();
    } else {
      setAccountVerified(false);
      setBankAccountName("");
    }
  }, [selectedBank, bankAccountNumber, verifyBankAccount]);

  const resetForm = () => {
    setAmount("");
    setSelectedAccount(null);
    setSelectedBank(null);
    setBankAccountNumber("");
    setBankAccountName("");
    setAccountVerified(false);
  };

  const startNewWithdrawal = () => {
    setWithdrawalSuccess(false);
    setWithdrawnAmount("");
    resetForm();
  };

  const showSuccessScreen = (amount: string) => {
    // First set all the withdrawal success data
    setWithdrawnAmount(amount);
    
    // Then set withdrawal success to true to trigger the UI change
    setTimeout(() => {
      setWithdrawalSuccess(true);
    }, 100);
  };

  const processWithdrawal = async () => {
    if (!selectedAccountData || !selectedBank || !bankAccountNumber || !bankAccountName || !accountVerified) {
      toast.error({ title: "Please complete all fields before proceeding" });
      return;
    }

    setLoading(true);
    try {
      const withdrawalAmount = parseFloat(amount);
      
      if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
        toast.error({ title: "Please enter a valid amount" });
        setLoading(false);
        return;
      }

      if (!validateWithdrawal(selectedAccountData, withdrawalAmount)) {
        toast.error({ title: "Withdrawal amount exceeds available balance" });
        setLoading(false);
        return;
      }

      const bankCode = banks.find(bank => bank.code === selectedBank)?.code;
      if (!bankCode) {
        toast.error({ title: "Invalid bank selected" });
        setLoading(false);
        return;
      }

      // Verify account ownership by re-verifying the bank account details
      // This ensures the account hasn't been changed since initial verification
      setVerifyingAccount(true);
      try {
        const verifiedAccount = await paymentsApi.verifyBankAccount(bankCode, bankAccountNumber);
        
        // Check if the verified account name matches the previously verified name
        if (verifiedAccount.accountName !== bankAccountName) {
          toast.error({ title: "Bank account verification failed. Account details have changed." });
          setLoading(false);
          setVerifyingAccount(false);
          return;
        }

        // Check if the account name contains at least 2 parts of the user's name in any order
        // This is a more flexible check for name verification
        const accountNameLower = verifiedAccount.accountName.toLowerCase();
        const userNameParts = [];
        
        if (user?.firstName) {
          userNameParts.push(user.firstName.toLowerCase());
        }
        
        if (user?.lastName) {
          // Split lastName by spaces to handle multi-part last names
          const lastNameParts = user.lastName.toLowerCase().split(' ');
          userNameParts.push(...lastNameParts);
        }
        
        // Count how many name parts match
        const matchingParts = userNameParts.filter(part => 
          // Only consider parts with at least 3 characters to avoid matching common short words
          part.length >= 3 && accountNameLower.includes(part)
        );
        
        // Require at least 2 name parts to match, or 1 if user only has one name part
        const minimumMatches = userNameParts.length > 1 ? 2 : 1;
        const hasEnoughMatches = matchingParts.length >= minimumMatches;
        
        if (!hasEnoughMatches) {
          // Log for security monitoring
          console.warn("Account ownership verification failed", {
            userNameParts,
            accountName: verifiedAccount.accountName,
            matchingParts
          });
          
          // Block the transaction - this is more secure
          toast.error({
            title: "Bank account name doesn't match your profile name",
            description: "For security reasons, withdrawals are only allowed to accounts that match your name."
          });
          setLoading(false);
          setVerifyingAccount(false);
          return;
        }
      } catch (error) {
        console.error("Error re-verifying account:", error);
        toast.error({ title: "Account verification failed. Please try again." });
        setLoading(false);
        setVerifyingAccount(false);
        return;
      }
      setVerifyingAccount(false);

      // Process the withdrawal
      await paymentsApi.createWithdrawalRequest({
        accountNumber: selectedAccountData.accountNumber,
        amount: withdrawalAmount,
        bankName: banks.find(bank => bank.code === selectedBank)?.name || "",
        bankCode,
        bankAccountNumber,
        bankAccountName,
      });

      // Show success screen
      showSuccessScreen(withdrawalAmount.toString());
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast.error({ title: "Failed to process withdrawal. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // If withdrawal was successful, show success screen
  if (withdrawalSuccess) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Successful!</h1>
          <p className="text-gray-600 mt-2">
            Your withdrawal request of ₦{parseFloat(withdrawnAmount).toLocaleString()} has been submitted successfully.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Withdrawal Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium">₦{parseFloat(withdrawnAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Processing
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Time</span>
              <span className="font-medium">24-48 hours</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-[#0066A1] text-white rounded-md py-4 font-semibold hover:bg-[#007DB8] transition-colors h-auto"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={startNewWithdrawal}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 rounded-md py-4 font-semibold hover:bg-gray-50 transition-colors h-auto"
          >
            Make Another Withdrawal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
        <p className="text-gray-600 mt-1">
          Withdraw your available balance to your bank account
        </p>
      </div>

      {fetchingAccounts ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No accounts with available balance found</p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="mt-4 bg-[#0066A1] text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Select Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Account
            </label>
            <div className="grid grid-cols-1 gap-3">
              {accounts.map((account) => (
                <button
                  key={account._id}
                  type="button"
                  onClick={() => setSelectedAccount(account._id)}
                  className={cn(
                    "flex items-center justify-between p-3 border rounded-lg",
                    selectedAccount === account._id
                      ? "border-[#0066A1] bg-blue-50"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {account.accountType.toUpperCase()} Account
                      </p>
                      <p className="text-xs text-gray-500">
                        {account.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">
                      ₦{account.availableBalance.toLocaleString()}
                    </span>
                    {selectedAccount === account._id && (
                      <div className="bg-[#0066A1] rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          {selectedAccountData && (
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount to Withdraw
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₦</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="focus:ring-[#0066A1] focus:border-[#0066A1] block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-3"
                  placeholder="0.00"
                  min="1"
                  max={selectedAccountData.availableBalance}
                />
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setAmount(selectedAccountData.availableBalance.toString())}
                  className="text-sm text-[#0066A1] font-medium hover:text-[#007DB8]"
                >
                  Max (₦{selectedAccountData.availableBalance.toLocaleString()})
                </button>
              </div>
            </div>
          )}

          {/* Bank Selection */}
          {selectedAccountData && amount && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Bank
              </label>
              <select
                value={selectedBank || ""}
                onChange={(e) => setSelectedBank(e.target.value || null)}
                className="focus:ring-[#0066A1] focus:border-[#0066A1] block w-full sm:text-sm border-gray-300 rounded-md py-3"
              >
                <option value="">Select a bank</option>
                {fetchingBanks ? (
                  <option disabled>Loading banks...</option>
                ) : (
                  banks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          {/* Bank Account Number */}
          {selectedBank && (
            <div>
              <label
                htmlFor="accountNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                id="accountNumber"
                value={bankAccountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    setBankAccountNumber(value);
                  }
                }}
                className="focus:ring-[#0066A1] focus:border-[#0066A1] block w-full sm:text-sm border-gray-300 rounded-md py-3"
                placeholder="Enter 10-digit account number"
                maxLength={10}
              />
            </div>
          )}

          {/* Account Name (Read-only) */}
          {bankAccountNumber.length === 10 && (
            <div>
              <label
                htmlFor="accountName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Account Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="accountName"
                  id="accountName"
                  value={verifyingAccount ? "Verifying..." : bankAccountName}
                  readOnly
                  className="focus:ring-[#0066A1] focus:border-[#0066A1] block w-full sm:text-sm border-gray-300 rounded-md py-3 bg-gray-50"
                />
                {accountVerified && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Withdrawal Summary */}
          {selectedAccountData && amount && parseFloat(amount) > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">Withdrawal Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Account</span>
                  <span className="font-medium">
                    {selectedAccountData.accountType.toUpperCase()} ({selectedAccountData.accountNumber})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Available Balance</span>
                  <span className="font-medium">
                    ₦{selectedAccountData.availableBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Withdrawal Amount</span>
                  <span className="font-medium">
                    ₦{parseFloat(amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Remaining Balance</span>
                  <span className="font-medium">
                    ₦
                    {Math.max(
                      0,
                      selectedAccountData.availableBalance - parseFloat(amount || "0")
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Proceed Button */}
          <Button
            type="button"
            disabled={
              !selectedAccount || 
              !amount || 
              loading || 
              parseFloat(amount) <= 0 || 
              !selectedBank || 
              bankAccountNumber.length !== 10 || 
              !accountVerified
            }
            onClick={processWithdrawal}
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
      )}
    </div>
  );
}

export default Withdraw;
