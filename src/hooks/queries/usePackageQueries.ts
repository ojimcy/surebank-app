import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import packagesApi, {
  DailySavingsPackage,
  SBPackage,
  IBPackage,
} from '@/lib/api/packages';
import { SavingsPackage } from '@/components/dashboard/types';

// Helper function to map package type to color
const getPackageColor = (type: string): string => {
  switch (type) {
    case 'Daily Savings':
      return '#0066A1';
    case 'Interest-Based':
      return '#28A745';
    case 'SB Package':
      return '#7952B3';
    default:
      return '#0066A1';
  }
};

export const usePackageQueries = () => {
  const { user } = useAuth();
  const [transformedPackages, setTransformedPackages] = useState<
    SavingsPackage[]
  >([]);

  // Fetch all packages
  const {
    data: packages,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userPackages', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return packagesApi.getAllPackages(user.id);
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!packages) return;

    const { dailySavings, sbPackages, ibPackages } = packages;

    // Transform Daily Savings packages
    const dsPackages: SavingsPackage[] = dailySavings.map(
      (pkg: DailySavingsPackage) => ({
        id: Number(pkg.id),
        title: pkg.target || 'Savings Goal',
        type: 'Daily Savings',
        icon: 'home',
        progress:
          pkg.targetAmount > 0
            ? Math.floor((pkg.totalContribution / pkg.targetAmount) * 100)
            : 0,
        current: pkg.totalContribution,
        target: pkg.targetAmount,
        color: getPackageColor('Daily Savings'),
        amountPerDay: pkg.amountPerDay,
        totalContribution: pkg.totalContribution,
      })
    );

    // Transform SB packages
    const sbMappedPackages: SavingsPackage[] = sbPackages.map(
      (pkg: SBPackage) => ({
        id: Number(pkg._id),
        title: pkg.product?.name || 'Product Goal',
        type: 'SB Package',
        icon: 'laptop',
        progress:
          pkg.targetAmount > 0
            ? Math.floor((pkg.totalContribution / pkg.targetAmount) * 100)
            : 0,
        current: pkg.totalContribution,
        target: pkg.targetAmount,
        color: getPackageColor('SB Package'),
        amountPerDay: 0, // SB packages don't have amountPerDay
        totalContribution: pkg.totalContribution,
      })
    );

    // For now, no IB packages, but we can prepare for them
    const ibMappedPackages: SavingsPackage[] = ibPackages.map(
      (pkg: IBPackage) => ({
        id: Number(pkg.id || pkg._id || '0'),
        title: pkg.name || 'Interest Savings',
        type: 'Interest-Based',
        icon: 'book-open',
        progress:
          pkg.targetAmount && pkg.targetAmount > 0
            ? Math.floor(
              ((pkg.totalContribution || pkg.principalAmount) / pkg.targetAmount) * 100
            )
            : 100, // Default to 100% if no target amount is set
        current: pkg.totalContribution || (pkg.principalAmount + pkg.accruedInterest),
        target: pkg.targetAmount || pkg.principalAmount,
        color: getPackageColor('Interest-Based'),
        amountPerDay: 0, // IB packages don't have amountPerDay
        totalContribution: pkg.totalContribution || pkg.principalAmount,
      })
    );

    // Combine all package types
    setTransformedPackages([
      ...dsPackages,
      ...sbMappedPackages,
      ...ibMappedPackages,
    ]);
  }, [packages]);

  const hasPackages = transformedPackages.length > 0;

  return {
    packages: transformedPackages,
    hasPackages,
    isLoading,
    isError,
    error,
    refetch,
  };
};
