import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toast-provider';
import packagesApi from '@/lib/api/packages';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { PackageHeader } from '@/components/packages/PackageHeader';
import { PackageOverview } from '@/components/packages/PackageOverview';
import { PackageActions } from '@/components/packages/PackageActions';
import { ContributionTimeline } from '@/components/packages/ContributionTimeline';
import { PackageDetailsAccordion } from '@/components/packages/PackageDetailsAccordion';

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
  totalContribution: number;
  amountPerDay: number;
  startDate: string;
  endDate?: string;
}

// Contribution interface
interface Contribution {
  id: string;
  amount: number;
  date: string;
  status: string;
}

// Get random image based on package type
const getRandomPackageImage = (
  packageType: string,
  target?: string,
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

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
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
      setError('Invalid package or user not authenticated');
      setLoading(false);
      return;
    }

    const fetchPackageDetail = async () => {
      setLoading(true);
      try {
        // Fetch all packages and find the specific one by ID
        const { dailySavings, sbPackages, ibPackages } =
          await packagesApi.getAllPackages(user.id);

        // Check in daily savings
        const dsPackage = dailySavings.find((pkg) => pkg.id === id);
        if (dsPackage) {
          setPackageData({
            id: dsPackage.id,
            title: dsPackage.target || 'Savings Goal',
            type: 'Daily Savings',
            icon: 'home',
            progress:
              dsPackage.targetAmount > 0
                ? Math.floor(
                  (dsPackage.totalContribution / dsPackage.targetAmount) * 100
                )
                : 0,
            current: dsPackage.totalContribution,
            target: dsPackage.targetAmount,
            color: '#0066A1',
            statusColor: getStatusColor(dsPackage.status),
            status: formatStatus(dsPackage.status),
            accountNumber: dsPackage.accountNumber,
            lastContribution: formatDate(dsPackage.updatedAt),
            nextContribution: 'Not available',
            startDate: dsPackage.startDate,
            endDate: dsPackage.endDate,
            totalContribution: dsPackage.totalContribution,
            amountPerDay: dsPackage.amountPerDay,
            productImage: getRandomPackageImage(
              'Daily Savings',
              dsPackage.target
            ),
          });

          // Mock contributions data for demo
          generateMockContributions(dsPackage.totalContribution);
          setLoading(false);
          return;
        }

        // Check in SB packages
        const sbPackage = sbPackages.find((pkg) => pkg._id === id);
        if (sbPackage) {
          setPackageData({
            id: sbPackage._id,
            title: sbPackage.product?.name || 'Product Package',
            type: 'SB Package',
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
            status: formatStatus(sbPackage.status),
            accountNumber: sbPackage.accountNumber,
            lastContribution: 'Not available',
            nextContribution: 'Not available',
            startDate: sbPackage.startDate,
            endDate: sbPackage.endDate,
            totalContribution: sbPackage.totalContribution,
            amountPerDay: 0,
            productImage:
              sbPackage.product?.images?.[0] ||
              getRandomPackageImage('SB Package', sbPackage.product?.name),
          });

          // Mock contributions data for demo
          generateMockContributions(sbPackage.totalContribution);
          setLoading(false);
          return;
        }

        // Check in IB packages
        const ibPackage = ibPackages.find((pkg) => pkg.id === id || pkg._id === id);
        if (ibPackage) {
          setPackageData({
            id: ibPackage.id || ibPackage._id,
            title: ibPackage.name || 'Interest Savings',
            type: 'Interest-Based',
            icon: 'trending-up',
            progress:
              ibPackage.targetAmount && ibPackage.targetAmount > 0
                ? Math.floor(
                  ((ibPackage.totalContribution || ibPackage.principalAmount) / ibPackage.targetAmount) * 100
                )
                : 100, // Default to 100% if no target amount is set
            current: ibPackage.totalContribution || (ibPackage.principalAmount + ibPackage.accruedInterest),
            target: ibPackage.targetAmount || ibPackage.principalAmount,
            color: '#28A745',
            statusColor: getStatusColor(ibPackage.status),
            status: formatStatus(ibPackage.status),
            accountNumber: ibPackage.accountNumber || 'N/A',
            interestRate: `${ibPackage.interestRate}% p.a.`,
            maturityDate: formatDate(ibPackage.maturityDate),
            lastContribution: 'Not available',
            nextContribution: 'Not available',
            startDate: ibPackage.startDate || formatDate(ibPackage.createdAt),
            endDate: ibPackage.endDate || formatDate(ibPackage.maturityDate),
            totalContribution: ibPackage.totalContribution || ibPackage.principalAmount,
            amountPerDay: 0,
            productImage: getRandomPackageImage('Interest-Based'),
          });

          // Mock contributions data for demo
          generateMockContributions(ibPackage.totalContribution || ibPackage.principalAmount);
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

    // Function to generate mock contributions for demo purposes
    const generateMockContributions = (totalAmount: number) => {
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

      setContributions(mockContributions);
    };

    fetchPackageDetail();
  }, [id, user]);

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
        accountNumber={packageData.accountNumber}
        status={packageData.status}
        statusColor={packageData.statusColor}
        color={packageData.color}
      />

      {/* Package Overview */}
      <PackageOverview
        current={packageData.current}
        target={packageData.target}
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
        amountPerDay={packageData.amountPerDay}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      {/* Action Buttons */}
      <PackageActions
        type={packageData.type}
        color={packageData.color}
        onAddContribution={() => setShowAddDialog(true)}
        onEditPackage={() => setShowEditDialog(true)}
        onClosePackage={() => setShowCloseDialog(true)}
        onBuyProduct={() => setShowBuyDialog(true)}
        onWithdraw={() => setShowWithdrawDialog(true)}
        onMerge={() => setShowMergeDialog(true)}
        onChangeProduct={() => setShowChangeProductDialog(true)}
      />

      {/* Contribution History */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Contribution History</h2>
        <ContributionTimeline
          contributions={contributions}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          formatStatus={formatStatus}
        />
      </div>

      {/* Package Details Accordion */}
      <PackageDetailsAccordion
        type={packageData.type}
        status={packageData.status}
        accountNumber={packageData.accountNumber}
        startDate={packageData.startDate}
        endDate={packageData.endDate}
        lastContribution={packageData.lastContribution}
        formatDate={formatDate}
        formatStatus={formatStatus}
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
