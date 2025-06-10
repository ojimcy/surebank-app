import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from '@/lib/toast-provider';
import { Loader2, CheckCircle2, Plus, Minus, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import paymentsApi, { AccountWithBalance, MultiWithdrawalResponse } from "@/lib/api/payments";

interface Bank {
  name: string;
  code: string;
}

interface SelectedAccountWithdrawal {
  accountId: string;
  accountNumber: string;
  accountType: string;
  availableBalance: number;
  amount: string;
}

interface SavedBankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  lastUsed: string;
}

function Withdraw() {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccountWithdrawal[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [withdrawalResult, setWithdrawalResult] = useState<MultiWithdrawalResponse | null>(null);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [fetchingBanks, setFetchingBanks] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankAccountName, setBankAccountName] = useState<string>("");
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState<string>("");
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>([]);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  // Add debounce timer ref
  const verifyTimerRef = useRef<number | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Calculate total withdrawal amount
  const totalWithdrawalAmount = selectedAccounts.reduce((total, account) => {
    const amount = parseFloat(account.amount || "0");
    return total + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Validate withdrawal amounts for all selected accounts
  const validateWithdrawals = (): boolean => {
    if (selectedAccounts.length === 0) return false;
    
    return selectedAccounts.every(selectedAccount => {
      const amount = parseFloat(selectedAccount.amount || "0");
      return !isNaN(amount) && amount > 0 && amount <= selectedAccount.availableBalance;
    });
  };

  // Fetch user accounts with balances
  const fetchUserAccounts = useCallback(async () => {
    if (!user?.id) return;
    
    setFetchingAccounts(true);
    try {
      const userAccounts = await paymentsApi.getUserAccountsWithBalances();
      // Filter for active accounts with available balance
      const activeAccounts = userAccounts.filter(
        (account: AccountWithBalance) => 
          account.status === 'active' && account.availableBalance > 0
      );
      setAccounts(activeAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error({ title: "Failed to fetch accounts. Please try again." });
    } finally {
      setFetchingAccounts(false);
    }
  }, [user?.id]);

  // Fetch banks
  const fetchBanks = useCallback(async () => {
    setFetchingBanks(true);
    try {
      const banksList = await paymentsApi.getBanks();
      setBanks(banksList);
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast.error({ title: "Failed to fetch banks. Please try again." });
    } finally {
      setFetchingBanks(false);
    }
  }, [toast]);

  // Load saved accounts from localStorage
  const loadSavedAccounts = useCallback(() => {
    if (!user?.id) return;
    
    try {
      const savedAccountsData = localStorage.getItem(`savedBankAccounts_${user.id}`);
      if (savedAccountsData) {
        const accounts = JSON.parse(savedAccountsData);
        setSavedAccounts(accounts);
      }
    } catch (error) {
      console.error("Error loading saved accounts:", error);
    }
  }, [user?.id]);

  // Save accounts to localStorage
  const saveBankAccountsToStorage = (accounts: SavedBankAccount[]) => {
    if (!user?.id) return;
    
    try {
      localStorage.setItem(`savedBankAccounts_${user.id}`, JSON.stringify(accounts));
    } catch (error) {
      console.error("Error saving accounts:", error);
    }
  };

  // Reset bank fields
  const resetBankFields = () => {
    setSelectedBank(null);
    setBankAccountNumber("");
    setBankAccountName("");
    setAccountVerified(false);
    setVerificationError(null);
  };

  // Reset all form fields
  const resetForm = () => {
    setSelectedAccounts([]);
    resetBankFields();
    setWithdrawalReason("");
  };

  // Select a saved account to use
  const selectSavedAccount = (account: SavedBankAccount) => {
    // Clear any existing errors and verification status
    setVerificationError(null);
    
    // Clear any pending verification timers
    if (verifyTimerRef.current) {
      window.clearTimeout(verifyTimerRef.current);
      verifyTimerRef.current = null;
    }
    
    // Set the bank account details directly
    setSelectedBank(account.bankCode);
    setBankAccountNumber(account.accountNumber);
    setBankAccountName(account.accountName);
    setAccountVerified(true);
    
    // Update lastUsed timestamp
    const updatedAccounts = savedAccounts.map(acc => 
      acc.id === account.id 
        ? { ...acc, lastUsed: new Date().toISOString() }
        : acc
    );
    
    setSavedAccounts(updatedAccounts);
    saveBankAccountsToStorage(updatedAccounts);
  };

  // Verify bank account
  const verifyBankAccount = useCallback(async () => {
    if (!selectedBank || !bankAccountNumber || bankAccountNumber.length !== 10 || verifyingAccount) return;
    
    // Add additional check to prevent repeated requests for known invalid combinations
    const cacheKey = `${selectedBank}-${bankAccountNumber}`;
    const verificationCache = sessionStorage.getItem('verificationAttempts') || '{}';
    const attemptCache = JSON.parse(verificationCache);
    
    // If we've already tried this combination and it failed recently, don't try again
    if (attemptCache[cacheKey] && (Date.now() - attemptCache[cacheKey].timestamp) < 60000) {
      if (attemptCache[cacheKey].attempts >= 2) {
        setVerificationError("Too many failed verification attempts. Please try again later or use a different account.");
        return;
      }
    }
    
    setVerifyingAccount(true);
    setAccountVerified(false);
    setVerificationError(null); // Clear any previous errors
    
    try {
      const bankCode = banks.find(bank => bank.code === selectedBank)?.code;
      if (!bankCode) {
        setVerificationError("Invalid bank selected");
        setVerifyingAccount(false);
        
        // Record the failure
        attemptCache[cacheKey] = { 
          attempts: (attemptCache[cacheKey]?.attempts || 0) + 1,
          timestamp: Date.now()
        };
        sessionStorage.setItem('verificationAttempts', JSON.stringify(attemptCache));
        return;
      }
      
      const accountDetails = await paymentsApi.verifyBankAccount(bankCode, bankAccountNumber);
      setBankAccountName(accountDetails.accountName);
      setAccountVerified(true);
      
      // Clear the attempt count on success
      if (attemptCache[cacheKey]) {
        delete attemptCache[cacheKey];
        sessionStorage.setItem('verificationAttempts', JSON.stringify(attemptCache));
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      setVerificationError("Failed to verify account. Please check the details and try again.");
      setBankAccountName("");
      
      // Record the failure
      attemptCache[cacheKey] = { 
        attempts: (attemptCache[cacheKey]?.attempts || 0) + 1,
        timestamp: Date.now()
      };
      sessionStorage.setItem('verificationAttempts', JSON.stringify(attemptCache));
    } finally {
      setVerifyingAccount(false);
    }
  }, [selectedBank, bankAccountNumber, banks, verifyingAccount]);

  // Add account to withdrawal selection
  const addAccountToWithdrawal = (account: AccountWithBalance) => {
    const isAlreadySelected = selectedAccounts.some(
      selected => selected.accountId === account._id
    );
    
    if (!isAlreadySelected) {
      setSelectedAccounts(prev => [...prev, {
        accountId: account._id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        availableBalance: account.availableBalance,
        amount: ""
      }]);
    }
  };

  // Remove account from withdrawal selection
  const removeAccountFromWithdrawal = (accountId: string) => {
    setSelectedAccounts(prev => prev.filter(account => account.accountId !== accountId));
  };

  // Update withdrawal amount for a selected account
  const updateAccountAmount = (accountId: string, amount: string) => {
    setSelectedAccounts(prev => prev.map(account => 
      account.accountId === accountId ? { ...account, amount } : account
    ));
  };

  // Set maximum amount for an account
  const setMaxAmount = (accountId: string) => {
    setSelectedAccounts(prev => prev.map(account => 
      account.accountId === accountId 
        ? { ...account, amount: account.availableBalance.toString() }
        : account
    ));
  };

  // Handle bank input functionality
  const handleBankAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      // Clear verification status when account number changes
      if (value !== bankAccountNumber) {
        setAccountVerified(false);
        setBankAccountName("");
        setVerificationError(null);
      }
      setBankAccountNumber(value);
    }
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value || null;
    // Clear verification status when bank changes
    if (value !== selectedBank) {
      setAccountVerified(false);
      setBankAccountName("");
      setVerificationError(null);
    }
    setSelectedBank(value);
  };

  // Fetch accounts and banks when user changes
  useEffect(() => {
    if (!user?.id) return;
    setSelectedAccounts([]);
    setWithdrawalSuccess(false);
    setWithdrawalResult(null);
    fetchUserAccounts();
    fetchBanks();
    loadSavedAccounts();
  }, [user?.id, fetchUserAccounts, fetchBanks, loadSavedAccounts]);

  // Update the useEffect to use debounce for bank account verification
  useEffect(() => {
    // Clear any existing timer
    if (verifyTimerRef.current) {
      window.clearTimeout(verifyTimerRef.current);
      verifyTimerRef.current = null;
    }
    
    // Check if this account has already failed verification too many times
    if (selectedBank && bankAccountNumber.length === 10) {
      const cacheKey = `${selectedBank}-${bankAccountNumber}`;
      const verificationCache = sessionStorage.getItem('verificationAttempts') || '{}';
      const attemptCache = JSON.parse(verificationCache);
      
      if (attemptCache[cacheKey] && (Date.now() - attemptCache[cacheKey].timestamp) < 60000) {
        if (attemptCache[cacheKey].attempts >= 2) {
          setVerificationError("Too many failed verification attempts. Please try again later or use a different account.");
          return;
        }
      }
    }
    
    // Only attempt verification if we have a complete account number, a selected bank, 
    // are not already verifying, and the account isn't already verified
    if (selectedBank && 
        bankAccountNumber.length === 10 && 
        !verifyingAccount && 
        !accountVerified) {
      // Set a new timer to delay the verification by 500ms
      verifyTimerRef.current = window.setTimeout(() => {
        verifyBankAccount();
      }, 500);
    }
    
    // Cleanup timer on component unmount
    return () => {
      if (verifyTimerRef.current) {
        window.clearTimeout(verifyTimerRef.current);
      }
    };
  }, [selectedBank, bankAccountNumber, verifyBankAccount, verifyingAccount, accountVerified]);

  // Add useEffect to handle showing toast for verification error
  useEffect(() => {
    if (verificationError) {
      toast.error({ title: verificationError });
    }
  }, [verificationError, toast]);

  const startNewWithdrawal = () => {
    setWithdrawalSuccess(false);
    setWithdrawalResult(null);
    resetForm();
  };

  const showSuccessScreen = (result: MultiWithdrawalResponse) => {
    setWithdrawalResult(result);
    setTimeout(() => {
      setWithdrawalSuccess(true);
    }, 100);
  };

  const processWithdrawal = async () => {
    if (!selectedBank || !bankAccountNumber || !bankAccountName || !accountVerified) {
      setVerificationError("Please complete all bank details before proceeding");
      return;
    }

    if (!validateWithdrawals()) {
      setVerificationError("Please check withdrawal amounts for all selected accounts");
      return;
    }

    setLoading(true);
    try {
      const bankCode = banks.find(bank => bank.code === selectedBank)?.code;
      const bankName = banks.find(bank => bank.code === selectedBank)?.name;
      
      if (!bankCode || !bankName) {
        setVerificationError("Invalid bank selected");
        setLoading(false);
        return;
      }

      // Verify account ownership by re-verifying the bank account details
      setVerifyingAccount(true);
      try {
        const verifiedAccount = await paymentsApi.verifyBankAccount(bankCode, bankAccountNumber);
        
        if (verifiedAccount.accountName !== bankAccountName) {
          setVerificationError("Bank account verification failed. Account details have changed.");
          setLoading(false);
          setVerifyingAccount(false);
          return;
        }

        // Name verification logic (same as before)
        const accountNameLower = verifiedAccount.accountName.toLowerCase();
        const userNameParts = [];
        
        if (user?.firstName) {
          userNameParts.push(user.firstName.toLowerCase());
        }
        
        if (user?.lastName) {
          const lastNameParts = user.lastName.toLowerCase().split(' ');
          userNameParts.push(...lastNameParts);
        }
        
        const matchingParts = userNameParts.filter(part => 
          part.length >= 3 && accountNameLower.includes(part)
        );
        
        const minimumMatches = userNameParts.length > 1 ? 2 : 1;
        const hasEnoughMatches = matchingParts.length >= minimumMatches;
        
        if (!hasEnoughMatches) {
          console.warn("Account ownership verification failed", {
            userNameParts,
            accountName: verifiedAccount.accountName,
            matchingParts
          });
          
          setVerificationError("Bank account name doesn't match your profile name. For security reasons, withdrawals are only allowed to accounts that match your name.");
          setLoading(false);
          setVerifyingAccount(false);
          return;
        }
      } catch (error) {
        console.error("Error re-verifying account:", error);
        setVerificationError("Account verification failed. Please try again.");
        setLoading(false);
        setVerifyingAccount(false);
        return;
      }
      setVerifyingAccount(false);

      // Process the multi-account withdrawal
      const withdrawalAccounts = selectedAccounts.map(account => ({
        accountNumber: account.accountNumber,
        amount: parseFloat(account.amount)
      }));

      const result = await paymentsApi.createMultiAccountWithdrawalRequest({
        withdrawalAccounts,
        bankName,
        bankCode,
        bankAccountNumber,
        bankAccountName,
        reason: withdrawalReason || "Multi-account withdrawal"
      });

      // Show success screen
      showSuccessScreen(result);
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      setVerificationError("Failed to process withdrawal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If withdrawal was successful, show success screen
  if (withdrawalSuccess && withdrawalResult) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Successful!</h1>
          <p className="text-gray-600 mt-2">
            Your multi-account withdrawal request of ₦{withdrawalResult.totalAmount.toLocaleString()} has been submitted successfully.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Withdrawal Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-medium">₦{withdrawalResult.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Accounts</span>
              <span className="font-medium">{withdrawalResult.summary.accountsCount} accounts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Processing
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Group ID</span>
              <span className="font-medium text-xs">{withdrawalResult.groupId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Time</span>
              <span className="font-medium">24-48 hours</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Individual Withdrawals</h4>
          <div className="space-y-2">
            {withdrawalResult.withdrawalRequests.map((request) => (
              <div key={request._id} className="flex justify-between text-sm">
                <span className="text-gray-600">Account {request.accountNumber}</span>
                <span className="font-medium">₦{request.amount.toLocaleString()}</span>
              </div>
            ))}
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
          Withdraw from multiple accounts simultaneously
        </p>
      </div>

      {/* Display a single error message if there's a verification error */}
      {verificationError && (
        <div className="bg-red-100 border border-red-200 text-red-800 rounded-md p-3 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{verificationError}</p>
            <button
              onClick={() => setVerificationError(null)}
              className="text-xs text-red-700 font-medium mt-1 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
          {/* Available Accounts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Accounts
            </label>
            <div className="grid grid-cols-1 gap-3">
              {accounts.map((account) => {
                const isSelected = selectedAccounts.some(
                  selected => selected.accountId === account._id
                );
                
                return (
                  <div
                    key={account._id}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg",
                      isSelected
                        ? "border-[#0066A1] bg-blue-50"
                        : "border-gray-300 bg-white"
                    )}
                  >
                    <div className="flex items-center flex-1">
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {account.accountType.toUpperCase()} Account
                        </p>
                        <p className="text-xs text-gray-500">
                          {account.accountNumber}
                        </p>
                        <p className="text-xs text-gray-600">
                          Available: ₦{account.availableBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isSelected ? (
                        <button
                          type="button"
                          onClick={() => removeAccountFromWithdrawal(account._id)}
                          className="bg-red-500 rounded-full p-1 hover:bg-red-600"
                        >
                          <Minus className="h-3 w-3 text-white" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addAccountToWithdrawal(account)}
                          className="bg-[#0066A1] rounded-full p-1 hover:bg-[#007DB8]"
                        >
                          <Plus className="h-3 w-3 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Accounts with Amount Inputs */}
          {selectedAccounts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amounts
              </label>
              <div className="space-y-3">
                {selectedAccounts.map((selectedAccount) => (
                  <div key={selectedAccount.accountId} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {selectedAccount.accountType.toUpperCase()} - {selectedAccount.accountNumber}
                      </span>
                      <span className="text-xs text-gray-500">
                        Max: ₦{selectedAccount.availableBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₦</span>
                      </div>
                      <input
                        type="number"
                        value={selectedAccount.amount}
                        onChange={(e) => updateAccountAmount(selectedAccount.accountId, e.target.value)}
                        className="focus:ring-[#0066A1] focus:border-[#0066A1] block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
                        placeholder="0.00"
                        min="1"
                        max={selectedAccount.availableBalance}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setMaxAmount(selectedAccount.accountId)}
                          className="text-xs text-[#0066A1] font-medium hover:text-[#007DB8]"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Summary */}
          {selectedAccounts.length > 0 && totalWithdrawalAmount > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Total Withdrawal</span>
                <span className="text-lg font-bold text-[#0066A1]">
                  ₦{totalWithdrawalAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                From {selectedAccounts.length} account{selectedAccounts.length > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Recipient Account Section */}
          {selectedAccounts.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Recipient Account
                </label>
                <Link
                  to="/settings/manage-bank-accounts"
                  className="text-xs text-[#0066A1] font-medium hover:underline flex items-center"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Manage Accounts
                </Link>
              </div>

              {savedAccounts.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-4 text-center mb-4">
                  <p className="text-gray-500 text-sm">No saved accounts</p>
                  <Link
                    to="/settings/manage-bank-accounts"
                    className="text-xs text-[#0066A1] font-medium hover:underline mt-1 inline-block"
                  >
                    Add a bank account
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 mb-4">
                  {savedAccounts
                    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
                    .slice(0, 3) // Show only the 3 most recently used accounts
                    .map((account) => (
                      <div
                        key={account.id}
                        className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        <button
                          type="button"
                          onClick={() => selectSavedAccount(account)}
                          className="text-left w-full"
                        >
                          <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                          <p className="text-xs text-gray-600">{account.bankName} • {account.accountNumber}</p>
                        </button>
                      </div>
                    ))}
                  
                  {savedAccounts.length > 3 && (
                    <div className="p-2 text-center border-t border-gray-100">
                      <Link
                        to="/settings/manage-bank-accounts"
                        className="text-xs text-[#0066A1] font-medium hover:underline"
                      >
                        View all accounts
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {accountVerified ? (
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bankAccountName}</p>
                      <p className="text-xs text-gray-600">
                        {banks.find(bank => bank.code === selectedBank)?.name} • {bankAccountNumber}
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4 text-center">
                  <p className="text-sm text-blue-800">Please select a recipient account</p>
                </div>
              )}
            </div>
          )}

          {/* Bank Selection Section - Only show if needed in the future */}
          {selectedAccounts.length > 0 && !accountVerified && savedAccounts.length === 0 && (
            <div className="space-y-4">
              <select
                value={selectedBank || ""}
                onChange={handleBankChange}
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
              
              {selectedBank && (
                <div>
                  <input
                    type="text"
                    name="accountNumber"
                    id="accountNumber"
                    value={bankAccountNumber}
                    onChange={handleBankAccountNumberChange}
                    className={cn(
                      "focus:ring-[#0066A1] focus:border-[#0066A1] block w-full sm:text-sm border-gray-300 rounded-md py-3",
                      verificationError && "border-red-300"
                    )}
                    placeholder="Enter 10-digit account number"
                    maxLength={10}
                  />
                  {bankAccountNumber.length > 0 && bankAccountNumber.length < 10 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Please enter all 10 digits of the account number
                    </p>
                  )}
                </div>
              )}
              
              {bankAccountNumber.length === 10 && (
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="accountName"
                    id="accountName"
                    value={verifyingAccount ? "Verifying..." : bankAccountName}
                    readOnly
                    className={cn(
                      "focus:ring-[#0066A1] focus:border-[#0066A1] block w-full sm:text-sm border-gray-300 rounded-md py-3 bg-gray-50",
                      verificationError && "border-red-300"
                    )}
                  />
                  {accountVerified && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Proceed Button */}
          <Button
            type="button"
            disabled={
              selectedAccounts.length === 0 ||
              !validateWithdrawals() ||
              loading || 
              !selectedBank || 
              bankAccountNumber.length !== 10 || 
              !accountVerified
            }
            onClick={(e) => {
              e.preventDefault();
              processWithdrawal();
            }}
            className="w-full bg-[#0066A1] text-white rounded-md py-4 font-semibold hover:bg-[#007DB8] transition-colors h-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              `Withdraw ₦${totalWithdrawalAmount.toLocaleString()}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default Withdraw;
