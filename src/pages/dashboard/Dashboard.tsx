import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SavingsPackages } from '@/components/dashboard/SavingsPackages';
import { PackageTypes } from '@/components/dashboard/PackageTypes';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { SavingsPackage, PackageType } from '@/components/dashboard/types';

function Dashboard() {
  const { user } = useAuth();
  const [hasPackages, setHasPackages] = useState(false); // This would normally be fetched from an API
  const [showBalance, setShowBalance] = useState(true); // Toggle for showing/hiding balance

  // Sample savings packages data
  const savingsPackages: SavingsPackage[] = [
    {
      id: 1,
      title: 'House Fund',
      type: 'Daily Savings',
      icon: 'home',
      progress: 40,
      current: 400000,
      target: 1000000,
      color: '#0066A1',
    },
    {
      id: 2,
      title: 'Education Fund',
      type: 'Interest-Based',
      icon: 'book-open',
      progress: 75,
      current: 750000,
      target: 1000000,
      color: '#28A745',
    },
    {
      id: 3,
      title: 'New Laptop',
      type: 'SB Package',
      icon: 'laptop',
      progress: 25,
      current: 150000,
      target: 600000,
      color: '#7952B3',
    },
  ];

  // Available package types
  const packageTypes: PackageType[] = [
    {
      id: 'ds',
      title: 'Daily Savings',
      description:
        'Save regularly with flexible daily, weekly, or monthly deposits',
      icon: 'calendar',
      color: '#0066A1',
      cta: 'Start Saving',
      path: '/packages/new?type=daily',
    },
    {
      id: 'is',
      title: 'Interest Savings',
      description: 'Earn competitive interest rates on your locked savings',
      icon: 'trending-up',
      color: '#28A745',
      cta: 'Lock Funds',
      path: '/packages/new?type=interest',
    },
    {
      id: 'sb',
      title: 'Target Savings',
      description: 'Save towards specific products with SureBank packages',
      icon: 'target',
      color: '#7952B3',
      cta: 'Choose Product',
      path: '/packages/new?type=product',
    },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Toggle between having packages or not (for demo purposes)
  const togglePackagesView = () => {
    setHasPackages(!hasPackages);
  };

  return (
    <div className="space-y-6">
      {/* User Welcome Card */}
      <WelcomeCard
        user={user || null}
        togglePackagesView={togglePackagesView}
        hasPackages={hasPackages}
      />

      {/* Enhanced Balance Card */}
      <BalanceCard
        balance={120500}
        showBalance={showBalance}
        setShowBalance={setShowBalance}
        formatCurrency={formatCurrency}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Conditional Savings Display */}
      {hasPackages ? (
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

export default Dashboard;
