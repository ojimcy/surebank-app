import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import scheduledContributionsApi, {
    ScheduledContribution,
    CreateSchedulePayload,
    UpdateSchedulePayload,
    ScheduleFilters,
    PauseSchedulePayload,
} from '@/lib/api/scheduledContributions';
import { useToast } from '@/lib/toast-provider';
import { AxiosError } from 'axios';

export function useScheduledContributionQueries() {
    const queryClient = useQueryClient();
    const { success: showSuccess, error: showError } = useToast();

    // Get user's scheduled contributions
    const {
        data: schedules = [] as ScheduledContribution[],
        isLoading: isSchedulesLoading,
        isError: isSchedulesError,
        error: schedulesError,
        refetch: refetchSchedules,
    } = useQuery({
        queryKey: ['scheduledContributions'],
        queryFn: () => scheduledContributionsApi.getUserSchedules(),
        retry: 1,
    });

    // Get schedule statistics
    const {
        data: stats,
        isLoading: isStatsLoading,
        refetch: refetchStats,
    } = useQuery({
        queryKey: ['scheduleStats'],
        queryFn: scheduledContributionsApi.getScheduleStats,
        retry: 1,
    });

    // Create schedule mutation
    const createScheduleMutation = useMutation({
        mutationFn: (payload: CreateSchedulePayload) =>
            scheduledContributionsApi.createSchedule(payload),
        onSuccess: (newSchedule) => {
            queryClient.setQueryData(['scheduledContributions'], (oldSchedules: ScheduledContribution[] = []) => [
                newSchedule,
                ...oldSchedules,
            ]);

            // Invalidate stats to refresh counts
            queryClient.invalidateQueries({ queryKey: ['scheduleStats'] });

            showSuccess({
                title: 'Schedule Created Successfully!',
                description: 'Your automatic contribution schedule has been set up.',
            });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showError({
                title: 'Failed to Create Schedule',
                description: error.response?.data?.message || 'Could not create your schedule. Please try again.',
            });
        },
    });

    // Update schedule mutation
    const updateScheduleMutation = useMutation({
        mutationFn: ({ scheduleId, payload }: { scheduleId: string; payload: UpdateSchedulePayload }) =>
            scheduledContributionsApi.updateSchedule(scheduleId, payload),
        onSuccess: (updatedSchedule) => {
            queryClient.setQueryData(['scheduledContributions'], (oldSchedules: ScheduledContribution[] = []) =>
                oldSchedules.map((schedule) =>
                    schedule._id === updatedSchedule._id ? updatedSchedule : schedule
                )
            );

            // Update individual schedule cache if it exists
            queryClient.setQueryData(['scheduledContribution', updatedSchedule._id], updatedSchedule);

            showSuccess({
                title: 'Schedule Updated',
                description: 'Your contribution schedule has been updated successfully.',
            });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showError({
                title: 'Failed to Update Schedule',
                description: error.response?.data?.message || 'Could not update your schedule. Please try again.',
            });
        },
    });

    // Pause schedule mutation
    const pauseScheduleMutation = useMutation({
        mutationFn: ({ scheduleId, payload }: { scheduleId: string; payload?: PauseSchedulePayload }) =>
            scheduledContributionsApi.pauseSchedule(scheduleId, payload),
        onSuccess: (updatedSchedule) => {
            queryClient.setQueryData(['scheduledContributions'], (oldSchedules: ScheduledContribution[] = []) =>
                oldSchedules.map((schedule) =>
                    schedule._id === updatedSchedule._id ? updatedSchedule : schedule
                )
            );

            queryClient.setQueryData(['scheduledContribution', updatedSchedule._id], updatedSchedule);
            queryClient.invalidateQueries({ queryKey: ['scheduleStats'] });

            showSuccess({
                title: 'Schedule Paused',
                description: 'Your contribution schedule has been paused successfully.',
            });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showError({
                title: 'Failed to Pause Schedule',
                description: error.response?.data?.message || 'Could not pause your schedule. Please try again.',
            });
        },
    });

    // Resume schedule mutation
    const resumeScheduleMutation = useMutation({
        mutationFn: (scheduleId: string) => scheduledContributionsApi.resumeSchedule(scheduleId),
        onSuccess: (updatedSchedule) => {
            queryClient.setQueryData(['scheduledContributions'], (oldSchedules: ScheduledContribution[] = []) =>
                oldSchedules.map((schedule) =>
                    schedule._id === updatedSchedule._id ? updatedSchedule : schedule
                )
            );

            queryClient.setQueryData(['scheduledContribution', updatedSchedule._id], updatedSchedule);
            queryClient.invalidateQueries({ queryKey: ['scheduleStats'] });

            showSuccess({
                title: 'Schedule Resumed',
                description: 'Your contribution schedule has been resumed successfully.',
            });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showError({
                title: 'Failed to Resume Schedule',
                description: error.response?.data?.message || 'Could not resume your schedule. Please try again.',
            });
        },
    });

    // Cancel schedule mutation
    const cancelScheduleMutation = useMutation({
        mutationFn: (scheduleId: string) => scheduledContributionsApi.cancelSchedule(scheduleId),
        onSuccess: (updatedSchedule) => {
            queryClient.setQueryData(['scheduledContributions'], (oldSchedules: ScheduledContribution[] = []) =>
                oldSchedules.map((schedule) =>
                    schedule._id === updatedSchedule._id ? updatedSchedule : schedule
                )
            );

            queryClient.setQueryData(['scheduledContribution', updatedSchedule._id], updatedSchedule);
            queryClient.invalidateQueries({ queryKey: ['scheduleStats'] });

            showSuccess({
                title: 'Schedule Cancelled',
                description: 'Your contribution schedule has been cancelled successfully.',
            });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showError({
                title: 'Failed to Cancel Schedule',
                description: error.response?.data?.message || 'Could not cancel your schedule. Please try again.',
            });
        },
    });

    // Get specific schedule
    const getSchedule = async (scheduleId: string) => {
        try {
            const schedule = await queryClient.fetchQuery({
                queryKey: ['scheduledContribution', scheduleId],
                queryFn: () => scheduledContributionsApi.getSchedule(scheduleId),
                staleTime: 5 * 60 * 1000, // 5 minutes
            });
            return schedule;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error Fetching Schedule',
                description: axiosError.response?.data?.message || 'Could not fetch schedule details.',
            });
            throw error;
        }
    };

    // Get payment logs for a schedule
    const getPaymentLogs = async (
        scheduleId: string,
        options: { page?: number; limit?: number; status?: string } = {}
    ) => {
        try {
            return await scheduledContributionsApi.getPaymentLogs(scheduleId, options);
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error Fetching Payment Logs',
                description: axiosError.response?.data?.message || 'Could not fetch payment history.',
            });
            throw error;
        }
    };

    // Filter schedules by status
    const getSchedulesByStatus = (status: string) => {
        return schedules.filter(schedule => status === 'all' || schedule.status === status);
    };

    // Get filtered schedules
    const getFilteredSchedules = (filters: ScheduleFilters) => {
        return schedules.filter(schedule => {
            if (filters.status && filters.status !== 'all' && schedule.status !== filters.status) {
                return false;
            }
            if (filters.contributionType && schedule.contributionType !== filters.contributionType) {
                return false;
            }
            if (filters.isActive !== undefined && schedule.isActive !== filters.isActive) {
                return false;
            }
            return true;
        });
    };

    // Calculate next payment info
    const getUpcomingPayments = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return schedules.filter(schedule => {
            if (schedule.status !== 'active') return false;
            const nextPayment = new Date(schedule.nextPaymentDate);
            return nextPayment <= tomorrow;
        });
    };

    // Get active schedules
    const activeSchedules = schedules.filter(schedule => schedule.status === 'active');
    const pausedSchedules = schedules.filter(schedule => schedule.status === 'paused');
    const completedSchedules = schedules.filter(schedule => schedule.status === 'completed');
    const upcomingPayments = getUpcomingPayments();

    return {
        // Data and loading states
        schedules,
        stats,
        isSchedulesLoading,
        isStatsLoading,
        isSchedulesError,
        schedulesError,
        hasSchedules: schedules.length > 0,

        // Filtered data
        activeSchedules,
        pausedSchedules,
        completedSchedules,
        upcomingPayments,

        // Mutations
        createSchedule: createScheduleMutation.mutateAsync,
        isCreateScheduleLoading: createScheduleMutation.isPending,

        updateSchedule: updateScheduleMutation.mutateAsync,
        isUpdateScheduleLoading: updateScheduleMutation.isPending,

        pauseSchedule: pauseScheduleMutation.mutateAsync,
        isPauseScheduleLoading: pauseScheduleMutation.isPending,

        resumeSchedule: resumeScheduleMutation.mutateAsync,
        isResumeScheduleLoading: resumeScheduleMutation.isPending,

        cancelSchedule: cancelScheduleMutation.mutateAsync,
        isCancelScheduleLoading: cancelScheduleMutation.isPending,

        // Utility functions
        getSchedule,
        getPaymentLogs,
        getSchedulesByStatus,
        getFilteredSchedules,
        refetchSchedules,
        refetchStats,
    };
} 