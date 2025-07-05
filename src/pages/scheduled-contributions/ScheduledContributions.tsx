import { useState } from 'react';
import { Plus, Calendar, TrendingUp, AlertCircle, Search } from 'lucide-react';
import { useScheduledContributionQueries } from '@/hooks/queries/useScheduledContributionQueries';
import { ScheduledContributionCard } from '@/components/scheduled-contributions/ScheduledContributionCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

function ScheduledContributions() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const {
        stats,
        isSchedulesLoading,
        hasSchedules,
        activeSchedules,
        pausedSchedules,
        upcomingPayments,
        pauseSchedule,
        resumeSchedule,
        cancelSchedule,
        isPauseScheduleLoading,
        isResumeScheduleLoading,
        isCancelScheduleLoading,
        getFilteredSchedules,
    } = useScheduledContributionQueries();

    const filteredSchedules = getFilteredSchedules({
        status: statusFilter,
        contributionType: typeFilter,
    }).filter(schedule =>
        searchTerm === '' ||
        schedule.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.contributionType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateSchedule = () => {
        // TODO: Navigate to create schedule page
        console.log('Create schedule clicked');
    };

    const handleUpdateSchedule = (scheduleId: string) => {
        // Navigate to update schedule page
        console.log('Update schedule:', scheduleId);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    if (isSchedulesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Scheduled Contributions</h1>
                    <p className="text-muted-foreground">
                        Automate your savings with scheduled card contributions
                    </p>
                </div>

                <Button onClick={handleCreateSchedule} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Schedule
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-card-foreground">Active</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-card-foreground">
                        {stats?.totalActive || activeSchedules.length}
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-yellow-500" />
                        <span className="text-sm font-medium text-card-foreground">Paused</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-card-foreground">
                        {stats?.totalPaused || pausedSchedules.length}
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-card-foreground">Monthly</span>
                    </div>
                    <div className="mt-2 text-lg font-bold text-card-foreground">
                        {formatCurrency(stats?.monthlyContributions || 0)}
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-card-foreground">Upcoming</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-card-foreground">
                        {upcomingPayments.length}
                    </div>
                </div>
            </div>

            {/* Upcoming Payments Alert */}
            {upcomingPayments.length > 0 && (
                <div className="rounded-lg border bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-1">
                                Upcoming Payments
                            </h4>
                            <p className="text-sm text-blue-800">
                                You have {upcomingPayments.length} payment(s) scheduled for today or tomorrow.
                                Make sure your cards are active and have sufficient funds.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search schedules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="ds">Daily Savings</SelectItem>
                            <SelectItem value="sb">Savings Buying</SelectItem>
                            <SelectItem value="ibs">Interest Package</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Schedules Grid */}
            {hasSchedules ? (
                <div className="space-y-4">
                    {filteredSchedules.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredSchedules.map((schedule) => (
                                <ScheduledContributionCard
                                    key={schedule._id}
                                    schedule={schedule}
                                    onUpdate={handleUpdateSchedule}
                                    onPause={(scheduleId) => pauseSchedule({ scheduleId })}
                                    onResume={(scheduleId) => resumeSchedule(scheduleId)}
                                    onCancel={(scheduleId) => cancelSchedule(scheduleId)}
                                    isLoading={
                                        isPauseScheduleLoading ||
                                        isResumeScheduleLoading ||
                                        isCancelScheduleLoading
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Search className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-card-foreground mb-2">
                                No schedules found
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting your search terms or filters
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                        No Scheduled Contributions
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                        Automate your savings by creating scheduled contributions.
                        Set up recurring payments to your DS, SB, or IBS packages.
                    </p>
                    <Button onClick={handleCreateSchedule} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Your First Schedule
                    </Button>
                </div>
            )}

            {/* Help Section */}
            <div className="rounded-lg border bg-green-50 p-4">
                <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-green-900 mb-1">
                            Why use scheduled contributions?
                        </h4>
                        <p className="text-sm text-green-800">
                            Scheduled contributions help you save consistently without manual effort.
                            Set up automatic transfers to build your savings steadily over time.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScheduledContributions;