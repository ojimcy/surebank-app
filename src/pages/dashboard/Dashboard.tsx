import { useAuth } from '@/hooks/useAuth';
import { useState, useMemo } from 'react';
// import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SavingsPackages } from '@/components/dashboard/SavingsPackages';
import { PackageTypes } from '@/components/dashboard/PackageTypes';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { PackageType } from '@/components/dashboard/types';
import { useAccountQueries } from '@/hooks/queries/useAccountQueries';
import { usePackageQueries } from '@/hooks/queries/usePackageQueries';
import { memo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Announcements } from '@/components/dashboard/Announcements';

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
    refetchAccounts,
  } = useAccountQueries();

  // Use package queries to get packages data
  const {
    packages: savingsPackages,
    isLoading: isPackagesLoading,
  } = usePackageQueries();

  // Filter out closed packages
  const activePackages = useMemo(() => {
    return savingsPackages.filter(pkg => {
      if (!pkg.status) return true; // Include packages with no status field
      const status = pkg.status.toLowerCase();
      return status !== 'closed';
    });
  }, [savingsPackages]);

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

  
  return (
    <div className="space-y-6">
      {/* User Welcome Card */}
      {/* <WelcomeCard user={user || null} /> */}

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
        refreshBalance={refetchAccounts}
      />

      {/* Announcements */}
      <Announcements user={user || null} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Conditional Savings Display */}
      {isPackagesLoading ? (
        <div className="p-6 bg-white rounded-xl shadow-sm space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      ) : activePackages.length > 0 ? (
        // Existing Savings Plans Section
        <SavingsPackages
          packages={activePackages}
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
