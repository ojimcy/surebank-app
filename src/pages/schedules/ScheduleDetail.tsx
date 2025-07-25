import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { usePinVerification } from '@/hooks/usePinVerification';
import { ScheduledContribution } from '@/lib/api/scheduledContributions';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import {
    Calendar,
    ArrowLeft,
    Play,
    Pause,
    Square,
    Edit3,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MoreVertical,
    TrendingUp,
    Target,
    DollarSign,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function ScheduleDetail() {
    const { id: scheduleId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { verifyPin, PinVerificationModal } = usePinVerification();
    const [schedule, setSchedule] = useState<ScheduledContribution | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const {
        getSchedule,
        pauseSchedule,
        isPauseScheduleLoading,
        resumeSchedule,
        isResumeScheduleLoading,
        cancelSchedule,
        isCancelScheduleLoading,
    } = useScheduleQueries();

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!scheduleId) return;

            setIsLoading(true);
            try {
                const scheduleData = await getSchedule(scheduleId);
                setSchedule(scheduleData);
            } catch (error) {
                console.error('Error fetching schedule:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, [scheduleId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleCancelSchedule = () => {
        setIsCancelDialogOpen(true);
    };

    const confirmCancel = async () => {
        if (schedule) {
            // Verify PIN before canceling schedule
            const pinVerified = await verifyPin({
                title: 'Cancel Schedule',
                description: `Enter your PIN to cancel the ${schedule.frequency} schedule of ${formatCurrency(schedule.amount)}`
            });

            if (!pinVerified) {
                setIsCancelDialogOpen(false);
                return;
            }

            cancelSchedule(schedule._id || schedule.id!);
            setIsCancelDialogOpen(false);
            // Update local state to reflect the change
            setSchedule(prev => prev ? { ...prev, status: 'cancelled' } : null);
        }
    };

    const handlePause = () => {
        if (schedule) {
            pauseSchedule(schedule._id || schedule.id!);
            // Update local state to reflect the change
            setSchedule(prev => prev ? { ...prev, status: 'paused' } : null);
        }
    };

    const handleResume = () => {
        if (schedule) {
            resumeSchedule(schedule._id || schedule.id!);
            // Update local state to reflect the change
            setSchedule(prev => prev ? { ...prev, status: 'active' } : null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'paused':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Paused</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>;
            case 'suspended':
                return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Suspended</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getFrequencyIcon = () => {
        return <Calendar className="h-6 w-6 text-[#0066A1]" />;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
            </div>
        );
    }

    if (!schedule) {
        return (
            <div className="space-y-6">
                <div className="flex items-center mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/schedules')}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">Schedule Details</h1>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        Schedule Not Found
                    </h2>
                    <p className="text-red-600 mb-4">
                        The schedule you're looking for doesn't exist or has been deleted.
                    </p>
                    <Button onClick={() => navigate('/schedules')}>
                        Back to Schedules
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/schedules')}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">Schedule Details</h1>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link to={`/schedules/${schedule._id || schedule.id}/edit`}>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Schedule
                            </Link>
                        </DropdownMenuItem>
                        {schedule.status === 'active' && (
                            <DropdownMenuItem
                                onClick={handlePause}
                                disabled={isPauseScheduleLoading}
                            >
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Schedule
                            </DropdownMenuItem>
                        )}
                        {schedule.status === 'paused' && (
                            <DropdownMenuItem
                                onClick={handleResume}
                                disabled={isResumeScheduleLoading}
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Resume Schedule
                            </DropdownMenuItem>
                        )}
                        {schedule.status !== 'cancelled' && schedule.status !== 'completed' && (
                            <DropdownMenuItem
                                onClick={handleCancelSchedule}
                                className="text-red-600 hover:text-red-700"
                                disabled={isCancelScheduleLoading}
                            >
                                <Square className="h-4 w-4 mr-2" />
                                Cancel Schedule
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Performance Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Contributed</p>
                                <p className="text-2xl font-bold text-[#0066A1]">
                                    {formatCurrency((schedule.totalPayments - schedule.failedPayments) * schedule.amount)}
                                </p>
                            </div>
                            <div className="p-3 bg-[#0066A1] bg-opacity-10 rounded-lg">
                                <DollarSign className="h-5 w-5 text-[#0066A1]" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2 text-xs">
                            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                            <span className="text-green-600">On track</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Success Rate</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {schedule.totalPayments > 0
                                        ? Math.round(((schedule.totalPayments - schedule.failedPayments) / schedule.totalPayments) * 100)
                                        : 0}%
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Target className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2 text-xs">
                            <Activity className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="text-gray-500">{schedule.totalPayments - schedule.failedPayments}/{schedule.totalPayments} payments</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Next Payment</p>
                                <p className="text-lg font-bold">
                                    {schedule.nextPaymentDate ? new Date(schedule.nextPaymentDate).toLocaleDateString() : 'Not scheduled'}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2 text-xs">
                            <Calendar className="h-3 w-3 text-blue-600 mr-1" />
                            <span className="text-blue-600">{typeof schedule.amount === 'number' ? formatCurrency(schedule.amount) : '₦0'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="text-lg font-bold capitalize">{schedule.status}</p>
                            </div>
                            <div className="p-3 bg-gray-100 rounded-lg">
                                {schedule.status === 'active' ? (
                                    <Play className="h-5 w-5 text-green-600" />
                                ) : schedule.status === 'paused' ? (
                                    <Pause className="h-5 w-5 text-yellow-600" />
                                ) : (
                                    <Square className="h-5 w-5 text-gray-600" />
                                )}
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            {getStatusBadge(schedule.status)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Schedule Overview */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-16 h-16 bg-[#0066A1] bg-opacity-10 rounded-xl">
                                {getFrequencyIcon()}
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h2 className="text-2xl font-bold">
                                        {typeof schedule.amount === 'number' ? formatCurrency(schedule.amount) : '₦0'} {schedule.frequency}
                                    </h2>
                                    {getStatusBadge(schedule.status)}
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>Next: {schedule.nextPaymentDate ? formatDateTime(schedule.nextPaymentDate) : 'Not scheduled'}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span>{schedule.totalPayments - schedule.failedPayments} successful</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Schedule Info</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Frequency</p>
                                    <p className="font-medium capitalize">{schedule.frequency}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="font-medium">{typeof schedule.amount === 'number' ? formatCurrency(schedule.amount) : 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <p className="font-medium uppercase">{schedule.contributionType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Start Date</p>
                                    <p className="font-medium">{schedule.startDate ? formatDateTime(schedule.startDate) : 'Not specified'}</p>
                                </div>
                                {schedule.endDate && (
                                    <div>
                                        <p className="text-sm text-gray-500">End Date</p>
                                        <p className="font-medium">{schedule.endDate ? formatDateTime(schedule.endDate) : 'Not specified'}</p>
                                    </div>
                                )}
                                {typeof schedule.storedCardId === 'object' && (
                                    <div>
                                        <p className="text-sm text-gray-500">Payment Card</p>
                                        <p className="font-medium">
                                            **** {schedule.storedCardId.last4} ({schedule.storedCardId.cardType.toUpperCase()})
                                        </p>
                                        <p className="text-xs text-gray-400">{schedule.storedCardId.bank}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Total Payments</p>
                                    <p className="font-medium">{schedule.totalPayments}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Successful</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium text-green-600">{schedule.totalPayments - schedule.failedPayments}</p>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Failed</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium text-red-600">{schedule.failedPayments}</p>
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Current Status</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium capitalize">{schedule.status}</p>
                                        {schedule.status === 'active' && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Created On</p>
                                    <p className="font-medium">{schedule.createdAt ? formatDateTime(schedule.createdAt) : 'Not available'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Updated</p>
                                    <p className="font-medium">{schedule.updatedAt ? formatDateTime(schedule.updatedAt) : 'Not available'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to={`/schedules/${schedule._id || schedule.id}/edit`}>
                    <Button className="w-full" variant="outline">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Schedule
                    </Button>
                </Link>
                {schedule.status === 'active' && (
                    <Button
                        onClick={handlePause}
                        disabled={isPauseScheduleLoading}
                        variant="outline"
                        className="w-full"
                    >
                        {isPauseScheduleLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600 mr-2"></div>
                                Pausing...
                            </>
                        ) : (
                            <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause Schedule
                            </>
                        )}
                    </Button>
                )}
                {schedule.status === 'paused' && (
                    <Button
                        onClick={handleResume}
                        disabled={isResumeScheduleLoading}
                        className="w-full bg-[#0066A1] hover:bg-[#005085]"
                    >
                        {isResumeScheduleLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Resuming...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 mr-2" />
                                Resume Schedule
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this scheduled contribution of {typeof schedule.amount === 'number' ? formatCurrency(schedule.amount) : '₦0'} {schedule.frequency}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCancel}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isCancelScheduleLoading}
                        >
                            {isCancelScheduleLoading ? 'Cancelling...' : 'Cancel Schedule'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* PIN Verification Modal */}
            <PinVerificationModal />
        </div>
    );
}

export default ScheduleDetail; 