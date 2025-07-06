import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { ScheduledContribution } from '@/lib/api/scheduledContributions';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
    Calendar,
    Plus,
    Play,
    Pause,
    Square,
    MoreVertical,
    Edit3,
    Eye,
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    Clock,
    TrendingUp
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

function SchedulesList() {
    const navigate = useNavigate();
    const [scheduleToCancel, setScheduleToCancel] = useState<ScheduledContribution | null>(null);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const {
        schedules,
        scheduleStats,
        hasSchedules,
        isSchedulesLoading,
        isScheduleStatsLoading,
        isSchedulesError,
        pauseSchedule,
        isPauseScheduleLoading,
        resumeSchedule,
        isResumeScheduleLoading,
        cancelSchedule,
        isCancelScheduleLoading,
        refetchSchedules,
    } = useScheduleQueries();

    const handleCancelSchedule = (schedule: ScheduledContribution) => {
        setScheduleToCancel(schedule);
        setIsCancelDialogOpen(true);
    };

    const confirmCancel = () => {
        if (scheduleToCancel) {
            cancelSchedule(scheduleToCancel._id);
            setIsCancelDialogOpen(false);
            setScheduleToCancel(null);
        }
    };

    const handlePauseSchedule = (scheduleId: string) => {
        pauseSchedule(scheduleId);
    };

    const handleResumeSchedule = (scheduleId: string) => {
        resumeSchedule(scheduleId);
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

    const getFrequencyIcon = (frequency: string) => {
        switch (frequency) {
            case 'daily':
                return <Calendar className="h-4 w-4" />;
            case 'weekly':
                return <Calendar className="h-4 w-4" />;
            case 'monthly':
                return <Calendar className="h-4 w-4" />;
            default:
                return <Calendar className="h-4 w-4" />;
        }
    };

    if (isSchedulesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
            </div>
        );
    }

    if (isSchedulesError) {
        return (
            <div className="space-y-6">
                <div className="flex items-center mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">Scheduled Contributions</h1>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        Error Loading Schedules
                    </h2>
                    <p className="text-red-600 mb-4">
                        We couldn't load your scheduled contributions. Please try again.
                    </p>
                    <Button onClick={() => refetchSchedules()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">Scheduled Contributions</h1>
                </div>
                <Link to="/schedules/create">
                    <Button className="bg-[#0066A1] hover:bg-[#005085]">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Schedule
                    </Button>
                </Link>
            </div>

            {/* Statistics Cards */}
            {!isScheduleStatsLoading && scheduleStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5 text-[#0066A1]" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Schedules</p>
                                    <p className="text-2xl font-bold">{scheduleStats.totalSchedules}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Play className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Active</p>
                                    <p className="text-2xl font-bold">{scheduleStats.activeSchedules}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Successful</p>
                                    <p className="text-2xl font-bold">{scheduleStats.successfulContributions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Total Contributed</p>
                                    <p className="text-2xl font-bold">{formatCurrency(scheduleStats.totalAmountContributed)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Schedules List */}
            {!hasSchedules ? (
                <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No Scheduled Contributions Yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Create your first scheduled contribution to automate your savings
                    </p>
                    <Link to="/schedules/create">
                        <Button className="bg-[#0066A1] hover:bg-[#005085]">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Schedule
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {schedules.map((schedule) => (
                        <Card key={schedule._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-[#0066A1] bg-opacity-10 rounded-lg">
                                            {getFrequencyIcon(schedule.frequency)}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold text-lg">
                                                    {formatCurrency(schedule.amount)} {schedule.frequency}
                                                </h3>
                                                {getStatusBadge(schedule.status)}
                                            </div>
                                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>Next: {formatDate(new Date(schedule.nextPaymentDate).getTime())}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    <span>{schedule.successfulContributions} successful</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-[#0066A1] h-2 rounded-full"
                                                        style={{
                                                            width: `${schedule.totalContributions > 0 ? (schedule.successfulContributions / schedule.totalContributions) * 100 : 0}%`
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {schedule.successfulContributions}/{schedule.totalContributions}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Link to={`/schedules/${schedule._id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/schedules/${schedule._id}/edit`}>
                                                        <Edit3 className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                {schedule.status === 'active' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handlePauseSchedule(schedule._id)}
                                                        disabled={isPauseScheduleLoading}
                                                    >
                                                        <Pause className="h-4 w-4 mr-2" />
                                                        Pause
                                                    </DropdownMenuItem>
                                                )}
                                                {schedule.status === 'paused' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleResumeSchedule(schedule._id)}
                                                        disabled={isResumeScheduleLoading}
                                                    >
                                                        <Play className="h-4 w-4 mr-2" />
                                                        Resume
                                                    </DropdownMenuItem>
                                                )}
                                                {schedule.status !== 'cancelled' && schedule.status !== 'completed' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleCancelSchedule(schedule)}
                                                        className="text-red-600 hover:text-red-700"
                                                        disabled={isCancelScheduleLoading}
                                                    >
                                                        <Square className="h-4 w-4 mr-2" />
                                                        Cancel
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this scheduled contribution of {scheduleToCancel && formatCurrency(scheduleToCancel.amount)} {scheduleToCancel?.frequency}?
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

export default SchedulesList; 