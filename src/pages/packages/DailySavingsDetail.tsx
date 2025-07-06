import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toast-provider';
import packagesApi, { DailySavingsPackage } from '@/lib/api/packages';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { PackageHeader } from '@/components/packages/PackageHeader';
import { PackageOverview } from '@/components/packages/PackageOverview';
import { PackageActions } from '@/components/packages/PackageActions';
import { ContributionTimeline } from '@/components/packages/ContributionTimeline';
import { PackageDetailsAccordion } from '@/components/packages/PackageDetailsAccordion';

// Daily Savings specific UI interface
interface DailySavingsUIPackage {
    id: string;
    title: string;
    accountNumber: string;
    progress: number;
    current: number;
    target: number;
    amountPerDay: number;
    status: string;
    statusColor: string;
    startDate: string;
    endDate?: string;
    lastContribution: string;
    nextContribution: string;
    totalContribution: number;
    productImage: string;
}

// Contribution interface
interface Contribution {
    id: string;
    amount: number;
    date: string;
    status: string;
}

// Get random image for Daily Savings packages
const getDailySavingsImage = (target?: string): string => {
    const targetImages = {
        'School Fees': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'House Rent': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'Building Projects': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'Shop Rent': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    };

    const fallbackImages = [
        'https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1633158829875-e5316a358c6c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    ];

    if (target && targetImages[target as keyof typeof targetImages]) {
        return targetImages[target as keyof typeof targetImages];
    }

    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
};

function DailySavingsDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [packageData, setPackageData] = useState<DailySavingsUIPackage | null>(null);
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
    const [showCloseDialog, setShowCloseDialog] = useState<boolean>(false);
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
            // If it's already a formatted date string, return as is
            if (dateString.match(/^\d{1,2}\s\w{3}\s\d{4}$/)) {
                return dateString;
            }

            // Handle numeric timestamps (as strings)
            const timestamp = parseInt(dateString);
            if (!isNaN(timestamp) && dateString.match(/^\d+$/)) {
                if (timestamp === 0 || timestamp < 1000000000) {
                    return 'N/A';
                }

                const dateValue = timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
                const date = new Date(dateValue);

                if (isNaN(date.getTime()) || date.getFullYear() < 1971) {
                    return 'N/A';
                }

                return date.toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            }

            // Handle ISO date strings and other string formats
            const date = new Date(dateString);
            if (isNaN(date.getTime()) || date.getFullYear() < 1971) {
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

    // Calculate next contribution date
    const calculateNextContribution = (amountPerDay: number): string => {
        try {
            if (!amountPerDay || amountPerDay <= 0) {
                return 'Not scheduled';
            }

            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const formattedDate = tomorrow.toLocaleDateString('en-NG', {
                month: 'short',
                day: 'numeric',
            });

            return `₦${amountPerDay.toLocaleString()} due on ${formattedDate}`;
        } catch (error) {
            console.error('Error calculating next contribution:', error);
            return 'Next due date unavailable';
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

        const fetchDailySavingsDetail = async () => {
            setLoading(true);
            try {
                const dailySavingsPackages = await packagesApi.getDailySavings(user.id);
                const dsPackage = dailySavingsPackages.find((pkg) => pkg.id === id);

                if (!dsPackage) {
                    setError('Daily Savings package not found');
                    setLoading(false);
                    return;
                }

                const totalContribution = safeParseNumber(dsPackage.totalContribution);
                const targetAmount = safeParseNumber(dsPackage.targetAmount);
                const amountPerDay = safeParseNumber(dsPackage.amountPerDay);

                setPackageData({
                    id: dsPackage.id,
                    title: dsPackage.target || 'Savings Goal',
                    accountNumber: dsPackage.accountNumber || 'N/A',
                    progress: targetAmount > 0 ? Math.floor((totalContribution / targetAmount) * 100) : 0,
                    current: totalContribution,
                    target: targetAmount,
                    amountPerDay: amountPerDay,
                    status: formatStatus(dsPackage.status),
                    statusColor: getStatusColor(dsPackage.status),
                    startDate: dsPackage.startDate,
                    endDate: dsPackage.endDate,
                    lastContribution: formatDate(dsPackage.updatedAt),
                    nextContribution: calculateNextContribution(amountPerDay),
                    totalContribution: totalContribution,
                    productImage: getDailySavingsImage(dsPackage.target),
                });

                // Generate mock contributions data for demo
                generateMockContributions(totalContribution, amountPerDay);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching Daily Savings package details:', err);
                setError('Failed to load package details. Please try again later.');
                setLoading(false);
            }
        };

        // Function to generate mock contributions for demo purposes
        const generateMockContributions = (totalAmount: number, dailyAmount: number) => {
            const safeTotal = safeParseNumber(totalAmount);
            const safeDailyAmount = safeParseNumber(dailyAmount);

            if (safeTotal <= 0 || safeDailyAmount <= 0) {
                setContributions([]);
                return;
            }

            // Calculate approximate number of contributions based on daily amount
            const approximateContributions = Math.floor(safeTotal / safeDailyAmount);
            const numContributions = Math.min(approximateContributions, 30); // Limit to 30 for demo

            const mockContributions: Contribution[] = [];

            for (let i = 0; i < numContributions; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                mockContributions.push({
                    id: `contrib-${i}`,
                    amount: safeDailyAmount,
                    date: date.toISOString(),
                    status: Math.random() > 0.05 ? 'completed' : 'pending',
                });
            }

            // Sort by date (newest first)
            mockContributions.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setContributions(mockContributions);
        };

        fetchDailySavingsDetail();
    }, [id, user]);

    // Handle adding contribution
    const handleAddContribution = () => {
        addToast({
            title: 'Contribution added',
            description: 'Your contribution has been successfully added.',
            variant: 'success',
        });
    };

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

    const dsColor = '#0066A1';

    return (
        <div className="p-4 max-w-3xl mx-auto">
            {/* Package Header */}
            <PackageHeader
                title={packageData.title}
                type="Daily Savings"
                accountNumber={packageData.accountNumber}
                status={packageData.status}
                statusColor={packageData.statusColor}
                color={dsColor}
            />

            {/* Package Overview */}
            <PackageOverview
                current={packageData.current}
                target={packageData.target}
                progress={packageData.progress}
                color={dsColor}
                startDate={packageData.startDate}
                endDate={packageData.endDate}
                nextContribution={packageData.nextContribution}
                productImage={packageData.productImage}
                type="Daily Savings"
                totalContribution={packageData.totalContribution}
                amountPerDay={packageData.amountPerDay}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
            />

            {/* Daily Savings specific info */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Daily Savings Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(packageData.amountPerDay)}</div>
                        <div className="text-sm text-gray-600">Daily Amount</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{packageData.progress}%</div>
                        <div className="text-sm text-gray-600">Progress</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-medium text-blue-600">{packageData.nextContribution}</div>
                        <div className="text-sm text-gray-600">Next Due</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <PackageActions
                type="Daily Savings"
                color={dsColor}
                onAddContribution={handleAddContribution}
                onEditPackage={() => setShowEditDialog(true)}
                onClosePackage={() => setShowCloseDialog(true)}
                onBuyProduct={() => { }} // Not used for DS
                onWithdraw={() => setShowWithdrawDialog(true)}
                onMerge={() => { }} // Not used for DS
                onChangeProduct={() => { }} // Not used for DS
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
                type="Daily Savings"
                status={packageData.status}
                accountNumber={packageData.accountNumber}
                startDate={packageData.startDate}
                endDate={packageData.endDate}
                lastContribution={packageData.lastContribution}
                amountPerDay={packageData.amountPerDay}
                totalContribution={packageData.totalContribution}
                formatDate={formatDate}
                formatStatus={formatStatus}
            />

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                title="Edit Package"
                description="Edit this daily savings package details."
                confirmText="Save Changes"
                onConfirm={handleEditPackage}
            />

            <ConfirmationDialog
                open={showCloseDialog}
                onOpenChange={setShowCloseDialog}
                title="Close Package"
                description="Are you sure you want to close this daily savings package? This action cannot be undone."
                confirmText="Close Package"
                destructive
                onConfirm={handleClosePackage}
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

export default DailySavingsDetail; 