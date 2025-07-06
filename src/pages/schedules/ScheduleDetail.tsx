import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { ScheduledContribution, PaymentLog } from '@/lib/api/scheduledContributions';
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
    History,
    MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    const { scheduleId } = useParams<{ scheduleId: string }>();
    const navigate = useNavigate();
    const [schedule, setSchedule] = useState<ScheduledContribution | null>(null);
    const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLogsLoading, setIsLogsLoading] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const {
        getSchedule,
        getPaymentLogs,
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
    }, [scheduleId, getSchedule]);

    useEffect(() => {
        const fetchPaymentLogs = async () => {
            if (!scheduleId) return;

            setIsLogsLoading(true);
            try {
                const logsData = await getPaymentLogs(scheduleId);
                setPaymentLogs(logsData.logs);
            } catch (error) {
                console.error('Error fetching payment logs:', error);
            } finally {
                setIsLogsLoading(false);
            }
        };

        if (schedule) {
            fetchPaymentLogs();
        }
    }, [scheduleId, schedule, getPaymentLogs]);

    const handleCancelSchedule = () => {
        setIsCancelDialogOpen(true);
    };

    const confirmCancel = () => {
        if (schedule) {
            cancelSchedule(schedule._id);
            setIsCancelDialogOpen(false);
            // Update local state to reflect the change
            setSchedule(prev => prev ? { ...prev, status: 'cancelled' } : null);
        }
    };

    const handlePause = () => {
        if (schedule) {
            pauseSchedule(schedule._id);
            // Update local state to reflect the change
            setSchedule(prev => prev ? { ...prev, status: 'paused' } : null);
        }
    };

    const handleResume = () => {
        if (schedule) {
            resumeSchedule(schedule._id);
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
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getFrequencyIcon = () => {
        return <Calendar className="h-6 w-6 text-[#0066A1]" />;
    };

    const getPaymentStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-600" />;
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        switch (status) {
            case 'success':
                return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
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
                            <Link to={`/schedules/${schedule._id}/edit`}>
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
                                        {formatCurrency(schedule.amount)} {schedule.frequency}
                                    </h2>
                                    {getStatusBadge(schedule.status)}
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-3 w-3" />
                                        <span>Next: {formatDateTime(schedule.nextPaymentDate)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        <span>{schedule.successfulContributions} successful</span>
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
                                    <p className="font-medium">{formatCurrency(schedule.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Start Date</p>
                                    <p className="font-medium">{formatDateTime(schedule.startDate)}</p>
                                </div>
                                {schedule.endDate && (
                                    <div>
                                        <p className="text-sm text-gray-500">End Date</p>
                                        <p className="font-medium">{formatDateTime(schedule.endDate)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Total Contributions</p>
                                    <p className="font-medium">{schedule.totalContributions}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Successful</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium text-green-600">{schedule.successfulContributions}</p>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Failed</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium text-red-600">{schedule.failedContributions}</p>
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Progress</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Success Rate</p>
                                    <p className="font-medium">
                                        {schedule.totalContributions > 0
                                            ? Math.round((schedule.successfulContributions / schedule.totalContributions) * 100)
                                            : 0}%
                                    </p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-[#0066A1] h-3 rounded-full"
                                        style={{
                                            width: `${schedule.totalContributions > 0 ? (schedule.successfulContributions / schedule.totalContributions) * 100 : 0}%`
                                        }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500">
                                    {schedule.successfulContributions} of {schedule.totalContributions} completed
                                </p>
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
                                    <p className="font-medium">{formatDateTime(schedule.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Updated</p>
                                    <p className="font-medium">{formatDateTime(schedule.updatedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to={`/schedules/${schedule._id}/edit`}>
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

            {/* Payment Logs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <History className="h-5 w-5 mr-2" />
                        Payment History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLogsLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0066A1]"></div>
                        </div>
                    ) : paymentLogs.length === 0 ? (
                        <div className="text-center py-8">
                            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No payment history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paymentLogs.map((log) => (
                                <div key={log._id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                                            {getPaymentStatusIcon(log.status)}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <p className="font-medium">{formatCurrency(log.amount)}</p>
                                                {getPaymentStatusBadge(log.status)}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {formatDateTime(log.paymentDate)} • Ref: {log.reference}
                                            </p>
                                            {log.errorMessage && (
                                                <p className="text-sm text-red-600 mt-1">{log.errorMessage}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">
                                            {formatDateTime(log.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this scheduled contribution of {formatCurrency(schedule.amount)} {schedule.frequency}?
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
        </div>
    );
}

export default ScheduleDetail; 