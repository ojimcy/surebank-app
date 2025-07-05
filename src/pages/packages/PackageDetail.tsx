import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import packagesApi from '@/lib/api/packages';
import { DSPackageData, SBPackageData, IBSPackageData, PackageUtilities, Contribution } from '@/components/packages/shared/types';
import { DSPackageDetail } from './DSPackageDetail';
import { SBPackageDetail } from './SBPackageDetail';
import { IBSPackageDetail } from './IBSPackageDetail';

function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [packageData, setPackageData] = useState<DSPackageData | SBPackageData | IBSPackageData | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utility functions
  const utilities: PackageUtilities = {
    formatCurrency: (amount: number) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
      }).format(amount);
    },
    formatDate: (date: string) => {
      return new Date(date).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    },
    formatStatus: (status: string) => {
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    },
  };

  // Helper functions
  const safeParseNumber = (value: string | number | null | undefined): number => {
    if (value === null || value === undefined) return 0;

    // Handle string values
    if (typeof value === 'string') {
      // Remove any non-numeric characters except decimal point and negative sign
      const cleaned = value.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }

    // Handle numeric values
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }

    return 0;
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRandomPackageImage = (packageType: string): string => {
    const fallbackImages = {
      'Daily Savings': 'https://images.unsplash.com/photo-1579621970590-9d624316904b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'Interest-Based': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'SB Package': 'https://images.unsplash.com/photo-1607863680198-23d4b2565a5f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    };
    return fallbackImages[packageType as keyof typeof fallbackImages] || fallbackImages['Daily Savings'];
  };

  // Generate mock contributions for demo purposes
  const generateMockContributions = (totalAmount: number): Contribution[] => {
    const safeTotal = safeParseNumber(totalAmount);
    if (safeTotal <= 0) return [];

    const numContributions = Math.floor(Math.random() * 6) + 3;
    const mockContributions: Contribution[] = [];
    const avgContribution = safeTotal / numContributions;

    for (let i = 0; i < numContributions; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));

      mockContributions.push({
        id: `contrib-${i}`,
        amount: Math.round(avgContribution * (0.75 + Math.random() * 0.5)),
        date: date.toISOString(),
        status: Math.random() > 0.1 ? 'completed' : 'pending',
      });
    }

    return mockContributions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  useEffect(() => {
    if (!id || !user?.id) {
      setError('Invalid package ID or user not authenticated');
      setLoading(false);
      return;
    }

    const fetchPackageDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const { dailySavings, sbPackages, ibPackages } = await packagesApi.getAllPackages(user.id);

        // Check in DS packages
        const dsPackage = dailySavings.find((pkg) => pkg.id === id);
        if (dsPackage) {
          const totalContribution = safeParseNumber(dsPackage.totalContribution);
          const targetAmount = safeParseNumber(dsPackage.targetAmount);
          const amountPerDay = safeParseNumber(dsPackage.amountPerDay);

          const packageData: DSPackageData = {
            id: dsPackage.id,
            title: dsPackage.target || 'Savings Goal',
            type: 'Daily Savings',
            accountNumber: dsPackage.accountNumber,
            status: utilities.formatStatus(dsPackage.status),
            statusColor: getStatusColor(dsPackage.status),
            color: '#0066A1',
            startDate: dsPackage.startDate,
            endDate: dsPackage.endDate,
            productImage: getRandomPackageImage('Daily Savings'),
            totalContribution,
            progress: targetAmount > 0 ? Math.floor((totalContribution / targetAmount) * 100) : 0,
            current: totalContribution,
            target: targetAmount,
            amountPerDay,
            nextContribution: 'Tomorrow',
            lastContribution: utilities.formatDate(dsPackage.updatedAt),
          };

          setPackageData(packageData);
          setContributions(generateMockContributions(totalContribution));
          setLoading(false);
          return;
        }

        // Check in SB packages
        const sbPackage = sbPackages.find((pkg) => pkg._id === id);
        if (sbPackage) {
          const totalContribution = safeParseNumber(sbPackage.totalContribution);
          const targetAmount = safeParseNumber(sbPackage.targetAmount);

          const packageData: SBPackageData = {
            id: sbPackage._id,
            title: sbPackage.product?.name || 'Product Package',
            type: 'SB Package',
            accountNumber: sbPackage.accountNumber || 'N/A',
            status: utilities.formatStatus(sbPackage.status),
            statusColor: getStatusColor(sbPackage.status),
            color: '#7952B3',
            startDate: sbPackage.startDate,
            endDate: sbPackage.endDate,
            productImage: sbPackage.product?.images?.[0] || getRandomPackageImage('SB Package'),
            totalContribution,
            progress: targetAmount > 0 ? Math.floor((totalContribution / targetAmount) * 100) : 0,
            current: totalContribution,
            target: targetAmount,
            productName: sbPackage.product?.name,
            productPrice: targetAmount,
          };

          setPackageData(packageData);
          setContributions(generateMockContributions(totalContribution));
          setLoading(false);
          return;
        }

        // Check in IB packages
        const ibPackage = ibPackages.find((pkg) => pkg.id === id || pkg._id === id);
        if (ibPackage) {
          // Use API data directly - don't recalculate what the backend already calculated
          const principalAmount = safeParseNumber(ibPackage.principalAmount) || 0;
          const interestRate = safeParseNumber(ibPackage.interestRate) || 0;
          const lockPeriod = safeParseNumber(ibPackage.lockPeriod) || 0;

          // Use the API's calculated values directly
          const accruedInterest = safeParseNumber(ibPackage.interestAccrued || ibPackage.accruedInterest) || 0;
          const currentBalance = safeParseNumber(ibPackage.currentBalance) || principalAmount;





          // Calculate progress based on time elapsed (not funding)
          const calculateTimeProgress = (): number => {
            // Handle timestamp conversion properly
            const parseDate = (dateValue: string | number | null | undefined): Date => {
              if (!dateValue) return new Date();

              // If it's a timestamp (number as string)
              if (typeof dateValue === 'string' && /^\d+$/.test(dateValue)) {
                const timestamp = parseInt(dateValue);
                return new Date(timestamp < 1000000000000 ? timestamp * 1000 : timestamp);
              }

              // If it's already a date string
              return new Date(dateValue);
            };

            const startDate = parseDate(ibPackage.startDate || ibPackage.createdAt);
            const maturityDate = parseDate(ibPackage.maturityDate);
            const currentDate = new Date();



            if (isNaN(startDate.getTime()) || isNaN(maturityDate.getTime())) {
              return 100; // Default to 100% if dates are invalid
            }

            const totalDuration = maturityDate.getTime() - startDate.getTime();
            const elapsedDuration = currentDate.getTime() - startDate.getTime();

            // If package hasn't started yet
            if (elapsedDuration < 0) return 0;

            // If package has matured
            if (currentDate >= maturityDate) {
              return 100;
            }

            // Calculate time-based progress
            if (totalDuration <= 0) return 100;

            const progress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
            return Math.floor(progress);
          };

          // Handle dates properly
          const formatDateSafely = (dateValue: string | number | null | undefined): string => {
            if (!dateValue) return new Date().toISOString();

            // If it's a timestamp (number as string)
            if (typeof dateValue === 'string' && /^\d+$/.test(dateValue)) {
              const timestamp = parseInt(dateValue);
              return new Date(timestamp < 1000000000000 ? timestamp * 1000 : timestamp).toISOString();
            }

            // If it's already a valid date string
            const date = new Date(dateValue);
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
          };

          const packageData: IBSPackageData = {
            id: ibPackage.id || ibPackage._id,
            title: ibPackage.name || 'Interest Savings',
            type: 'Interest-Based',
            accountNumber: ibPackage.accountNumber || 'N/A',
            status: utilities.formatStatus(ibPackage.status),
            statusColor: getStatusColor(ibPackage.status),
            color: '#28A745',
            startDate: formatDateSafely(ibPackage.startDate || ibPackage.createdAt),
            endDate: formatDateSafely(ibPackage.endDate || ibPackage.maturityDate),
            productImage: getRandomPackageImage('Interest-Based'),
            totalContribution: currentBalance,
            progress: calculateTimeProgress(),
            current: currentBalance,
            target: principalAmount,
            interestRate: interestRate > 0 ? `${interestRate}% p.a.` : 'N/A',
            maturityDate: formatDateSafely(ibPackage.maturityDate),
            accruedInterest,
            principalAmount,
            lockPeriod,
            compoundingFrequency: ibPackage.compoundingFrequency,
            daysToMaturity: Math.max(0, Math.ceil((new Date(ibPackage.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))),
          };

          setPackageData(packageData);
          setLoading(false);
          return;
        }

        // If we get here, package wasn't found
        setError('Package not found');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching package details:', err);
        setError('Failed to load package details. Please try again later.');
        setLoading(false);
      }
    };

    fetchPackageDetail();
  }, [id, user]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <button
            className="mt-2 text-sm font-medium underline"
            onClick={() => navigate('/packages')}
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  // No package data
  if (!packageData) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500">Package not found</p>
          <button
            className="mt-2 text-sm font-medium underline text-[#0066A1]"
            onClick={() => navigate('/packages')}
          >
            Back to Packages
          </button>
        </div>
      </div>
    );
  }

  // Render appropriate detail component based on package type
  switch (packageData.type) {
    case 'Daily Savings':
      return (
        <DSPackageDetail
          packageData={packageData as DSPackageData}
          contributions={contributions}
          utilities={utilities}
        />
      );
    case 'SB Package':
      return (
        <SBPackageDetail
          packageData={packageData as SBPackageData}
          contributions={contributions}
          utilities={utilities}
        />
      );
    case 'Interest-Based':
      return (
        <IBSPackageDetail
          packageData={packageData as IBSPackageData}
          utilities={utilities}
        />
      );
    default:
      return (
        <div className="p-4 max-w-3xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Unknown package type</p>
            <button
              className="mt-2 text-sm font-medium underline text-[#0066A1]"
              onClick={() => navigate('/packages')}
            >
              Back to Packages
            </button>
          </div>
        </div>
      );
  }
}

export default PackageDetail;
