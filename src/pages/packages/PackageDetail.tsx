import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toast-provider';
import packagesApi, {
  DailySavingsPackage,
  SBPackage,
  IBPackage,
} from '@/lib/api/packages';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { PackageHeader } from '@/components/packages/PackageHeader';
import { PackageOverview } from '@/components/packages/PackageOverview';
import { PackageActions } from '@/components/packages/PackageActions';
import { ContributionTimeline } from '@/components/packages/ContributionTimeline';
import { PackageDetailsAccordion } from '@/components/packages/PackageDetailsAccordion';
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

// Function to generate mock contributions for demo purposes
const generateMockContributions = (totalAmount: number): Contribution[] => {
  // Generate between 3 and 8 contributions
  const numContributions = Math.floor(Math.random() * 6) + 3;
  const mockContributions: Contribution[] = [];

  // Calculate a reasonable average contribution
  const avgContribution = totalAmount / numContributions;

  // Generate contributions with some variance
  for (let i = 0; i < numContributions; i++) {
    // Create a date between 6 months ago and now
    const date = new Date();
    date.setMonth(date.getMonth() - Math.floor(Math.random() * 6));

    // Create the contribution with some variance in amount
    mockContributions.push({
      id: `contrib-${i}`,
      amount: Math.round(avgContribution * (0.75 + Math.random() * 0.5)),
      date: date.toISOString(),
      status: Math.random() > 0.1 ? 'completed' : 'pending',
    });
  }

  // Sort by date (newest first)
  mockContributions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return mockContributions;
};

function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<UIPackage | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showCloseDialog, setShowCloseDialog] = useState<boolean>(false);
  const [showMergeDialog, setShowMergeDialog] = useState<boolean>(false);
  const [showChangeProductDialog, setShowChangeProductDialog] =
    useState<boolean>(false);
  const [showBuyDialog, setShowBuyDialog] = useState<boolean>(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState<boolean>(false);

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

  useEffect(() => {
    if (!id || !user?.id) {
      return;
    }

    const fetchPackageDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all package types to find the matching one
        const { dailySavings, sbPackages, ibPackages } =
          await packagesApi.getAllPackages(user.id);

        // Find the package in each type
        let foundPackage = null;

        // Check Daily Savings
        const dsPackage = dailySavings.find(
          (pkg) => pkg.id === id
        ) as ExtendedDailySavingsPackage;
        if (dsPackage) {
          foundPackage = {
            id: dsPackage.id,
            title: dsPackage.target || 'Savings Goal',
            type: 'Daily Savings' as const,
            icon: 'home',
            progress: dsPackage.totalCount
              ? Math.floor((dsPackage.totalCount / 31) * 100)
              : 0,
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
            productImage: getRandomPackageImage(
              'Daily Savings',
              dsPackage.target
            ),
            withdrawalRequests: dsPackage.withdrawalRequests || [],
            paymentTransactions: dsPackage.paymentTransactions || [],
            deductionCount: dsPackage.deductionCount || 0,
            totalCount: dsPackage.totalCount || 0,
            hasBeenCharged: dsPackage.hasBeenCharged || false,
            totalCharge: dsPackage.totalCharge || 0,
          };
        }

        // Check SB Packages
        const sbPackage = sbPackages.find(
          (pkg) => pkg._id === id
        ) as ExtendedSBPackage;
        if (sbPackage) {
          foundPackage = {
            id: sbPackage._id,
            title: sbPackage.product?.name || 'Product Package',
            type: 'SB Package' as const,
            icon: 'laptop',
            progress:
              sbPackage.targetAmount > 0
                ? Math.floor(
                    (sbPackage.totalContribution / sbPackage.targetAmount) * 100
                  )
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
        const ibPackage = ibPackages.find(
          (pkg) => pkg._id === id
        ) as ExtendedIBPackage;
        if (ibPackage) {
          const timeProgress = calculateTimeProgress(
            ibPackage.startDate,
            ibPackage.maturityDate
          );
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
            interestAccrued: ibPackage.accruedInterest,
            earlyWithdrawalPenalty: ibPackage.earlyWithdrawalPenalty || 0,
            currentBalance:
              ibPackage.currentBalance || ibPackage.principalAmount,
            estimatedEarnings: ibPackage.accruedInterest,
          };
        }

        if (!foundPackage) {
          throw new Error('Package not found');
        }

        setPackageData(foundPackage as UIPackage);

        // Generate mock contributions for now
        // TODO: Replace with actual contribution data when available
        const mockContributions = generateMockContributions(
          foundPackage.current || 0
        );
        setContributions(mockContributions);
      } catch (err) {
        console.error('Error fetching package details:', err);
        setError('Failed to load package details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetail();
  }, [id, user?.id]);

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

  // Handle merge package
  const handleMergePackage = () => {
    addToast({
      title: 'Merge initiated',
      description: 'Your package merge has been initiated.',
      variant: 'success',
    });
    setShowMergeDialog(false);
  };

  // Handle change product
  const handleChangeProduct = () => {
    addToast({
      title: 'Product changed',
      description: 'Your product has been successfully changed.',
      variant: 'success',
    });
    setShowChangeProductDialog(false);
  };

  // Handle buy product
  const handleBuyProduct = () => {
    addToast({
      title: 'Purchase initiated',
      description: 'Your purchase has been initiated.',
      variant: 'success',
    });
    setShowBuyDialog(false);
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

  if (error || !packageData) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
          <p>{error || 'Package not found'}</p>
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
        onEditPackage={() => setShowEditDialog(true)}
        onClosePackage={() => setShowCloseDialog(true)}
        onBuyProduct={() => setShowBuyDialog(true)}
        onWithdraw={() => setShowWithdrawDialog(true)}
        onMerge={() => setShowMergeDialog(true)}
        onChangeProduct={() => setShowChangeProductDialog(true)}
        hasMetTarget={
          packageData.type === 'SB Package' &&
          packageData.totalContribution >= packageData.target
        }
      />

      {/* Contribution History */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Contribution History</h2>
        <ContributionTimeline
          contributions={contributions}
          formatCurrency={formatCurrency}
          formatDate={formatDateTime}
          formatStatus={formatStatus}
        />
      </div>

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

      <ConfirmationDialog
        open={showMergeDialog}
        onOpenChange={setShowMergeDialog}
        title="Merge Package"
        description="Merge this package with another one. This will combine your contributions."
        confirmText="Merge Packages"
        onConfirm={handleMergePackage}
      />

      <ConfirmationDialog
        open={showChangeProductDialog}
        onOpenChange={setShowChangeProductDialog}
        title="Change Product"
        description="Change the product associated with this package."
        confirmText="Change Product"
        onConfirm={handleChangeProduct}
      />

      <ConfirmationDialog
        open={showBuyDialog}
        onOpenChange={setShowBuyDialog}
        title="Buy Product"
        description="Complete your purchase for this product package."
        confirmText="Proceed to Payment"
        onConfirm={handleBuyProduct}
      />

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
