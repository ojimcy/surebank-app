import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import packagesApi from '@/lib/api/packages';

// Unified package interface for the UI
interface UIPackage {
  id: string;
  title: string;
  type: 'Daily Savings' | 'Interest-Based' | 'SB Package';
  icon: string;
  progress: number;
  current: number;
  target: number;
  color: string;
  statusColor: string;
  status: string;
  accountNumber: string;
  lastContribution?: string;
  nextContribution?: string;
  interestRate?: string;
  maturityDate?: string;
  productImage?: string;
  startDate: string;
  endDate?: string;
  amountPerDay?: number;
}

// Available package types
const packageTypes = [
  {
    id: 'daily',
    title: 'DS',
    description:
      'Save regularly with flexible daily, weekly, or monthly deposits',
    icon: 'calendar',
    color: '#0066A1',
    cta: 'Start Saving',
    path: '/packages/new?type=daily',
  },
  {
    id: 'interest',
    title: 'IBS',
    description: 'Earn competitive interest rates on your locked savings',
    icon: 'trending-up',
    color: '#28A745',
    cta: 'Lock Funds',
    path: '/packages/new?type=interest',
  },
  {
    id: 'product',
    title: 'SB',
    description: 'Save towards specific products with SureBank packages',
    icon: 'target',
    color: '#7952B3',
    cta: 'Choose Product',
    path: '/packages/new?type=product',
  },
];

// Package type icons mapping
const pkgTypeIcons: Record<string, string> = {
  DS: '/icons/calendar.svg',
  IBS: '/icons/trending-up.svg',
  SB: '/icons/target.svg',
};

