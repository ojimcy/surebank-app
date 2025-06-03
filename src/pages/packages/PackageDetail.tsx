import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toast-provider';
import packagesApi, {
  DailySavingsPackage,
  SBPackage,
  IBPackage,
  PackageContribution,
} from '@/lib/api/packages';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { PackageHeader } from '@/components/packages/PackageHeader';
import { PackageOverview } from '@/components/packages/PackageOverview';
import { PackageActions } from '@/components/packages/PackageActions';
import { ContributionTimeline } from '@/components/packages/ContributionTimeline';
import { PackageDetailsAccordion } from '@/components/packages/PackageDetailsAccordion';
// import { ChangeProductModal } from '@/components/packages/ChangeProductModal';
import { formatCurrency, formatDateTime } from '@/lib/utils';

// Extended API interfaces with additional fields
interface ExtendedDailySavingsPackage extends DailySavingsPackage {
  withdrawalRequests?: WithdrawalRequest[];
  paymentTransactions?: PaymentTransaction[];
  deductionCount?: number;
  totalCount?: number;
  hasBeenCharged?: boolean;
  totalCharge?: number;
}

interface ExtendedSBPackage extends SBPackage {
  withdrawalRequests?: WithdrawalRequest[];
  paymentTransactions?: PaymentTransaction[];
  product?: {
    id: string;
    name: string;
    images?: string[];
    description?: string;
    costPrice?: number;
    sellingPrice?: number;
    discount?: number;
    quantity?: number;
  };
}

interface ExtendedIBPackage extends Omit<IBPackage, 'currentBalance'> {
  currentBalance?: number;
}

// Unified package interface for the UI
interface UIPackage {
  id: string;
  title: string;
  type: 'Daily Savings' | 'Interest-Based' | 'SB Package';
  icon: string;
  progress: number;
  current: number;
  target: number;
  principalAmount: number;
  color: string;
  statusColor: string;
  product?: {
    id: string;
    name: string;
    images?: string[];
    description?: string;
    costPrice?: number;
    sellingPrice?: number;
    discount?: number;
    quantity?: number;
  };
  status: string;
  accountNumber: string;
  lastContribution?: string;
  nextContribution?: string;
  interestRate?: string;
  maturityDate?: string;
  productImage?: string;
  totalContribution: number;
  amountPerDay?: number;
  startDate: string;
  endDate?: string;
  // Add IBS-specific fields
  compoundingFrequency?: string;
  lockPeriod?: number;
  interestAccrued?: number;
  earlyWithdrawalPenalty?: number;
  estimatedEarnings?: number;
  currentBalance?: number;
  withdrawalRequests?: WithdrawalRequest[];
  paymentTransactions?: PaymentTransaction[];
  // Add SB Package specific fields
  productDetails?: {
    id?: string;
    name: string;
    description: string;
    costPrice: number;
    sellingPrice: number;
    discount: number;
    quantity: number;
  };
  // Add Daily Savings specific fields
  deductionCount?: number;
  totalCount?: number;
  hasBeenCharged?: boolean;
  totalCharge?: number;
}

// Contribution interface
interface Contribution {
  id: string;
  amount: number;
  date: string;
  status: string;
}

// Withdrawal request interface
interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  date: string;
}

// Payment transaction interface
interface PaymentTransaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
}

// Get random image based on package type
const getRandomPackageImage = (
  packageType: string,
  productImage?: string
): string => {
  // Default fallback images by package type
  const fallbackImages = {
    'Daily Savings':
      'https://images.unsplash.com/photo-1579621970590-9d624316904b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'Interest-Based':
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    'SB Package':
      'https://images.unsplash.com/photo-1607863680198-23d4b2565a5f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
  };

  return (
    productImage ||
    fallbackImages[packageType as keyof typeof fallbackImages] ||
    fallbackImages['Daily Savings']
  );
};

