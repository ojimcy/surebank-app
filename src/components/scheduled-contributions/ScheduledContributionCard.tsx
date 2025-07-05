import { useState } from 'react';
import {
    Calendar,
    CreditCard,
    MoreHorizontal,
    Play,
    Pause,
    X,
    Edit3,
    Clock,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { ScheduledContribution } from '@/lib/api/scheduledContributions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { cn } from '@/lib/utils';

interface ScheduledContributionCardProps {
    schedule: ScheduledContribution;
    onUpdate: (scheduleId: string) => void;
    onPause: (scheduleId: string) => void;
    onResume: (scheduleId: string) => void;
    onCancel: (scheduleId: string) => void;
    isLoading?: boolean;
    className?: string;
}

export function ScheduledContributionCard({
    schedule,
    onUpdate,
    onPause,
    onResume,
    onCancel,
    isLoading = false,
    className
}: ScheduledContributionCardProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showPauseDialog, setShowPauseDialog] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'paused':
                return 'warning';
            case 'suspended':
                return 'destructive';
            case 'completed':
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getContributionTypeLabel = (type: string) => {
        switch (type) {
            case 'ds':
                return 'Daily Savings';
            case 'sb':
                return 'Savings Buying';
            case 'ibs':
                return 'Interest Package';
            default:
                return type.toUpperCase();
        }
    };

    const getFrequencyLabel = (frequency: string) => {
        switch (frequency) {
            case 'daily':
                return 'Daily';
            case 'weekly':
                return 'Weekly';
            case 'bi-weekly':
                return 'Bi-weekly';
            case 'monthly':
                return 'Monthly';
            default:
                return frequency;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getNextPaymentDays = () => {
        if (!schedule.nextPaymentDate) return null;
        const nextPayment = new Date(schedule.nextPaymentDate);
        const now = new Date();
        const diffTime = nextPayment.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        return `${diffDays} days`;
    };

    const handlePause = async () => {
        try {
            await onPause(schedule._id);
            setShowPauseDialog(false);
        } catch (error) {
            console.error('Error pausing schedule:', error);
        }
    };

    const handleResume = async () => {
        try {
            await onResume(schedule._id);
        } catch (error) {
            console.error('Error resuming schedule:', error);
        }
    };

    const handleCancel = async () => {
        try {
            await onCancel(schedule._id);
            setShowCancelDialog(false);
        } catch (error) {
            console.error('Error cancelling schedule:', error);
        }
    };

    const handleUpdate = () => {
        onUpdate(schedule._id);
    };

    const nextPaymentDays = getNextPaymentDays();
    const isOverdue = nextPaymentDays === 'Overdue';
    const isToday = nextPaymentDays === 'Today';

    return (
        <>
            <div className={cn(
                'relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md',
                schedule.status === 'suspended' && 'border-destructive/50',
                isOverdue && 'border-orange-500/50',
                className
            )}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor(schedule.status) as any} className="text-xs">
                                {schedule.status.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-medium text-card-foreground">
                                {getContributionTypeLabel(schedule.contributionType)}
                            </span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleUpdate} disabled={isLoading}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit Schedule
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {schedule.status === 'active' && (
                                <DropdownMenuItem
                                    onClick={() => setShowPauseDialog(true)}
                                    disabled={isLoading}
                                >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause
                                </DropdownMenuItem>
                            )}
                            {schedule.status === 'paused' && (
                                <DropdownMenuItem
                                    onClick={handleResume}
                                    disabled={isLoading}
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Resume
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => setShowCancelDialog(true)}
                                disabled={isLoading}
                                className="text-destructive"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Amount and Frequency */}
                <div className="mb-3">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-card-foreground">
                            {formatCurrency(schedule.amount)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            {getFrequencyLabel(schedule.frequency)}
                        </span>
                    </div>
                </div>

                {/* Card Info */}
                <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {schedule.storedCard ?
                            `${schedule.storedCard.cardType} •••• ${schedule.storedCard.last4}` :
                            'Card not found'
                        }
                    </span>
                </div>

                {/* Next Payment Info */}
                {schedule.status === 'active' && schedule.nextPaymentDate && (
                    <div className={cn(
                        'flex items-center gap-2 mb-3 p-2 rounded-md text-sm',
                        isOverdue && 'bg-orange-50 text-orange-700',
                        isToday && 'bg-blue-50 text-blue-700',
                        !isOverdue && !isToday && 'bg-muted text-muted-foreground'
                    )}>
                        <Clock className="h-4 w-4" />
                        <span>
                            Next payment: {formatDate(schedule.nextPaymentDate)}
                            {nextPaymentDays && ` (${nextPaymentDays})`}
                        </span>
                        {isOverdue && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    </div>
                )}

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="text-center">
                        <div className="text-xs text-muted-foreground">Total Paid</div>
                        <div className="text-sm font-semibold text-card-foreground">
                            {formatCurrency(schedule.totalAmount)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-muted-foreground">Payments</div>
                        <div className="text-sm font-semibold text-card-foreground">
                            {schedule.totalPayments}
                            {schedule.failedPayments > 0 && (
                                <span className="text-destructive ml-1">
                                    ({schedule.failedPayments} failed)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showCancelDialog}
                onClose={() => setShowCancelDialog(false)}
                onConfirm={handleCancel}
                title="Cancel Schedule"
                description="Are you sure you want to cancel this contribution schedule? This action cannot be undone."
                confirmText="Cancel Schedule"
                cancelText="Keep Schedule"
                variant="destructive"
            />

            {/* Pause Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showPauseDialog}
                onClose={() => setShowPauseDialog(false)}
                onConfirm={handlePause}
                title="Pause Schedule"
                description="Are you sure you want to pause this contribution schedule? You can resume it anytime."
                confirmText="Pause"
                cancelText="Keep Active"
            />
        </>
    );
} 