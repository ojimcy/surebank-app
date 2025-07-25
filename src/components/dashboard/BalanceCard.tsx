import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SelectAccountType } from '@/components/accounts/SelectAccountType';
import { Account } from '@/lib/api/accounts';
import { Skeleton } from '@/components/ui/skeleton';

interface BalanceCardProps {
  balance: number;
  showBalance: boolean;
  setShowBalance: (show: boolean) => void;
  formatCurrency: (amount: number) => string;
  hasAccounts: boolean;
  isAccountsLoading: boolean;
  createAccount: (accountType: 'ds' | 'sb' | 'ibs') => void;
  isCreateAccountLoading: boolean;
  accounts?: Account[];
  refreshBalance?: () => void;
}

export function BalanceCard({
  balance,
  showBalance,
  setShowBalance,
  formatCurrency,
  hasAccounts = true,
  isAccountsLoading = false,
  createAccount,
  isCreateAccountLoading = false,
  accounts = [],
  refreshBalance,
}: BalanceCardProps) {
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [showAccountLinks, setShowAccountLinks] = useState(false);

  // Close modal when account creation completes or when user gets accounts
  useEffect(() => {
    if (hasAccounts && showAccountTypeModal) {
      setShowAccountTypeModal(false);
    }
  }, [hasAccounts, isCreateAccountLoading]);

  const handleCreateAccount = (accountType: 'ds' | 'sb' | 'ibs') => {
    createAccount(accountType);
    // Don't close modal immediately - wait for API response
    // The useEffect above will handle closing when hasAccounts becomes true
  };

  // Get unique account types from accounts array
  const accountTypes = accounts
    ? [...new Set(accounts.map((account) => account.accountType))]
    : [];

  // Helper function to get account type display name
  const getAccountTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      ds: 'DS',
      sb: 'SB',
      ibs: 'IBS',
    };
    return typeMap[type] || type.toUpperCase();
  };

  return (
    <div className="bg-gradient-to-br from-[#0066A1] via-[#0077B5] to-[#0088CC] rounded-xl shadow-lg p-7 text-white border border-blue-400/10 backdrop-blur-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm uppercase tracking-wider font-semibold text-blue-50">
             Available Balance
            </h2>
            <div className="flex items-center gap-1">
              {hasAccounts && (
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="bg-white/20 p-1 rounded-full hover:bg-white/30 transition-colors"
                  aria-label={showBalance ? 'Hide balance' : 'Show balance'}
                >
                  {showBalance ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              )}
              {hasAccounts && refreshBalance && (
                <button
                  onClick={refreshBalance}
                  disabled={isAccountsLoading}
                  className="bg-white/20 p-1 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh balance"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ${isAccountsLoading ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-6">
            {isAccountsLoading ? (
              <Skeleton className="h-12 w-48 bg-white/20" />
            ) : hasAccounts ? (
              showBalance ? (
                <p className="text-4xl font-bold text-blue-50 drop-shadow-sm">
                  {formatCurrency(balance)}
                </p>
              ) : (
                <p className="text-4xl font-bold text-blue-50">•••••••</p>
              )
            ) : (
              <p className="text-lg text-blue-50">No accounts yet</p>
            )}
          </div>
        </div>
        <div className="bg-gradient-to-br from-white/20 to-white/10 p-3 rounded-full shadow-inner backdrop-blur-sm border border-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      {/* Account type links */}
      {hasAccounts && accountTypes.length > 0 && (
        <div className="mt-5">
          <button
            onClick={() => setShowAccountLinks(!showAccountLinks)}
            className="text-xs font-medium text-blue-100 hover:text-white flex items-center gap-1 transition-colors"
          >
            View accounts
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 transition-transform ${
                showAccountLinks ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showAccountLinks && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {accountTypes.map((type) => (
                <Link
                  key={type}
                  to={`/accounts/${type}`}
                  className="text-xs bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors font-medium border border-white/5 backdrop-blur-sm text-center"
                >
                  {getAccountTypeName(type)}
                </Link>
              ))}
              <button
                onClick={() => setShowAccountTypeModal(true)}
                className="text-xs bg-blue-500/30 hover:bg-blue-500/40 px-3 py-2 rounded-lg transition-colors font-medium border border-blue-400/20 text-center flex items-center justify-center gap-1 text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Access Actions - Show when user has accounts */}
      {hasAccounts && (
        <div className="mt-4 flex gap-2">
          <Link
            to="/cards"
            className="flex-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-center text-xs font-medium border border-white/10 backdrop-blur-sm flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
            My Cards
          </Link>
          <Link
            to="/schedules"
            className="flex-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors text-center text-xs font-medium border border-white/10 backdrop-blur-sm flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Schedules
          </Link>
        </div>
      )}

      {/* Create Account Button - Only show if no accounts exist */}
      {!hasAccounts && !isAccountsLoading && (
        <div className="mt-5">
          <button
            onClick={() => setShowAccountTypeModal(true)}
            disabled={isCreateAccountLoading}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors font-medium text-sm border border-white/10 backdrop-blur-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreateAccountLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Creating...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Account
              </>
            )}
          </button>
        </div>
      )}

      {/* Account Type Selection Modal */}
      {showAccountTypeModal && (
        <SelectAccountType
          onCancel={() => setShowAccountTypeModal(false)}
          onSelect={handleCreateAccount}
          isLoading={isCreateAccountLoading}
        />
      )}
    </div>
  );
}
