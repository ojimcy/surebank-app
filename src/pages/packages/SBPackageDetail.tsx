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

// SB Package specific UI interface
interface SBPackageUIPackage {
    id: string;
    title: string;
    accountNumber: string;
    progress: number;
    current: number;
    target: number;
    status: string;
    statusColor: string;
    startDate: string;
    endDate?: string;
    lastContribution: string;
    totalContribution: number;
    remainingBalance: number;
    productImage: string;
    productDetails: {
        name: string;
        description: string;
        costPrice: number;
        sellingPrice: number;
        discount: number;
        quantity: number;
    };
}

// Contribution interface
interface Contribution {
    id: string;
    amount: number;
    date: string;
    status: string;
}

// SB Package placeholder image
const sbPackagePlaceholder = 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

function SBPackageDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [packageData, setPackageData] = useState<SBPackageUIPackage | null>(null);
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
    const [showCloseDialog, setShowCloseDialog] = useState<boolean>(false);
    const [showMergeDialog, setShowMergeDialog] = useState<boolean>(false);
    const [showChangeProductDialog, setShowChangeProductDialog] = useState<boolean>(false);
    const [showBuyDialog, setShowBuyDialog] = useState<boolean>(false);
    const [showWithdrawDialog, setShowWithdrawDialog] = useState<boolean>(false);

    // Helper function to safely parse numbers
    const safeParseNumber = (value: string | number | null | undefined, defaultValue: number = 0): number => {
        if (value === null || value === undefined || value === '') {
            return defaultValue;
        }
        const parsed = typeof value === 'number' ? value : parseFloat(String(value));
        return isNaN(parsed) ? defaultValue : parsed;
    };

    // Format currency
    const formatCurrency = (amount: number): string => {
        const safeAmount = safeParseNumber(amount, 0);
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(safeAmount);
    };

    // Format date
    const formatDate = (dateString: string): string => {
        if (!dateString || dateString === '0' || dateString === 'null' || dateString === 'undefined') {
            return 'N/A';
        }

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'N/A';
            }

            return date.toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
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

        const fetchSBPackageDetail = async () => {
            setLoading(true);
            try {
                const sbPackages = await packagesApi.getSBPackages(user.id);
                const sbPackage = sbPackages.find((pkg) => pkg._id === id);

                if (!sbPackage) {
                    setError('SB Package not found');
                    setLoading(false);
                    return;
                }

                const totalContribution = safeParseNumber(sbPackage.totalContribution);
                const targetAmount = safeParseNumber(sbPackage.targetAmount);
                const remainingBalance = targetAmount - totalContribution;

                setPackageData({
                    id: sbPackage._id,
                    title: sbPackage.product?.name || 'Product Package',
                    accountNumber: sbPackage.accountNumber || 'N/A',
                    progress: targetAmount > 0 ? Math.floor((totalContribution / targetAmount) * 100) : 0,
                    current: totalContribution,
                    target: targetAmount,
                    status: formatStatus(sbPackage.status),
                    statusColor: getStatusColor(sbPackage.status),
                    startDate: sbPackage.startDate,
                    endDate: sbPackage.endDate,
                    lastContribution: 'Not available',
                    totalContribution: totalContribution,
                    remainingBalance: remainingBalance,
                    productImage: sbPackage.product?.images?.[0] || sbPackagePlaceholder,
                    productDetails: {
                        name: sbPackage.product?.name || 'Unknown Product',
                        description: 'Product description not available',
                        costPrice: 0,
                        sellingPrice: targetAmount,
                        discount: 0,
                        quantity: 1,
                    },
                });

                // Generate mock contributions data for demo
                generateMockContributions(totalContribution);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching SB package details:', err);
                setError('Failed to load package details. Please try again later.');
                setLoading(false);
            }
        };

        // Function to generate mock contributions for demo purposes
        const generateMockContributions = (totalAmount: number) => {
            const safeTotal = safeParseNumber(totalAmount);
            if (safeTotal <= 0) {
                setContributions([]);
                return;
            }

            // Generate between 5 and 12 contributions
            const numContributions = Math.floor(Math.random() * 8) + 5;
            const mockContributions: Contribution[] = [];

            // Calculate a reasonable average contribution
            const avgContribution = safeTotal / numContributions;

            // Generate contributions with some variance
            for (let i = 0; i < numContributions; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (i * 7)); // Weekly contributions

                mockContributions.push({
                    id: `contrib-${i}`,
                    amount: Math.round(avgContribution * (0.8 + Math.random() * 0.4)),
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

        fetchSBPackageDetail();
    }, [id, user]);

    // Handle editing package
    const handleEditPackage = () => {
        addToast({
            title: 'Package updated',
            description: 'Your package has been successfully updated.',
            variant: 'success',
        });
        setShowEditDialog(false);
    };

    // Handle closing package
    const handleClosePackage = () => {
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7952B3]"></div>
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

    const sbColor = '#7952B3';

    return (
        <div className="p-4 max-w-3xl mx-auto">
            {/* Package Header */}
            <PackageHeader
                title={packageData.title}
                type="SB Package"
                accountNumber={packageData.accountNumber}
                status={packageData.status}
                statusColor={packageData.statusColor}
                color={sbColor}
            />

            {/* Package Overview */}
            <PackageOverview
                current={packageData.current}
                target={packageData.target}
                progress={packageData.progress}
                color={sbColor}
                startDate={packageData.startDate}
                endDate={packageData.endDate}
                productImage={packageData.productImage}
                type="SB Package"
                totalContribution={packageData.totalContribution}
                principalAmount={packageData.current}
                amountPerDay={0}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
            />

            {/* SB Package specific info */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Product Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{formatCurrency(packageData.productDetails.sellingPrice)}</div>
                        <div className="text-sm text-gray-600">Product Price</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(packageData.totalContribution)}</div>
                        <div className="text-sm text-gray-600">Total Saved</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{formatCurrency(packageData.remainingBalance)}</div>
                        <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                </div>

                {packageData.progress >= 100 && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-700 font-medium">Congratulations! You've reached your target. Ready to purchase?</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <PackageActions
                type="SB Package"
                color={sbColor}
                onAddContribution={() => { }} // Not used for SB
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
                type="SB Package"
                status={packageData.status}
                accountNumber={packageData.accountNumber}
                startDate={packageData.startDate}
                endDate={packageData.endDate}
                productDetails={packageData.productDetails}
                totalContribution={packageData.totalContribution}
                remainingBalance={packageData.remainingBalance}
                formatDate={formatDate}
                formatStatus={formatStatus}
            />

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                title="Edit Package"
                description="Edit this SB package details."
                confirmText="Save Changes"
                onConfirm={handleEditPackage}
            />

            <ConfirmationDialog
                open={showCloseDialog}
                onOpenChange={setShowCloseDialog}
                title="Close Package"
                description="Are you sure you want to close this SB package? This action cannot be undone."
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

export default SBPackageDetail; 