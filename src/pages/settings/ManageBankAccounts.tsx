import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from '@/lib/toast-provider';
import { Loader2, CheckCircle2, Trash2, Edit2, Save, X, AlertCircle, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import paymentsApi from "@/lib/api/payments";
import { useNavigate } from "react-router-dom";
import { usePinVerification } from "@/hooks/usePinVerification";

interface Bank {
  name: string;
  code: string;
}

interface SavedBankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  lastUsed: string;
}

function ManageBankAccounts() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [fetchingBanks, setFetchingBanks] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankAccountNumber, setBankAccountNumber] = useState<string>("");
  const [bankAccountName, setBankAccountName] = useState<string>("");
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<SavedBankAccount[]>([]);
  const [savingAccount, setSavingAccount] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  // Add debounce timer ref
  const verifyTimerRef = useRef<number | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { verifyPin, PinVerificationModal } = usePinVerification();

  // Update the bank account number field handling
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

  // Handle bank selection change
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
        !editingAccountId && 
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
  }, [selectedBank, bankAccountNumber, verifyBankAccount, editingAccountId, verifyingAccount, accountVerified]);

  // Add useEffect to handle showing toast for verification error
  useEffect(() => {
    if (verificationError) {
      toast.error({ title: verificationError });
    }
  }, [verificationError, toast]);

  // Save current bank account
  const saveCurrentBankAccount = async (e?: React.MouseEvent) => {
    // Prevent default browser behavior that might cause page reload
    if (e) e.preventDefault();
    
    if (!selectedBank || !bankAccountNumber || !bankAccountName || !accountVerified) {
      setVerificationError("Account must be verified before saving");
      return;
    }

    // Verify PIN before saving bank account
    const pinVerified = await verifyPin({
      title: editingAccountId ? 'Update Bank Account' : 'Add Bank Account',
      description: `Enter your PIN to ${editingAccountId ? 'update' : 'add'} bank account ending in ${bankAccountNumber.slice(-4)}`
    });

    if (!pinVerified) {
      return;
    }
    
    setSavingAccount(true);
    
    try {
      const bankInfo = banks.find(bank => bank.code === selectedBank);
      if (!bankInfo) {
        setVerificationError("Invalid bank selected");
        setSavingAccount(false);
        return;
      }
      
      // Check if account already exists (for update)
      const existingIndex = savedAccounts.findIndex(
        acc => acc.id === editingAccountId
      );
      
      const accountToSave: SavedBankAccount = {
        id: editingAccountId || Date.now().toString(),
        bankName: bankInfo.name,
        bankCode: bankInfo.code,
        accountNumber: bankAccountNumber,
        accountName: bankAccountName,
        lastUsed: new Date().toISOString()
      };
      
      let updatedAccounts: SavedBankAccount[];
      
      if (existingIndex >= 0) {
        // Update existing account
        updatedAccounts = [...savedAccounts];
        updatedAccounts[existingIndex] = accountToSave;
      } else {
        // Add new account
        updatedAccounts = [...savedAccounts, accountToSave];
      }
      
      setSavedAccounts(updatedAccounts);
      saveBankAccountsToStorage(updatedAccounts);
      
      toast.success({ 
        title: existingIndex >= 0 ? "Account updated successfully" : "Account saved successfully" 
      });
      
      setEditingAccountId(null);
      resetBankFields();
    } catch (error) {
      console.error("Error saving account:", error);
      setVerificationError("Failed to save account");
    } finally {
      setSavingAccount(false);
    }
  };

  // Delete saved account
  const deleteSavedAccount = async (id: string) => {
    const accountToDelete = savedAccounts.find(acc => acc.id === id);
    if (!accountToDelete) return;

    // Verify PIN before deleting bank account
    const pinVerified = await verifyPin({
      title: 'Delete Bank Account',
      description: `Enter your PIN to delete bank account ending in ${accountToDelete.accountNumber.slice(-4)}`
    });

    if (!pinVerified) {
      return;
    }

    const updatedAccounts = savedAccounts.filter(account => account.id !== id);
    setSavedAccounts(updatedAccounts);
    saveBankAccountsToStorage(updatedAccounts);
    toast.success({ title: "Account deleted successfully" });
    
    // If currently editing this account, cancel edit mode
    if (editingAccountId === id) {
      cancelEditing();
    }
  };

  // Start editing a saved account
  const startEditingAccount = (account: SavedBankAccount) => {
    // Clear any existing errors and verification status
    setVerificationError(null);
    
    // Clear any pending verification timers
    if (verifyTimerRef.current) {
      window.clearTimeout(verifyTimerRef.current);
      verifyTimerRef.current = null;
    }
    
    setEditingAccountId(account.id);
    setSelectedBank(account.bankCode);
    setBankAccountNumber(account.accountNumber);
    setBankAccountName(account.accountName);
    setAccountVerified(true);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingAccountId(null);
    resetBankFields();
  };

  // Reset bank fields
  const resetBankFields = () => {
    setSelectedBank(null);
    setBankAccountNumber("");
    setBankAccountName("");
    setAccountVerified(false);
    setVerificationError(null);
  };

  // Fetch banks when user changes
  useEffect(() => {
    if (!user?.id) return;
    fetchBanks();
    loadSavedAccounts();
  }, [user?.id, fetchBanks, loadSavedAccounts]);

  const isCurrentAccountSaved = savedAccounts.some(
    (acc) => acc.bankCode === selectedBank && acc.accountNumber === bankAccountNumber
  );

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="mr-3 p-1 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Manage Bank Accounts</h1>
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

      {/* Saved Accounts Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-3">Your Saved Accounts</h2>
        
        {savedAccounts.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-gray-500">No saved accounts yet</p>
            <p className="text-sm text-gray-400 mt-1">Add an account below</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {savedAccounts
              .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
              .map((account) => (
                <div
                  key={account.id}
                  className="p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{account.accountName}</p>
                      <p className="text-xs text-gray-600">{account.bankName} • {account.accountNumber}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Last used: {new Date(account.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => startEditingAccount(account)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit account"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSavedAccount(account.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add/Edit Account Form */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-3">
          {editingAccountId ? "Edit Account" : "Add New Account"}
        </h2>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            saveCurrentBankAccount();
          }}
          className="space-y-4 bg-white rounded-lg border border-gray-200 p-4"
        >
          {/* Bank Selection */}
          <div>
            <label htmlFor="bank" className="block text-sm font-medium text-gray-700 mb-1">
              Bank
            </label>
            <select
              id="bank"
              value={selectedBank || ""}
              onChange={handleBankChange}
              className="focus:ring-[#0066A1] focus:border-[#0066A1] block w-full sm:text-sm border-gray-300 rounded-md py-2"
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

          {/* Bank Account Number */}
          {selectedBank && (
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                id="accountNumber"
                value={bankAccountNumber}
                onChange={handleBankAccountNumberChange}
                className={cn(
                  "focus:ring-[#0066A1] focus:border-[#0066A1] block w-full sm:text-sm border-gray-300 rounded-md py-2",
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

          {/* Account Name (Read-only) */}
          {bankAccountNumber.length === 10 && (
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="accountName"
                  id="accountName"
                  value={verifyingAccount ? "Verifying..." : bankAccountName}
                  readOnly
                  className={cn(
                    "focus:ring-[#0066A1] focus:border-[#0066A1] block w-full sm:text-sm border-gray-300 rounded-md py-2 bg-gray-50",
                    verificationError && "border-red-300"
                  )}
                />
                {accountVerified && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            {editingAccountId && (
              <Button
                type="button"
                onClick={cancelEditing}
                variant="outline"
                className="border-gray-300"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={
                !selectedBank || 
                bankAccountNumber.length !== 10 || 
                !accountVerified || 
                savingAccount ||
                (isCurrentAccountSaved && !editingAccountId)
              }
              className="bg-[#0066A1] text-white hover:bg-[#007DB8]"
            >
              {savingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  {editingAccountId ? "Update Account" : "Save Account"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* PIN Verification Modal */}
      <PinVerificationModal />
    </div>
  );
}

export default ManageBankAccounts; 