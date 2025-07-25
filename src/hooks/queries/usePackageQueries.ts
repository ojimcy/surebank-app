import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import packagesApi, {
  DailySavingsPackage,
  SBPackage,
  IBPackage,
} from '@/lib/api/packages';
import { SavingsPackage } from '@/components/dashboard/types';

// Helper function to map package type to color - memoized with a simple object lookup
const packageColors = {
  'Daily Savings': '#0066A1',
  'Interest-Based': '#28A745',
  'SB Package': '#7952B3',
};

// Define the packages data structure
interface PackagesData {
  dailySavings: DailySavingsPackage[];
  sbPackages: SBPackage[];
  ibPackages: IBPackage[];
}

export const usePackageQueries = () => {
  const { user } = useAuth();

  // Fetch all packages with proper caching
  const {
    data: packages,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PackagesData>({
    queryKey: ['userPackages', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      return packagesApi.getAllPackages(user.id);
    },
    enabled: !!user?.id,
    // Add caching and refetch strategies
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
  });

  // Memoize the getPackageColor function
  const getPackageColor = useCallback((type: string): string => {
    return packageColors[type as keyof typeof packageColors] || '#0066A1';
  }, []);

  // Memoize the transformed packages to prevent unnecessary recalculations
  const transformedPackages = useMemo(() => {
    if (!packages) return [];

    const { dailySavings = [], sbPackages = [], ibPackages = [] } = packages;

    // Transform Daily Savings packages
    const dsPackages: SavingsPackage[] = dailySavings.map(
      (pkg: DailySavingsPackage) => ({
        id: pkg.id,
        title: pkg.target || 'Savings Goal',
        type: 'Daily Savings',
        icon: 'home',
        progress: Math.floor((pkg.totalCount / 30) * 100), // DS progress based on days (totalCount/30)
        current: pkg.totalContribution,
        target: pkg.targetAmount,
        color: getPackageColor('Daily Savings'),
        amountPerDay: pkg.amountPerDay,
        totalContribution: pkg.totalContribution,
        startDate: pkg.startDate,
        status: pkg.status, // Add status field for filtering
        totalCount: pkg.totalCount, // Add totalCount for DS package validation
      })
    );

    // Transform SB packages
    const sbMappedPackages: SavingsPackage[] = sbPackages.map(
      (pkg: SBPackage) => ({
        id: pkg._id,
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
        status: pkg.status, // Add status field for consistency
      })
    );

    // For Interest-Based packages
    const ibMappedPackages: SavingsPackage[] = ibPackages.map(
      (pkg: IBPackage) => {
        // Calculate time-based progress
        const start = new Date(pkg.startDate || pkg.createdAt).getTime();
        const end = new Date(pkg.maturityDate).getTime();
        const now = Date.now();

        let timeProgress = 0;
        if (now >= start && now <= end) {
          const totalDuration = end - start;
          const elapsed = now - start;
          timeProgress = Math.min(
            100,
            Math.floor((elapsed / totalDuration) * 100)
          );
        } else if (now > end) {
          timeProgress = 100;
        }

        return {
          id: pkg._id,
          title: pkg.name || 'Interest Savings',
          type: 'Interest-Based',
          icon: 'trending-up',
          progress: timeProgress,
          current: pkg.currentBalance || 0,
          target: 0, // no applicable
          color: getPackageColor('Interest-Based'),
          amountPerDay: 0, // IB packages don't have amountPerDay
          totalContribution: 0, // no applicable
          startDate: pkg.startDate || pkg.createdAt,
          endDate: pkg.maturityDate,
          maturityDate: pkg.maturityDate,
          interestRate: `${pkg.interestRate}% p.a.`,
          lockPeriod: pkg.lockPeriod,
          interestAccrued: pkg.interestAccrued,
          status: pkg.status,
          currentBalance: pkg.currentBalance || 0,
        };
      }
    );

    // Combine all package types
    return [...dsPackages, ...sbMappedPackages, ...ibMappedPackages];
  }, [packages, getPackageColor]);

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
