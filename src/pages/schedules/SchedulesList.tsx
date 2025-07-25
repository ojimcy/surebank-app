import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { ScheduledContribution, RecentActivity } from '@/lib/api/scheduledContributions';
import { formatDate, formatCurrency } from '@/lib/utils';
import { usePinVerification } from '@/hooks/usePinVerification';
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
    TrendingUp,
    Search,
    Filter,
    BarChart3,
    CreditCard,
    Activity,
    ExternalLink,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('nextPayment');
    const { verifyPin, PinVerificationModal } = usePinVerification();

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

    const confirmCancel = async () => {
        if (scheduleToCancel) {
            // Verify PIN before canceling schedule
            const pinVerified = await verifyPin({
                title: 'Cancel Schedule',
                description: `Enter your PIN to cancel the ${scheduleToCancel.frequency} schedule of ${formatCurrency(scheduleToCancel.amount)}`
            });

            if (!pinVerified) {
                setIsCancelDialogOpen(false);
                return;
            }

            cancelSchedule(scheduleToCancel._id);
            setIsCancelDialogOpen(false);
            setScheduleToCancel(null);
        }
    };

    const handlePauseSchedule = (scheduleId: string) => {
        if (scheduleId) pauseSchedule(scheduleId);
    };

    const handleResumeSchedule = (scheduleId: string) => {
        if (scheduleId) resumeSchedule(scheduleId);
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

    // Filter and sort schedules
    const filteredAndSortedSchedules = schedules
        ?.filter(schedule => {
            // Filter by search term
            const matchesSearch = searchTerm === '' ||
                (typeof schedule.amount === 'number' ? formatCurrency(schedule.amount).toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
                schedule.frequency.toLowerCase().includes(searchTerm.toLowerCase());

            // Filter by status
            const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;

            return matchesSearch && matchesStatus;
        })
        ?.sort((a, b) => {
            switch (sortBy) {
                case 'amount':
                    return b.amount - a.amount;
                case 'nextPayment':
                    return new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
                case 'created':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });

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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* Recent Activity */}
            {!isScheduleStatsLoading && scheduleStats?.recentActivity && scheduleStats.recentActivity.length > 0 && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <Activity className="h-5 w-5 text-[#0066A1]" />
                                <h3 className="text-lg font-semibold">Recent Activity</h3>
                            </div>
                            <Link to="/schedules/activity">
                                <Button variant="ghost" size="sm" className="text-[#0066A1]">
                                    <span>View All</span>
                                    <ExternalLink className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {scheduleStats.recentActivity.slice(0, 3).map((activity: RecentActivity, index: number) => (
                                <div key={activity.id || index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-green-500' :
                                            activity.status === 'failed' ? 'bg-red-500' :
                                                'bg-yellow-500'
                                            }`} />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{formatCurrency(activity.amount)}</span>
                                                <Badge
                                                    variant={activity.status === 'success' ? 'default' : activity.status === 'failed' ? 'destructive' : 'secondary'}
                                                    className={
                                                        activity.status === 'success' ? 'bg-green-100 text-green-800' :
                                                            activity.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                    }
                                                >
                                                    {activity.status === 'success' ? (
                                                        <>
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Success
                                                        </>
                                                    ) : activity.status === 'failed' ? (
                                                        <>
                                                            <XCircle className="h-3 w-3 mr-1" />
                                                            Failed
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            Processing
                                                        </>
                                                    )}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {activity.contributionType.toUpperCase()} • {formatDate(new Date(activity.createdAt).getTime())}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search and Filter Controls */}
            {hasSchedules && (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by amount or frequency..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-32">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="paused">Paused</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-40">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="nextPayment">Next Payment</SelectItem>
                                <SelectItem value="amount">Amount</SelectItem>
                                <SelectItem value="created">Date Created</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                    <div className="space-y-3">
                        <Link to="/schedules/create">
                            <Button className="bg-[#0066A1] hover:bg-[#005085] w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Schedule
                            </Button>
                        </Link>
                        <Link to="/cards">
                            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Manage Payment Cards
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    {/* Results Summary */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <p>
                            Showing {filteredAndSortedSchedules?.length || 0} of {schedules?.length || 0} schedules
                            {searchTerm && ` for "${searchTerm}"`}
                            {filterStatus !== 'all' && ` • ${filterStatus} only`}
                        </p>
                        {filteredAndSortedSchedules?.length === 0 && searchTerm && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                }}
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>

                    <div className="grid gap-4">
                        {filteredAndSortedSchedules?.map((schedule) => (
                            <Card key={schedule._id || schedule.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center justify-center w-12 h-12 bg-[#0066A1] bg-opacity-10 rounded-lg">
                                                {getFrequencyIcon(schedule.frequency)}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-semibold text-lg">
                                                        {typeof schedule.amount === 'number' ? formatCurrency(schedule.amount) : '₦0'} {schedule.frequency}
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
                                                        <span>{schedule.totalPayments - schedule.failedPayments} successful</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {/* Quick Action Buttons */}
                                            {schedule.status === 'active' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const id = schedule._id || schedule.id;
                                                        if (id) handlePauseSchedule(id);
                                                    }}
                                                    disabled={isPauseScheduleLoading}
                                                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                                                >
                                                    <Pause className="h-4 w-4 mr-1" />
                                                    Pause
                                                </Button>
                                            )}
                                            {schedule.status === 'paused' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const id = schedule._id || schedule.id;
                                                        if (id) handleResumeSchedule(id);
                                                    }}
                                                    disabled={isResumeScheduleLoading}
                                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                                >
                                                    <Play className="h-4 w-4 mr-1" />
                                                    Resume
                                                </Button>
                                            )}

                                            <Link to={`/schedules/${schedule._id || schedule.id || 'unknown'}`}>
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
                                                        <Link to={`/schedules/${schedule._id || schedule.id || 'unknown'}/edit`}>
                                                            <Edit3 className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {schedule.status === 'active' && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                        const id = schedule._id || schedule.id;
                                                        if (id) handlePauseSchedule(id);
                                                    }}
                                                            disabled={isPauseScheduleLoading}
                                                        >
                                                            <Pause className="h-4 w-4 mr-2" />
                                                            Pause
                                                        </DropdownMenuItem>
                                                    )}
                                                    {schedule.status === 'paused' && (
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                        const id = schedule._id || schedule.id;
                                                        if (id) handleResumeSchedule(id);
                                                    }}
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
                </>
            )}

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this scheduled contribution of {scheduleToCancel && typeof scheduleToCancel.amount === 'number' ? formatCurrency(scheduleToCancel.amount) : '₦0'} {scheduleToCancel?.frequency}?
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

export default SchedulesList; 