// Random images for packages by type
const packageImages = {
  DS: [
    'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1633158829875-e5316a358c6c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  ],
  IBS: [
    'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  ],
  SB: [
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  ],
};

// Target-specific images for common saving goals
const targetImages = {
  'School Fees':
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'House Rent':
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'Building Projects':
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'Shop Rent':
    'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  Donations:
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'Staff Salaries':
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  Car: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  Vacation:
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  Wedding:
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  Education:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  Healthcare:
    'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  Business:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
};

// Fallback images in case the above paths don't exist
const fallbackImages = {
  'Daily Savings':
    'https://images.unsplash.com/photo-1579621970590-9d624316904b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'Interest-Based':
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  'SB Package':
    'https://images.unsplash.com/photo-1607863680198-23d4b2565a5f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
};

// SB Package product placeholder image
const sbPackagePlaceholder =
  'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

const DefaultIcon = '/icons/package-default.svg';

// Helper function to get a random image for a package type
const getRandomPackageImage = (
  packageType: string,
  target?: string,
  productImage?: string
): string => {
  // If it's an SB Package with a product image, use that
  if (packageType === 'SB Package' && productImage) {
    return productImage;
  }

  // For SB Package without product image, use the placeholder
  if (packageType === 'SB Package') {
    return sbPackagePlaceholder;
  }

  // Try to find target-specific image
  if (target) {
    // Check for exact match
    if (targetImages[target as keyof typeof targetImages]) {
      return targetImages[target as keyof typeof targetImages];
    }

    // Check for partial matches in the target name
    const targetLower = target.toLowerCase();
    for (const [key, url] of Object.entries(targetImages)) {
      if (targetLower.includes(key.toLowerCase())) {
        return url;
      }
    }

    // Check for common keywords
    if (
      targetLower.includes('school') ||
      targetLower.includes('education') ||
      targetLower.includes('college') ||
      targetLower.includes('university')
    ) {
      return targetImages['Education'];
    }
    if (
      targetLower.includes('house') ||
      targetLower.includes('home') ||
      targetLower.includes('rent') ||
      targetLower.includes('apartment')
    ) {
      return targetImages['House Rent'];
    }
    if (
      targetLower.includes('car') ||
      targetLower.includes('vehicle') ||
      targetLower.includes('automobile')
    ) {
      return targetImages['Car'];
    }
    if (
      targetLower.includes('holiday') ||
      targetLower.includes('vacation') ||
      targetLower.includes('trip') ||
      targetLower.includes('travel')
    ) {
      return targetImages['Vacation'];
    }
    if (targetLower.includes('wedding') || targetLower.includes('marriage')) {
      return targetImages['Wedding'];
    }
    if (
      targetLower.includes('medical') ||
      targetLower.includes('health') ||
      targetLower.includes('hospital')
    ) {
      return targetImages['Healthcare'];
    }
    if (
      targetLower.includes('business') ||
      targetLower.includes('startup') ||
      targetLower.includes('enterprise') ||
      targetLower.includes('company')
    ) {
      return targetImages['Business'];
    }
    if (
      targetLower.includes('building') ||
      targetLower.includes('construction') ||
      targetLower.includes('project')
    ) {
      return targetImages['Building Projects'];
    }
    if (
      targetLower.includes('shop') ||
      targetLower.includes('store') ||
      targetLower.includes('retail')
    ) {
      return targetImages['Shop Rent'];
    }
    if (
      targetLower.includes('donate') ||
      targetLower.includes('charity') ||
      targetLower.includes('contribution')
    ) {
      return targetImages['Donations'];
    }
    if (
      targetLower.includes('staff') ||
      targetLower.includes('salary') ||
      targetLower.includes('wage') ||
      targetLower.includes('employee')
    ) {
      return targetImages['Staff Salaries'];
    }
  }

  // Otherwise, get a random image for this package type
  const images = packageImages[packageType as keyof typeof packageImages] || [];
  if (images.length > 0) {
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }

  // Fallback to unsplash images if no local images
  return (
    fallbackImages[packageType as keyof typeof fallbackImages] ||
    fallbackImages['Daily Savings']
  );
};

function PackageList() {
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'packages' | 'types'>('packages');
  const [filteredType, setFilteredType] = useState<string>('packages');
  const [packages, setPackages] = useState<UIPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = user?.id;

        if (!userId) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // Fetch all package types using the API service
        const { dailySavings, sbPackages, ibPackages } =
          await packagesApi.getAllPackages(userId);

        // Process DS packages
        const dsPackages = dailySavings.map((pkg) => ({
          id: pkg.id,
          title: pkg.target || 'Savings Goal',
          type: 'Daily Savings' as const,
          icon: 'home',
          progress:
            pkg.targetAmount > 0
              ? Math.floor((pkg.totalContribution / pkg.targetAmount) * 100)
              : 0,
          current: pkg.totalContribution,
          target: pkg.targetAmount,
          color: '#0066A1',
          statusColor: getStatusColor(pkg.status),
          status: formatStatus(pkg.status),
          accountNumber: pkg.accountNumber,
          lastContribution: formatDate(pkg.updatedAt),
          nextContribution: calculateNextContribution(pkg.amountPerDay),
          amountPerDay: pkg.amountPerDay,
          startDate: pkg.startDate,
          endDate: pkg.endDate,
          productImage: getRandomPackageImage('Daily Savings', pkg.target),
        }));

        // Process SB packages
        const sbPackagesProcessed = sbPackages.map((pkg) => ({
          id: pkg._id,
          title: pkg.product?.name || 'Product Package',
          type: 'SB Package' as const,
          icon: 'laptop',
          progress:
            pkg.targetAmount > 0
              ? Math.floor((pkg.totalContribution / pkg.targetAmount) * 100)
              : 0,
          current: pkg.totalContribution,
          target: pkg.targetAmount,
          color: '#7952B3',
          statusColor: getStatusColor(pkg.status),
          status: formatStatus(pkg.status),
          accountNumber: pkg.accountNumber,
          productImage:
            pkg.product?.images?.[0] ||
            getRandomPackageImage('SB Package', pkg.product?.name),
          lastContribution: 'Not available',
          nextContribution: 'Not available',
          startDate: pkg.startDate,
          endDate: pkg.endDate,
        }));

        // Process IB packages
        const ibPackagesProcessed = ibPackages.map((pkg) => {
          // Calculate time-based progress for IBS packages
          const calculateTimeProgress = (startDate: string | number, maturityDate: string | number): number => {
            const parseDate = (dateValue: string | number): Date => {
              if (typeof dateValue === 'string' && /^\d+$/.test(dateValue)) {
                const timestamp = parseInt(dateValue);
                return new Date(timestamp < 1000000000000 ? timestamp * 1000 : timestamp);
              }
              return new Date(dateValue);
            };

            const start = parseDate(startDate);
            const maturity = parseDate(maturityDate);
            const current = new Date();

            if (isNaN(start.getTime()) || isNaN(maturity.getTime())) {
              return 100; // Default if dates are invalid
            }

            const totalDuration = maturity.getTime() - start.getTime();
            const elapsedDuration = current.getTime() - start.getTime();

            // If package hasn't started yet
            if (elapsedDuration < 0) return 0;

            // If package has matured
            if (current >= maturity) return 100;

            // Calculate time-based progress
            if (totalDuration <= 0) return 100;

            const progress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
            return Math.floor(progress);
          };

          return {
            id: pkg.id || pkg._id,
            title: pkg.name || 'Interest Savings',
            type: 'Interest-Based' as const,
            icon: 'trending-up',
            progress: calculateTimeProgress(
              pkg.startDate || pkg.createdAt,
              pkg.maturityDate
            ),
            current: pkg.totalContribution || (pkg.principalAmount + pkg.accruedInterest),
            target: pkg.targetAmount || pkg.principalAmount,
            color: '#28A745',
            statusColor: getStatusColor(pkg.status),
            status: formatStatus(pkg.status),
            accountNumber: pkg.accountNumber || 'N/A',
            interestRate: `${pkg.interestRate}% p.a.`,
            maturityDate: formatDate(pkg.maturityDate),
            lastContribution: 'Not available',
            nextContribution: 'Not available',
            startDate: pkg.startDate || formatDate(pkg.createdAt),
            endDate: pkg.endDate || formatDate(pkg.maturityDate),
            productImage: getRandomPackageImage('Interest-Based'),
          };
        });

        // Combine all packages
        setPackages([
          ...dsPackages,
          ...sbPackagesProcessed,
          ...ibPackagesProcessed,
        ]);
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError('Failed to load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [user]);

  const toggleFabMenu = () => {
    setShowFabMenu(!showFabMenu);
  };

  // Helper functions
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'Active';
      case 'closed':
        return 'Closed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';

    try {
      // Handle numeric timestamps (milliseconds since epoch)
      const timestamp = parseInt(dateString);
      if (!isNaN(timestamp)) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-NG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }

      // Handle string dates
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const calculateNextContribution = (amountPerDay: number): string => {
    try {
      if (!amountPerDay || amountPerDay <= 0) {
        return 'Not scheduled';
      }

      // Calculate the next day's date
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Format the date
      const formattedDate = tomorrow.toLocaleDateString('en-NG', {
        month: 'short',
        day: 'numeric',
      });

      // Return formatted amount with next date
      return `₦${amountPerDay.toLocaleString()} due on ${formattedDate}`;
    } catch (error) {
      console.error('Error calculating next contribution:', error);
      return 'Next due date unavailable';
    }
  };

  // Filter packages by type if needed
  const filteredPackages =
    filteredType === 'all'
      ? packages
      : packages.filter((pkg) => {
        if (filteredType === 'daily') return pkg.type === 'Daily Savings';
        if (filteredType === 'interest') return pkg.type === 'Interest-Based';
        if (filteredType === 'sb') return pkg.type === 'SB Package';
        return true;
      });

  return (
    <div className="space-y-6 pb-20 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Packages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track your savings packages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="text-sm border border-gray-300 rounded-md p-1.5 bg-white"
            value={filteredType}
            onChange={(e) => setFilteredType(e.target.value)}
            disabled={loading}
          >
            <option value="all">All Types</option>
            <option value="daily">Daily Savings</option>
            <option value="interest">Interest-Based</option>
            <option value="sb">SB Package</option>
          </select>
          <button className="bg-gray-100 p-2 rounded-md" disabled={loading}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'packages'
            ? 'text-[#0066A1] border-b-2 border-[#0066A1]'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('packages')}
          disabled={loading}
        >
          My Packages
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${activeTab === 'types'
            ? 'text-[#0066A1] border-b-2 border-[#0066A1]'
            : 'text-gray-500 hover:text-gray-700'
            }`}
          onClick={() => setActiveTab('types')}
          disabled={loading}
        >
          Available Types
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
          <p>{error}</p>
          <button
            className="mt-2 text-sm font-medium underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && packages.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No packages found
          </h3>
          <p className="text-gray-500 mb-6">
            You haven't created any savings packages yet.
          </p>
          <button
            onClick={() => setShowFabMenu(true)}
            className="bg-[#0066A1] text-white px-4 py-2 rounded-md"
          >
            Create your first package
          </button>
        </div>
      )}

      {/* Available Package Types View */}
      {!loading && !error && activeTab === 'types' && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Available Package Types
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packageTypes.map((type) => (
              <motion.div
                key={type.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${type.color}20` }}
                    >
                      {type.icon === 'calendar' && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          style={{ color: type.color }}
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
                      )}

                      {type.icon === 'trending-up' && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          style={{ color: type.color }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                      )}

                      {type.icon === 'target' && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          style={{ color: type.color }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      )}
                    </div>
                    <h3
                      className="font-bold text-lg"
                      style={{ color: type.color }}
                    >
                      {type.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {type.description}
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link
                      to={type.path}
                      className="w-full flex items-center justify-center gap-2 text-white py-2 px-4 rounded-md text-sm font-medium transition-all"
                      style={{ backgroundColor: type.color }}
                    >
                      {type.cta}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* My Packages View */}
      {!loading &&
        !error &&
        packages.length > 0 &&
        activeTab === 'packages' && (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPackages.length > 0 ? (
              filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => {
                    navigate(`/packages/${pkg.id}`);
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
                        {pkg.productImage ? (
                          <img
                            src={pkg.productImage}
                            alt={pkg.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If image fails to load, use the package type icon
                              const imgEl = e.target as HTMLImageElement;
                              imgEl.onerror = null;
                              imgEl.src = pkgTypeIcons[pkg.type] || DefaultIcon;
                              imgEl.className = 'w-8 h-8';
                              imgEl.style.objectFit = 'contain';

                              // Also update parent div styling
                              const parent = imgEl.parentElement;
                              if (parent) {
                                parent.className =
                                  'w-16 h-16 rounded-lg flex items-center justify-center bg-primary/10';
                              }
                            }}
                          />
                        ) : (
                          <img
                            src={pkgTypeIcons[pkg.type] || DefaultIcon}
                            alt={pkg.type}
                            className="w-8 h-8"
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-semibold text-base">{pkg.title}</h3>
                        <p className="text-sm text-gray-600">
                          {pkg.type}
                          {pkg.type === 'Daily Savings' &&
                            pkg.nextContribution && (
                              <span className="ml-1">
                                ({pkg.nextContribution})
                              </span>
                            )}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        pkg.status
                      )}`}
                    >
                      {formatStatus(pkg.status)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{pkg.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${Math.min(100, pkg.progress)}%`,
                            backgroundColor: pkg.color,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Amount:</span>
                      <span className="font-medium">
                        ₦{pkg.target?.toLocaleString() || '0'}
                      </span>
                    </div>
                    {pkg.type === 'Daily Savings' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">
                          Daily Amount:
                        </span>
                        <span className="font-medium">
                          ₦{pkg.current?.toLocaleString() || '0'}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Start Date:</span>
                      <span className="font-medium">
                        {formatDate(pkg.startDate)}
                      </span>
                    </div>
                    {pkg.type === 'SB Package' && pkg.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">End Date:</span>
                        <span className="font-medium">
                          {formatDate(pkg.endDate)}
                        </span>
                      </div>
                    )}
                    {pkg.type === 'Daily Savings' && pkg.nextContribution && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">
                          Next Contribution:
                        </span>
                        <span className="font-medium text-primary">
                          {pkg.nextContribution}
                        </span>
                      </div>
                    )}
                    {pkg.type === 'Interest-Based' && pkg.interestRate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">
                          Interest Rate:
                        </span>
                        <span className="font-medium">{pkg.interestRate}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-gray-500">
                  No packages match your filter. Try a different filter or
                  create a new package.
                </p>
              </div>
            )}
          </div>
        )}

      {/* Floating Action Button - Positioned higher to avoid footer overlap */}
      <div className="fixed bottom-32 right-6 z-50">
        <div className="relative">
          <AnimatePresence>
            {showFabMenu && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-48"
              >
                <Link
                  to="/packages/new?type=daily"
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-blue-600"
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
                  </div>
                  <span className="text-sm font-medium">Daily Savings</span>
                </Link>
                <Link
                  to="/packages/new?type=interest"
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Interest Savings</span>
                </Link>
                <Link
                  to="/packages/new?type=product"
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Target Savings</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={toggleFabMenu}
            className="bg-[#0066A1] text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: showFabMenu ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default PackageList;
