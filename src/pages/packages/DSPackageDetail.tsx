import { useState } from 'react';
import { DSPackageData, DSPackageActions, PackageUtilities, Contribution } from '@/components/packages/shared/types';
import { PackageHeader } from '@/components/packages/shared/PackageHeader';
import { DSPackageOverview } from '@/components/packages/ds/DSPackageOverview';
import { DSPackageActionsComponent as DSActions } from '@/components/packages/ds/DSPackageActions';
import { ContributionTimeline } from '@/components/packages/shared/ContributionTimeline';
import { PackageDetailsAccordion } from '@/components/packages/shared/PackageDetailsAccordion';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/lib/toast-provider';

interface DSPackageDetailProps {
    packageData: DSPackageData;
    contributions: Contribution[];
    utilities: PackageUtilities;
}

export function DSPackageDetail({ packageData, contributions, utilities }: DSPackageDetailProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
    const { addToast } = useToast();

    const actions: DSPackageActions = {
        onAddContribution: () => {
            addToast({
                title: 'Contribution added',
                description: 'Your daily savings contribution has been successfully added.',
                variant: 'success',
            });
        },
        onEditPackage: () => setShowEditDialog(true),
        onWithdraw: () => setShowWithdrawDialog(true),
        onClosePackage: () => setShowCloseDialog(true),
    };

    const handleEditPackage = () => {
        addToast({
            title: 'Package updated',
            description: 'Your daily savings package has been successfully updated.',
            variant: 'success',
        });
        setShowEditDialog(false);
    };

    const handleClosePackage = () => {
        addToast({
            title: 'Package closed',
            description: 'Your daily savings package has been successfully closed.',
            variant: 'destructive',
        });
        setShowCloseDialog(false);
    };

    const handleWithdraw = () => {
        addToast({
            title: 'Withdrawal initiated',
            description: 'Your withdrawal request has been submitted for processing.',
            variant: 'success',
        });
        setShowWithdrawDialog(false);
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
            <DSPackageOverview
                packageData={packageData}
                utilities={utilities}
            />

            {/* Action Buttons */}
            <DSActions
                color={packageData.color}
                actions={actions}
            />

            {/* Contribution History */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Daily Contribution History</h2>
                <ContributionTimeline
                    contributions={contributions}
                    formatCurrency={utilities.formatCurrency}
                    formatDate={utilities.formatDate}
                    formatStatus={utilities.formatStatus}
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
                formatDate={utilities.formatDate}
                formatStatus={utilities.formatStatus}
            />

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                title="Edit Daily Savings Package"
                description="Edit your daily savings amount and target details."
                confirmText="Save Changes"
                onConfirm={handleEditPackage}
            />

            <ConfirmationDialog
                open={showCloseDialog}
                onOpenChange={setShowCloseDialog}
                title="Close Daily Savings Package"
                description="Are you sure you want to close this daily savings package? This action cannot be undone."
                confirmText="Close Package"
                destructive
                onConfirm={handleClosePackage}
            />

            <ConfirmationDialog
                open={showWithdrawDialog}
                onOpenChange={setShowWithdrawDialog}
                title="Withdraw from Daily Savings"
                description="Withdraw funds from your daily savings package. This may affect your savings goal progress."
                confirmText="Proceed with Withdrawal"
                onConfirm={handleWithdraw}
            />
        </div>
    );
} 