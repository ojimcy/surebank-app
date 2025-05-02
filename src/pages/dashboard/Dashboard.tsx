import { useAuth } from '@/hooks/useAuth';
import { useState, useMemo, useCallback } from 'react';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SavingsPackages } from '@/components/dashboard/SavingsPackages';
import { PackageTypes } from '@/components/dashboard/PackageTypes';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { PackageType } from '@/components/dashboard/types';
import { useAccountQueries } from '@/hooks/queries/useAccountQueries';
import { usePackageQueries } from '@/hooks/queries/usePackageQueries';
import { memo } from 'react';

function Dashboard() {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true); // Toggle for showing/hiding balance

  // Use account queries to get accounts data
  const {
    totalAvailableBalance,
    hasAccounts,
    isAccountsLoading,
    createAccount,
    isCreateAccountLoading,
    accounts,
  } = useAccountQueries();

  // Use package queries to get packages data
  const {
    packages: savingsPackages,
    hasPackages,
    isLoading: isPackagesLoading,
  } = usePackageQueries();

  // Available package types - memoized to prevent recreation on each render
  const packageTypes = useMemo<PackageType[]>(
    () => [
      {
        id: 'ds',
        title: 'DS',
        description:
          'Save regularly with flexible daily, weekly, or monthly deposits',
        icon: 'calendar',
        color: '#0066A1',
        cta: 'Start Saving',
        path: '/packages/new?type=daily',
      },
      {
        id: 'is',
        title: 'IBS',
        description: 'Earn competitive interest rates on your locked savings',
        icon: 'trending-up',
        color: '#28A745',
        cta: 'Lock Funds',
        path: '/packages/new?type=interest',
      },
      {
        id: 'sb',
        title: 'SB',
        description: 'Save towards specific products with SureBank packages',
        icon: 'target',
        color: '#7952B3',
        cta: 'Choose Product',
        path: '/packages/new?type=product',
      },
    ],
    []
  );

  // Format currency - memoized to avoid recreation on each render
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  }, []);
  console.log('savingsPackages', savingsPackages);
  return (
    <div className="space-y-6">
      {/* User Welcome Card */}
      <WelcomeCard user={user || null} />

      {/* Enhanced Balance Card */}
      <BalanceCard
        balance={totalAvailableBalance}
        showBalance={showBalance}
        setShowBalance={setShowBalance}
        formatCurrency={formatCurrency}
        hasAccounts={hasAccounts}
        isAccountsLoading={isAccountsLoading}
        createAccount={createAccount}
        isCreateAccountLoading={isCreateAccountLoading}
        accounts={accounts}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Conditional Savings Display */}
      {isPackagesLoading ? (
        <div className="p-4 bg-white rounded-xl shadow-sm flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : hasPackages ? (
        // Existing Savings Plans Section
        <SavingsPackages
          packages={savingsPackages}
          formatCurrency={formatCurrency}
        />
      ) : (
        // Available Package Types Section
        <PackageTypes packageTypes={packageTypes} />
      )}

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}

export default memo(Dashboard);
