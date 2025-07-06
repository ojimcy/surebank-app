import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import scheduledContributionsApi, {
    CreateSchedulePayload,
    UpdateSchedulePayload,
} from '@/lib/api/scheduledContributions';
import { useToast } from '@/lib/toast-provider';
import { AxiosError } from 'axios';
import { useEffect } from 'react';

export function useScheduleQueries() {
    const queryClient = useQueryClient();
    const { success: showSuccess, error: showError } = useToast();

    // Get user schedules query
    const {
        data: schedulesData,
        isLoading: isSchedulesLoading,
        isError: isSchedulesError,
        error: schedulesError,
        refetch: refetchSchedules,
    } = useQuery({
        queryKey: ['schedules'],
        queryFn: async () => {
            const response = await scheduledContributionsApi.getUserSchedules();
            return response;
        },
    });

    // Get schedule stats query
    const {
        data: scheduleStats,
        isLoading: isScheduleStatsLoading,
        isError: isScheduleStatsError,
        error: scheduleStatsError,
        refetch: refetchScheduleStats,
    } = useQuery({
        queryKey: ['scheduleStats'],
        queryFn: async () => {
            const stats = await scheduledContributionsApi.getScheduleStats();
            return stats;
        },
    });

    // Get specific schedule by ID
    const getSchedule = async (scheduleId: string) => {
        try {
            const schedule = await scheduledContributionsApi.getSchedule(scheduleId);
            return schedule;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Get schedule error:', {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message,
            });

            showError({
                title: 'Error fetching schedule',
                description:
                    axiosError.response?.data?.message ||
                    'Could not fetch the schedule details',
            });

            throw error;
        }
    };

    // Get payment logs for a schedule
    const getPaymentLogs = async (scheduleId: string, page: number = 1, limit: number = 10) => {
        try {
            const logs = await scheduledContributionsApi.getPaymentLogs(scheduleId, page, limit);
            return logs;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Get payment logs error:', {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message,
            });

            showError({
                title: 'Error fetching payment logs',
                description:
                    axiosError.response?.data?.message ||
                    'Could not fetch the payment logs',
            });

            throw error;
        }
    };

    // Create schedule mutation
    const {
        mutate: createSchedule,
        mutateAsync: createScheduleAsync,
        isPending: isCreateScheduleLoading,
        isError: isCreateScheduleError,
    } = useMutation({
        mutationFn: async (payload: CreateSchedulePayload) => {
            try {
                const result = await scheduledContributionsApi.createSchedule(payload);
                return result;
            } catch (error) {
                console.error('Error creating schedule:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            queryClient.invalidateQueries({ queryKey: ['scheduleStats'] });
            showSuccess({
                title: 'Schedule Created',
                description: 'Your scheduled contribution has been created successfully',
            });
        },
        onError: (error: unknown) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Create schedule error:', {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message,
            });

            showError({
                title: 'Error creating schedule',
                description:
                    axiosError.response?.data?.message ||
                    'Could not create schedule. Please try again.',
            });
        },
    });

    // Update schedule mutation
    const {
        mutate: updateSchedule,
        mutateAsync: updateScheduleAsync,
        isPending: isUpdateScheduleLoading,
    } = useMutation({
        mutationFn: async ({ scheduleId, payload }: { scheduleId: string; payload: UpdateSchedulePayload }) => {
            try {
                const result = await scheduledContributionsApi.updateSchedule(scheduleId, payload);
                return result;
            } catch (error) {
                console.error('Error updating schedule:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            queryClient.invalidateQueries({ queryKey: ['scheduleStats'] });
            showSuccess({
                title: 'Schedule Updated',
                description: 'Your schedule has been updated successfully',
            });
        },
        onError: (error: unknown) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error updating schedule',
                description:
                    axiosError.response?.data?.message ||
                    'Could not update schedule. Please try again.',
            });
        },
    });

    // Pause schedule mutation
    const {
        mutate: pauseSchedule,
        mutateAsync: pauseScheduleAsync,
        isPending: isPauseScheduleLoading,
    } = useMutation({
        mutationFn: async (scheduleId: string) => {
            try {
                const result = await scheduledContributionsApi.pauseSchedule(scheduleId);
                return result;
            } catch (error) {
                console.error('Error pausing schedule:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            queryClient.invalidateQueries({ queryKey: ['scheduleStats'] });
            showSuccess({
                title: 'Schedule Paused',
                description: 'Your schedule has been paused successfully',
            });
        },
        onError: (error: unknown) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error pausing schedule',
                description:
                    axiosError.response?.data?.message ||
                    'Could not pause schedule. Please try again.',
            });
        },
    });

    // Resume schedule mutation
    const {
        mutate: resumeSchedule,
        mutateAsync: resumeScheduleAsync,
        isPending: isResumeScheduleLoading,
    } = useMutation({
        mutationFn: async (scheduleId: string) => {
            try {
                const result = await scheduledContributionsApi.resumeSchedule(scheduleId);
                return result;
            } catch (error) {
                console.error('Error resuming schedule:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            queryClient.invalidateQueries({ queryKey: ['scheduleStats'] });
            showSuccess({
                title: 'Schedule Resumed',
                description: 'Your schedule has been resumed successfully',
            });
        },
        onError: (error: unknown) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error resuming schedule',
                description:
                    axiosError.response?.data?.message ||
                    'Could not resume schedule. Please try again.',
            });
        },
    });

    // Cancel schedule mutation
    const {
        mutate: cancelSchedule,
        mutateAsync: cancelScheduleAsync,
        isPending: isCancelScheduleLoading,
    } = useMutation({
        mutationFn: async (scheduleId: string) => {
            try {
                const result = await scheduledContributionsApi.cancelSchedule(scheduleId);
                return result;
            } catch (error) {
                console.error('Error cancelling schedule:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] });
            queryClient.invalidateQueries({ queryKey: ['scheduleStats'] });
            showSuccess({
                title: 'Schedule Cancelled',
                description: 'Your schedule has been cancelled successfully',
            });
        },
        onError: (error: unknown) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error cancelling schedule',
                description:
                    axiosError.response?.data?.message ||
                    'Could not cancel schedule. Please try again.',
            });
        },
    });

    // Effect for handling query errors
    useEffect(() => {
        if (isSchedulesError && schedulesError) {
            const axiosError = schedulesError as AxiosError<{ message?: string }>;
            if (axiosError.response?.status !== 404) {
                console.error('Schedules query error:', {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data,
                    message: axiosError.message,
                });

                showError({
                    title: 'Error fetching schedules',
                    description:
                        axiosError.response?.data?.message ||
                        'Could not fetch your schedules',
                });
            }
        }
    }, [isSchedulesError, schedulesError, showError]);

    useEffect(() => {
        if (isScheduleStatsError && scheduleStatsError) {
            const axiosError = scheduleStatsError as AxiosError<{ message?: string }>;
            if (axiosError.response?.status !== 404) {
                console.error('Schedule stats query error:', {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data,
                    message: axiosError.message,
                });
            }
        }
    }, [isScheduleStatsError, scheduleStatsError, showError]);

    return {
        // Schedules data
        schedules: schedulesData?.schedules || [],
        schedulesCount: schedulesData?.totalSchedules || 0,
        scheduleStats,
        hasSchedules: (schedulesData?.schedules || []).length > 0,

        // Action methods
        createSchedule,
        createScheduleAsync,
        updateSchedule,
        updateScheduleAsync,
        pauseSchedule,
        pauseScheduleAsync,
        resumeSchedule,
        resumeScheduleAsync,
        cancelSchedule,
        cancelScheduleAsync,
        getSchedule,
        getPaymentLogs,
        refetchSchedules,
        refetchScheduleStats,

        // Loading states
        isSchedulesLoading,
        isScheduleStatsLoading,
        isCreateScheduleLoading,
        isUpdateScheduleLoading,
        isPauseScheduleLoading,
        isResumeScheduleLoading,
        isCancelScheduleLoading,

        // Error states
        isSchedulesError,
        isScheduleStatsError,
        isCreateScheduleError,
    };
} 