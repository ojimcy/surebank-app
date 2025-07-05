import { useState } from 'react';
import { SBPackageData, SBPackageActions, PackageUtilities, Contribution } from '@/components/packages/shared/types';
import { PackageHeader } from '@/components/packages/shared/PackageHeader';
import { SBPackageOverview } from '@/components/packages/sb/SBPackageOverview';
import { SBPackageActionsComponent as SBActions } from '@/components/packages/sb/SBPackageActions';
import { ContributionTimeline } from '@/components/packages/shared/ContributionTimeline';
import { PackageDetailsAccordion } from '@/components/packages/shared/PackageDetailsAccordion';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/lib/toast-provider';

interface SBPackageDetailProps {
    packageData: SBPackageData;
    contributions: Contribution[];
    utilities: PackageUtilities;
}

export function SBPackageDetail({ packageData, contributions, utilities }: SBPackageDetailProps) {
    const [showBuyDialog, setShowBuyDialog] = useState(false);
    const [showCloseDialog, setShowCloseDialog] = useState(false);
    const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
    const [showMergeDialog, setShowMergeDialog] = useState(false);
    const [showChangeProductDialog, setShowChangeProductDialog] = useState(false);
    const { addToast } = useToast();

    const actions: SBPackageActions = {
        onBuyProduct: () => setShowBuyDialog(true),
        onWithdraw: () => setShowWithdrawDialog(true),
        onMerge: () => setShowMergeDialog(true),
        onChangeProduct: () => setShowChangeProductDialog(true),
        onClosePackage: () => setShowCloseDialog(true),
    };

    const handleBuyProduct = () => {
        addToast({
            title: 'Product purchase initiated',
            description: 'Your product purchase has been initiated. You will be redirected to complete the purchase.',
            variant: 'success',
        });
        setShowBuyDialog(false);
    };

    const handleClosePackage = () => {
        addToast({
            title: 'Package closed',
            description: 'Your product savings package has been successfully closed.',
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

    const handleMerge = () => {
        addToast({
            title: 'Package merge initiated',
            description: 'Your package merge request has been submitted for processing.',
            variant: 'success',
        });
        setShowMergeDialog(false);
    };

    const handleChangeProduct = () => {
        addToast({
            title: 'Product change initiated',
            description: 'Your product change request has been submitted for processing.',
            variant: 'success',
        });
        setShowChangeProductDialog(false);
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
            <SBPackageOverview
                packageData={packageData}
                utilities={utilities}
            />

            {/* Action Buttons */}
            <SBActions
                color={packageData.color}
                actions={actions}
            />

            {/* Contribution History */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Savings History</h2>
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
                formatDate={utilities.formatDate}
                formatStatus={utilities.formatStatus}
            />

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                open={showBuyDialog}
                onOpenChange={setShowBuyDialog}
                title="Buy Product"
                description="Proceed to purchase this product using your saved funds?"
                confirmText="Buy Product"
                onConfirm={handleBuyProduct}
            />

            <ConfirmationDialog
                open={showCloseDialog}
                onOpenChange={setShowCloseDialog}
                title="Close Product Savings Package"
                description="Are you sure you want to close this product savings package? This action cannot be undone."
                confirmText="Close Package"
                destructive
                onConfirm={handleClosePackage}
            />

            <ConfirmationDialog
                open={showWithdrawDialog}
                onOpenChange={setShowWithdrawDialog}
                title="Withdraw from Product Savings"
                description="Withdraw funds from your product savings package. This may affect your ability to purchase the product."
                confirmText="Proceed with Withdrawal"
                onConfirm={handleWithdraw}
            />

            <ConfirmationDialog
                open={showMergeDialog}
                onOpenChange={setShowMergeDialog}
                title="Merge Package"
                description="Merge this package with another one. This will combine your contributions."
                confirmText="Merge Packages"
                onConfirm={handleMerge}
            />

            <ConfirmationDialog
                open={showChangeProductDialog}
                onOpenChange={setShowChangeProductDialog}
                title="Change Product"
                description="Change the product associated with this package."
                confirmText="Change Product"
                onConfirm={handleChangeProduct}
            />
        </div>
    );
} 