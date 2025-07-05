import { useState } from 'react';
import { IBSPackageData, IBSPackageActions, PackageUtilities } from '@/components/packages/shared/types';
import { PackageHeader } from '@/components/packages/shared/PackageHeader';
import { IBSPackageOverview } from '@/components/packages/ibs/IBSPackageOverview';
import { IBSPackageActionsComponent as IBSActions } from '@/components/packages/ibs/IBSPackageActions';
import { PackageDetailsAccordion } from '@/components/packages/shared/PackageDetailsAccordion';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/lib/toast-provider';

interface IBSPackageDetailProps {
    packageData: IBSPackageData;
    utilities: PackageUtilities;
}

export function IBSPackageDetail({ packageData, utilities }: IBSPackageDetailProps) {
    const [showProjectionsDialog, setShowProjectionsDialog] = useState(false);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
    const [showEarlyWithdrawDialog, setShowEarlyWithdrawDialog] = useState(false);
    const { addToast } = useToast();

    // Check if package has matured
    const isMatured = (() => {
        try {
            const maturityDate = new Date(packageData.maturityDate);
            if (isNaN(maturityDate.getTime())) return false;
            return maturityDate <= new Date();
        } catch {
            return false;
        }
    })();

    const actions: IBSPackageActions = {
        onViewProjections: () => setShowProjectionsDialog(true),
        onWithdraw: () => setShowWithdrawDialog(true),
        onEarlyWithdraw: () => setShowEarlyWithdrawDialog(true),
        onClosePackage: () => setShowCloseDialog(true),
    };

    const handleViewProjections = () => {
        addToast({
            title: 'Interest projections',
            description: 'Viewing detailed interest calculations and projections.',
            variant: 'success',
        });
        setShowProjectionsDialog(false);
    };

    const handleClosePackage = () => {
        addToast({
            title: 'Package closed',
            description: 'Your interest-based savings package has been successfully closed.',
            variant: 'destructive',
        });
        setShowCloseDialog(false);
    };

    const handleWithdraw = () => {
        addToast({
            title: 'Withdrawal initiated',
            description: 'Your matured funds withdrawal has been initiated.',
            variant: 'success',
        });
        setShowWithdrawDialog(false);
    };

    const handleEarlyWithdraw = () => {
        addToast({
            title: 'Early withdrawal initiated',
            description: 'Your early withdrawal request has been submitted. Penalties may apply.',
            variant: 'default',
        });
        setShowEarlyWithdrawDialog(false);
    };

    // Calculate projected final amount
    const calculateProjectedAmount = () => {
        try {
            const rateString = packageData.interestRate.replace('%', '').replace(' p.a.', '').trim();
            const rate = parseFloat(rateString) / 100;
            const principal = packageData.principalAmount;
            const timeInYears = packageData.lockPeriod / 365;

            if (isNaN(rate) || isNaN(principal) || isNaN(timeInYears)) {
                return principal; // Return principal if calculation fails
            }

            if (packageData.compoundingFrequency && packageData.compoundingFrequency !== 'simple') {
                const compoundFrequency = packageData.compoundingFrequency === 'quarterly' ? 4 : 1;
                return principal * Math.pow(1 + rate / compoundFrequency, compoundFrequency * timeInYears);
            } else {
                return principal * (1 + rate * timeInYears);
            }
        } catch {
            return packageData.principalAmount; // Return principal if calculation fails
        }
    };

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
            <IBSPackageOverview
                packageData={packageData}
                utilities={utilities}
            />

            {/* Action Buttons */}
            <IBSActions
                color={packageData.color}
                actions={actions}
                isMatured={isMatured}
            />

            {/* Interest Projections */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Interest Breakdown</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm text-gray-500">Principal Amount</div>
                        <div className="font-bold text-lg">{utilities.formatCurrency(packageData.principalAmount)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Accrued Interest</div>
                        <div className="font-bold text-lg text-green-600">+{utilities.formatCurrency(packageData.accruedInterest)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Current Balance</div>
                        <div className="font-bold text-lg">{utilities.formatCurrency(packageData.current)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-500">Projected Final Amount</div>
                        <div className="font-bold text-lg text-blue-600">{utilities.formatCurrency(calculateProjectedAmount())}</div>
                    </div>
                </div>

                {!isMatured && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-blue-600 mr-2 mt-0.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div>
                                <p className="text-sm font-medium text-blue-800">
                                    Interest Calculation
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Interest is calculated at {packageData.interestRate} per annum using {packageData.compoundingFrequency || 'simple'} interest method.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Package Details Accordion */}
            <PackageDetailsAccordion
                type={packageData.type}
                status={packageData.status}
                accountNumber={packageData.accountNumber}
                startDate={packageData.startDate}
                endDate={packageData.endDate}
                formatDate={utilities.formatDate}
                formatStatus={utilities.formatStatus}
            />

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                open={showProjectionsDialog}
                onOpenChange={setShowProjectionsDialog}
                title="Interest Projections"
                description="View detailed interest calculations and future projections for your investment."
                confirmText="View Details"
                onConfirm={handleViewProjections}
            />

            <ConfirmationDialog
                open={showCloseDialog}
                onOpenChange={setShowCloseDialog}
                title="Close Interest Savings Package"
                description="Are you sure you want to close this interest-based savings package? This action cannot be undone."
                confirmText="Close Package"
                destructive
                onConfirm={handleClosePackage}
            />

            <ConfirmationDialog
                open={showWithdrawDialog}
                onOpenChange={setShowWithdrawDialog}
                title="Withdraw Matured Funds"
                description="Your investment has matured. Proceed with withdrawal of your funds including accrued interest."
                confirmText="Withdraw Funds"
                onConfirm={handleWithdraw}
            />

            <ConfirmationDialog
                open={showEarlyWithdrawDialog}
                onOpenChange={setShowEarlyWithdrawDialog}
                title="Early Withdrawal"
                description="Warning: Early withdrawal may result in penalties and reduced interest earnings. Are you sure you want to proceed?"
                confirmText="Proceed with Early Withdrawal"
                destructive
                onConfirm={handleEarlyWithdraw}
            />
        </div>
    );
} 