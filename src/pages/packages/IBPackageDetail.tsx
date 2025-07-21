import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toast-provider';
import packagesApi from '@/lib/api/packages';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { PackageHeader } from '@/components/packages/PackageHeader';
import { PackageOverview } from '@/components/packages/PackageOverview';
import { PackageActions } from '@/components/packages/PackageActions';
import { PackageDetailsAccordion } from '@/components/packages/PackageDetailsAccordion';
import { formatDateTime } from '@/lib/utils';

// Interest-Based Package specific UI interface
interface IBPackageUIPackage {
    id: string;
    title: string;
    accountNumber: string;
    progress: number;
    current: number;
    target: number;
    principalAmount: number;
    interestAccrued: number;
    interestRate: number;
    lockPeriod: number;
    status: string;
    statusColor: string;
    startDate: string;
    endDate: string;
    maturityDate: string;
    lastContribution: string;
    productImage: string;
    compoundingFrequency: string;
}



// Interest-Based Package default image
const ibPackageImage = 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';

function IBPackageDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [packageData, setPackageData] = useState<IBPackageUIPackage | null>(null);
    const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
    const [showCloseDialog, setShowCloseDialog] = useState<boolean>(false);

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

    // Calculate days until maturity
    const calculateDaysUntilMaturity = (maturityDate: string | undefined | null): number => {
        if (!maturityDate) {
            return 0;
        }

        try {
            const today = new Date();
            const maturity = new Date(maturityDate);

            if (isNaN(maturity.getTime())) {
                return 0;
            }

            const diffTime = maturity.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 0;
        } catch (error) {
            console.error('Error calculating days until maturity:', error);
            return 0;
        }
    };

    // Get status color
    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'open':
            case 'active':
                return 'bg-green-500';
            case 'closed':
                return 'bg-red-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'completed':
            case 'matured':
                return 'bg-blue-500';
            default:
                return 'bg-blue-500';
        }
    };

    // Format status
    const formatStatus = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'open':
            case 'active':
                return 'Active';
            case 'closed':
                return 'Closed';
            case 'pending':
                return 'Pending';
            case 'completed':
            case 'matured':
                return 'Matured';
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

        const fetchIBPackageDetail = async () => {
            setLoading(true);
            try {
                const ibPackages = await packagesApi.getIBPackages();
                const ibPackage = ibPackages.find((pkg) => pkg._id === id || pkg.id === id);

                if (!ibPackage) {
                    setError('Interest-Based Package not found');
                    setLoading(false);
                    return;
                }

                const currentBalance = safeParseNumber(ibPackage.currentBalance || (ibPackage.principalAmount + ibPackage.interestAccrued));
                const targetAmount = safeParseNumber(ibPackage.targetAmount) || currentBalance;

                // Calculate progress based on time elapsed towards maturity date
                const today = new Date();
                const startDate = Number(ibPackage.startDate || ibPackage.createdAt);
                const maturityDate = Number(ibPackage.maturityDate);
                const totalDuration = maturityDate - startDate;
                const elapsedTime = today.getTime() - startDate;

                // Calculate percentage of days elapsed out of total duration
                const timeProgress = totalDuration > 0
                    ? Math.min(Math.max((elapsedTime / totalDuration) * 100, 0), 100)
                    : 0;

                const progress = Math.floor(timeProgress);
                setPackageData({
                    id: ibPackage._id,
                    title: ibPackage.name || 'Interest Savings',
                    accountNumber: ibPackage.accountNumber || 'N/A',
                    progress: progress,
                    current: currentBalance,
                    target: targetAmount,
                    principalAmount: ibPackage.principalAmount,
                    interestAccrued: ibPackage.interestAccrued,
                    interestRate: ibPackage.interestRate,
                    lockPeriod: safeParseNumber(ibPackage.lockPeriod),
                    status: formatStatus(ibPackage.status),
                    statusColor: getStatusColor(ibPackage.status),
                    startDate: formatDateTime(ibPackage.createdAt),
                    endDate: formatDateTime(ibPackage.maturityDate),
                    maturityDate: formatDateTime(ibPackage.maturityDate),
                    lastContribution: formatDateTime(ibPackage.createdAt),
                    productImage: ibPackageImage,
                    compoundingFrequency: ibPackage.compoundingFrequency || 'Annual',
                });

                setLoading(false);
            } catch (err) {
                console.error('Error fetching IB package details:', err);
                setError('Failed to load package details. Please try again later.');
                setLoading(false);
            }
        };

        fetchIBPackageDetail();
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

    // Handle withdraw
    const handleWithdraw = () => {
        if (!packageData) return;
        navigate(`/packages/withdraw-interest?packageId=${packageData.id}`);
    };

    // Handle adding contribution
    const handleAddContribution = () => {
        navigate('/payments/deposit');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#28A745]"></div>
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

    const ibColor = '#28A745';
    const daysUntilMaturity = calculateDaysUntilMaturity(packageData.maturityDate);
    const isMatured = daysUntilMaturity <= 0;
    return (
        <div className="p-4 max-w-3xl mx-auto">
            {/* Package Header */}
            <PackageHeader
                title={packageData.title}
                type="Interest-Based"
                accountNumber={packageData.accountNumber}
                status={packageData.status}
                statusColor={packageData.statusColor}
                color={ibColor}
            />

            {/* Package Overview */}
            <PackageOverview
                current={packageData.current}
                target={packageData.target}
                progress={packageData.progress}
                color={ibColor}
                startDate={packageData.startDate}
                endDate={packageData.endDate}
                interestRate={`${packageData.interestRate}% p.a.`}
                maturityDate={packageData.maturityDate}
                productImage={packageData.productImage}
                type="Interest-Based"
                totalContribution={packageData.current}
                principalAmount={packageData.principalAmount}
                amountPerDay={0}
                formatCurrency={formatCurrency}
                formatDate={formatDateTime}
            />

            {/* Interest-Based Package specific info */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Interest Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(packageData.principalAmount)}</div>
                        <div className="text-sm text-gray-600">Principal Amount</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(packageData.interestAccrued)}</div>
                        <div className="text-sm text-gray-600">Interest Earned</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{packageData.interestRate}%</div>
                        <div className="text-sm text-gray-600">Interest Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{packageData.lockPeriod}</div>
                        <div className="text-sm text-gray-600">Lock Period (Days)</div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg border">
                        <div className="text-sm text-gray-600">Maturity Date</div>
                        <div className="text-lg font-semibold">{packageData.maturityDate}</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border">
                        <div className="text-sm text-gray-600">Days Until Maturity</div>
                        <div className="text-lg font-semibold">
                            {isMatured ? (
                                <span className="text-green-600">Matured</span>
                            ) : (
                                <span className="text-blue-600">{daysUntilMaturity} days</span>
                            )}
                        </div>
                    </div>
                </div>

                {isMatured && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-green-700 font-medium">Investment has matured! You can now withdraw your funds.</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <PackageActions
                type="Interest-Based"
                color={ibColor}
                onAddContribution={handleAddContribution}
                onClosePackage={() => setShowCloseDialog(true)}
                onBuyProduct={() => { }} // Not used for IB
                onWithdraw={handleWithdraw}
                onMerge={() => { }} // Not used for IB
                onChangeProduct={() => { }} // Not used for IB
            />

            {/* Package Details Accordion */}
            <PackageDetailsAccordion
                type="Interest-Based"
                status={packageData.status}
                accountNumber={packageData.accountNumber}
                startDate={packageData.startDate}
                endDate={packageData.endDate}
                name={packageData.title}
                principalAmount={packageData.principalAmount}
                currentBalance={packageData.current}
                maturityDate={packageData.maturityDate}
                lockPeriod={packageData.lockPeriod}
                interestRate={`${packageData.interestRate}% p.a.`}
                interestAccrued={packageData.interestAccrued}
                formatDate={formatDateTime}
                formatStatus={formatStatus}
            />

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                title="Edit Package"
                description="Edit this interest-based package details."
                confirmText="Save Changes"
                onConfirm={handleEditPackage}
            />

            <ConfirmationDialog
                open={showCloseDialog}
                onOpenChange={setShowCloseDialog}
                title="Close Package"
                description="Are you sure you want to close this interest-based package? This action cannot be undone."
                confirmText="Close Package"
                destructive
                onConfirm={handleClosePackage}
            />
        </div>
    );
}

export default IBPackageDetail; 