// Convert API contribution data to UI contribution format
const mapApiContributionsToUi = (apiContributions: PackageContribution[]): Contribution[] => {
  return apiContributions.map(contribution => ({
    id: contribution.id,
    amount: contribution.amount,
    date: new Date(contribution.date).toISOString(),
    status: 'completed', // Assuming all API contributions are completed
  }));
};

function PackageDetail() {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [packageData, setPackageData] = useState<UIPackage | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [allContributions, setAllContributions] = useState<Contribution[]>([]);
  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [showAllContributions, setShowAllContributions] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  // const [showChangeProductDialog, setShowChangeProductDialog] = useState(false);
  // Buy dialog removed as requested - now navigating directly to product detail page
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Format status
  const formatStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'Active';
      case 'closed':
        return 'Closed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return formatDateTime(dateString);
  };

  // Handle view all contributions
  const handleViewAllContributions = async () => {
    if (!id) return;

    if (!showAllContributions) {
      // Fetch all contributions if we don't have them yet
      if (allContributions.length === 0) {
        await fetchContributions(id);
      }
      setShowAllContributions(true);
    } else {
      setShowAllContributions(false);
    }
  };

  // Fetch contributions for a package
  const fetchContributions = async (packageId: string, limit?: number) => {
    if (packageData?.type === 'Interest-Based') return;
    try {
      setContributionsLoading(true);
      const contributionsData = await packagesApi.getPackageContributions(packageId, limit);
      const mappedContributions = mapApiContributionsToUi(contributionsData);

      if (limit) {
        setContributions(mappedContributions);
      } else {
        setAllContributions(mappedContributions);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load contributions',
        variant: 'destructive',
      });
    } finally {
      setContributionsLoading(false);
    }
  };

  // Fetch package details and contributions
  const fetchPackageDetail = async () => {
    if (!id || !user?.id) return;
    
    setLoading(true);
    try {
      // Fetch all package types to find the matching one
      const { dailySavings, sbPackages, ibPackages } = await packagesApi.getAllPackages(user.id);

        // Find the package in each type
        let foundPackage = null;

        // Check Daily Savings
        const dsPackage = dailySavings.find((pkg) => pkg.id === id) as ExtendedDailySavingsPackage;
        if (dsPackage) {
          foundPackage = {
            id: dsPackage.id,
            title: dsPackage.target || 'Savings Goal',
            type: 'Daily Savings' as const,
            icon: 'home',
            progress: dsPackage.totalCount ? Math.floor((dsPackage.totalCount / 31) * 100) : 0,
            current: dsPackage.totalContribution,
            target: dsPackage.targetAmount,
            color: '#0066A1',
            statusColor: getStatusColor(dsPackage.status),
            status: dsPackage.status,
            accountNumber: dsPackage.accountNumber,
            lastContribution: dsPackage.updatedAt,
            nextContribution: calculateNextContribution(dsPackage.amountPerDay),
            amountPerDay: dsPackage.amountPerDay,
            startDate: dsPackage.startDate || dsPackage.createdAt,
            endDate: dsPackage.endDate ? dsPackage.endDate : undefined,
            totalContribution: dsPackage.totalContribution,
            productImage: getRandomPackageImage('Daily Savings', dsPackage.target),
            withdrawalRequests: dsPackage.withdrawalRequests || [],
            paymentTransactions: dsPackage.paymentTransactions || [],
            deductionCount: dsPackage.deductionCount || 0,
            totalCount: dsPackage.totalCount || 0,
            hasBeenCharged: dsPackage.hasBeenCharged || false,
            totalCharge: dsPackage.totalCharge || 0,
          };
        }

        // Check SB Packages
        const sbPackage = sbPackages.find((pkg) => pkg._id === id) as ExtendedSBPackage;
        if (sbPackage) {
          foundPackage = {
            id: sbPackage._id,
            title: sbPackage.product?.name || 'Product Package',
            type: 'SB Package' as const,
            icon: 'laptop',
            progress:
              sbPackage.targetAmount > 0
                ? Math.floor((sbPackage.totalContribution / sbPackage.targetAmount) * 100)
                : 0,
            current: sbPackage.totalContribution,
            target: sbPackage.targetAmount,
            color: '#7952B3',
            statusColor: getStatusColor(sbPackage.status),
            status: sbPackage.status,
            accountNumber: sbPackage.accountNumber,
            productImage:
              sbPackage.product?.images?.[0] ||
              getRandomPackageImage('SB Package', sbPackage.product?.name),
            lastContribution: 'Not available',
            nextContribution: 'Not available',
            startDate: sbPackage.startDate,
            totalContribution: sbPackage.totalContribution,
            withdrawalRequests: sbPackage.withdrawalRequests || [],
            paymentTransactions: sbPackage.paymentTransactions || [],
            productDetails: {
              name: sbPackage.product?.name || '',
              description: sbPackage.product?.description || '',
              costPrice: sbPackage.product?.costPrice || 0,
              sellingPrice: sbPackage.product?.sellingPrice || 0,
              discount: sbPackage.product?.discount || 0,
              quantity: sbPackage.product?.quantity || 0,
            },
          };
        }

        // Check Interest-Based Packages
        const ibPackage = ibPackages.find((pkg) => pkg._id === id) as ExtendedIBPackage;
        if (ibPackage) {
          const timeProgress = calculateTimeProgress(ibPackage.startDate, ibPackage.maturityDate);
          foundPackage = {
            id: ibPackage._id,
            title: ibPackage.name || 'Interest Savings',
            type: 'Interest-Based' as const,
            icon: 'trending-up',
            progress: timeProgress,
            current: ibPackage.currentBalance,
            principalAmount: ibPackage.principalAmount,
            target: ibPackage.principalAmount,
            color: '#28A745',
            statusColor: getStatusColor(ibPackage.status),
            status: ibPackage.status,
            accountNumber: ibPackage.accountNumber,
            interestRate: `${ibPackage.interestRate}% p.a.`,
            maturityDate: ibPackage.maturityDate,
            lastContribution: 'Not available',
            nextContribution: 'Not available',
            startDate: ibPackage.startDate,
            endDate: ibPackage.endDate,
            productImage: getRandomPackageImage('Interest-Based'),
            totalContribution: ibPackage.principalAmount,
            compoundingFrequency: ibPackage.compoundingFrequency,
            lockPeriod: ibPackage.lockPeriod || 0,
            interestAccrued: ibPackage.interestAccrued,
            earlyWithdrawalPenalty: ibPackage.earlyWithdrawalPenalty || 0,
            currentBalance:
              ibPackage.currentBalance || ibPackage.principalAmount,
            estimatedEarnings: ibPackage.interestAccrued,
          };
        }

        if (!foundPackage) {
          throw new Error('Package not found');
        }

        setPackageData(foundPackage as UIPackage);

        // Fetch real contribution data
        await fetchContributions(id, 7); // Fetch latest 7 contributions
      } catch (error) {
        console.error('Error fetching package details:', error);
        addToast({
          title: 'Error',
          description: 'Failed to load package details',
          variant: 'destructive',
        });
        navigate('/packages');
      } finally {
        setLoading(false);
      }
    };
  
  useEffect(() => {
    // if (!id || !type || !user?.id) {
    //   addToast({
    //     title: 'Error',
    //     description: 'Missing required parameters',
    //     variant: 'destructive',
    //   });
    //   navigate('/packages');
    //   return;
    // }

    // Fetch package details when component mounts
    fetchPackageDetail();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type, user?.id, navigate, addToast]);

  // Helper function to calculate time-based progress for IB packages
  const calculateTimeProgress = (
    startDate: string | number,
    maturityDate: string | number
  ): number => {
    try {
      // Convert to numbers if they're strings
      const start =
        typeof startDate === 'string' ? parseInt(startDate) : startDate;
      const end =
        typeof maturityDate === 'string'
          ? parseInt(maturityDate)
          : maturityDate;
      const now = Date.now();

      // Validate timestamps
      if (isNaN(start) || isNaN(end)) {
        console.error('Invalid timestamps:', { start, end });
        return 0;
      }

      if (now < start) return 0;
      if (now > end) return 100;

      const totalDuration = end - start;
      if (totalDuration <= 0) {
        console.error('Invalid duration:', { start, end, totalDuration });
        return 0;
      }

      const elapsed = now - start;
      const progress = Math.min(
        100,
        Math.floor((elapsed / totalDuration) * 100)
      );

      return progress;
    } catch (error) {
      console.error('Error calculating time progress:', error);
      return 0;
    }
  };

  // Calculate next contribution date
  const calculateNextContribution = (amountPerDay: number): string => {
    if (!amountPerDay || amountPerDay <= 0) {
      return 'Not scheduled';
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `₦${amountPerDay.toLocaleString()} due on ${tomorrow.toLocaleDateString(
      'en-NG',
      {
        month: 'short',
        day: 'numeric',
      }
    )}`;
  };

  // Handle adding a contribution
  const handleAddContribution = () => {
    // Would normally make API call here
    addToast({
      title: 'Contribution added',
      description: 'Your contribution has been successfully added.',
      variant: 'success',
    });
    setShowAddDialog(false);
  };

  // Handle editing package
  const handleEditPackage = () => {
    // Would normally make API call here
    addToast({
      title: 'Package updated',
      description: 'Your package has been successfully updated.',
      variant: 'success',
    });
    setShowEditDialog(false);
  };

  // Handle closing package
  const handleClosePackage = () => {
    // Would normally make API call here
    addToast({
      title: 'Package closed',
      description: 'Your package has been successfully closed.',
      variant: 'destructive',
    });
    setShowCloseDialog(false);
    navigate('/packages');
  };

  // Navigate to change product page
  const handleChangeProduct = () => {
    navigate('/packages/change-product', {
      state: {
        packageId: packageData?.id,
        currentProduct: packageData?.productDetails
      }
    });
  };

  // Navigate directly to product detail page
  const handleBuyProduct = () => {
    // Navigate to product detail page with the package ID
    if (packageData && packageData.type === 'SB Package' && packageData.productDetails && id) {
      navigate(`/products/${packageData.productDetails.id}/${id}`);
    } else {
      addToast({
        title: 'Product not found',
        description: 'This package does not have a product associated with it.',
        variant: 'destructive',
      });
    }
  };

  // Handle withdraw
  const handleWithdraw = () => {
    addToast({
      title: 'Withdrawal initiated',
      description: 'Your withdrawal has been initiated.',
      variant: 'success',
    });
    setShowWithdrawDialog(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
          <p>Package not found</p>
          <button
            className="mt-2 text-sm font-medium underline"
            onClick={() => navigate('/packages')}
          >
            Return to packages
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Package Header */}
      <PackageHeader
        title={packageData.title}
        type={packageData.type}
        status={packageData.status}
        statusColor={packageData.statusColor}
        color={packageData.color}
      />

      {/* Package Overview */}
      <PackageOverview
        current={packageData.current}
        target={packageData.target}
        principalAmount={packageData.principalAmount}
        progress={packageData.progress}
        color={packageData.color}
        startDate={packageData.startDate}
        endDate={packageData.endDate}
        interestRate={packageData.interestRate}
        maturityDate={packageData.maturityDate}
        nextContribution={packageData.nextContribution}
        productImage={packageData.productImage}
        type={packageData.type}
        totalContribution={packageData.totalContribution}
        amountPerDay={packageData.amountPerDay || 0}
        formatCurrency={formatCurrency}
        // Pass IBS-specific fields
        compoundingFrequency={packageData.compoundingFrequency}
        lockPeriod={packageData.lockPeriod}
        interestAccrued={packageData.interestAccrued}
        earlyWithdrawalPenalty={packageData.earlyWithdrawalPenalty}
        estimatedEarnings={packageData.estimatedEarnings}
      />

      {/* Action Buttons */}
      <PackageActions
        type={packageData.type}
        color={packageData.color}
        packageId={packageData.id}
        onEditPackage={() => setShowEditDialog(true)}
        onClosePackage={() => setShowCloseDialog(true)}
        onBuyProduct={handleBuyProduct}
        onChangeProduct={handleChangeProduct}
        hasMetTarget={
          packageData.type === 'SB Package'
            && packageData.totalContribution >= packageData.target
        }
      />

      {/* ... */}
      {/* Contributions Timeline */}
      {
        packageData.type !== 'Interest-Based' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Contribution History</h3>
              <button
            onClick={handleViewAllContributions}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            disabled={contributionsLoading}
          >
            {contributionsLoading ? 'Loading...' : showAllContributions ? 'Show Recent' : 'View All'}
          </button>
        </div>
        {contributionsLoading ? (
          <div className="text-center py-6 text-gray-500">Loading contributions...</div>
        ) : (
          <ContributionTimeline
            contributions={showAllContributions ? allContributions : contributions}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            formatStatus={formatStatus}
          />
        )}
      </div>
    )
      }

      {/* Package Details Accordion */}
      <PackageDetailsAccordion
        type={packageData.type}
        status={packageData.status}
        startDate={packageData.startDate}
        formatStatus={formatStatus}
        // Daily Savings specific props
        totalCount={
          packageData.type === 'Daily Savings'
            ? packageData.totalCount
            : undefined
        }
        amountPerDay={
          packageData.type === 'Daily Savings'
            ? packageData.amountPerDay
            : undefined
        }
        // SB Package specific props
        productDetails={
          packageData.type === 'SB Package'
            ? packageData.productDetails
            : undefined
        }
        totalContribution={
          packageData.type === 'SB Package'
            ? packageData.totalContribution
            : undefined
        }
        remainingBalance={
          packageData.type === 'SB Package'
            ? packageData.target - packageData.totalContribution
            : undefined
        }
        // IBS specific props
        name={
          packageData.type === 'Interest-Based' ? packageData.title : undefined
        }
        principalAmount={
          packageData.type === 'Interest-Based'
            ? packageData.principalAmount
            : undefined
        }
        currentBalance={
          packageData.type === 'Interest-Based'
            ? packageData.currentBalance
            : undefined
        }
        maturityDate={
          packageData.type === 'Interest-Based'
            ? packageData.maturityDate
            : undefined
        }
        lockPeriod={
          packageData.type === 'Interest-Based'
            ? packageData.lockPeriod
            : undefined
        }
        interestRate={
          packageData.type === 'Interest-Based'
            ? packageData.interestRate
            : undefined
        }
        interestAccrued={
          packageData.type === 'Interest-Based'
            ? packageData.interestAccrued
            : undefined
        }
      />

      {/* Dialogs */}
      <ConfirmationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title="Add Contribution"
        description="Add a contribution to this package."
        confirmText="Add"
        onConfirm={handleAddContribution}
      />

      <ConfirmationDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title="Edit Package"
        description="Edit this package details."
        confirmText="Save Changes"
        onConfirm={handleEditPackage}
      />

      <ConfirmationDialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        title="Close Package"
        description="Are you sure you want to close this package? This action cannot be undone."
        confirmText="Close Package"
        destructive
        onConfirm={handleClosePackage}
      />



      {/* Buy Product dialog removed as requested */}

      <ConfirmationDialog
        open={showWithdrawDialog}
        onOpenChange={setShowWithdrawDialog}
        title="Withdraw Funds"
        description="Withdraw your contributed amount to your available balance."
        confirmText="Withdraw"
        onConfirm={handleWithdraw}
      />
    </div>
  );
}

export default PackageDetail;
