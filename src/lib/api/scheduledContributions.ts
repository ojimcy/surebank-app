import api from './axios';

export interface ScheduledContribution {
    _id?: string;
    id?: string;
    userId: string;
    packageId?: string;
    storedCardId: string | {
        cardType: string;
        last4: string;
        bank: string;
        id: string;
    };
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    contributionType: 'ds' | 'sb' | 'ibs';
    startDate: string;
    endDate?: string;
    nextPaymentDate: string;
    status: 'active' | 'paused' | 'cancelled' | 'completed' | 'suspended';
    isActive: boolean;
    maxRetries: number;
    totalPayments: number;
    failedPayments: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSchedulePayload {
    // Package-based targeting
    packageId: string;
    contributionType: 'ds' | 'sb' | 'ibs';
    
    // Payment details
    storedCardId: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate?: string;
}

export interface UpdateSchedulePayload {
    amount?: number;
    frequency?: 'daily' | 'weekly' | 'monthly';
    endDate?: string;
}

export interface PaymentLog {
    _id: string;
    scheduleId: string;
    amount: number;
    status: 'success' | 'failed' | 'pending';
    paymentDate: string;
    reference: string;
    errorMessage?: string;
    createdAt: string;
}

export interface RecentActivity {
    id: string;
    status: 'success' | 'failed' | 'processing';
    amount: number;
    contributionType: string;
    createdAt: string;
}

export interface ScheduleStats {
    totalSchedules: number;
    activeSchedules: number;
    pausedSchedules: number;
    suspendedSchedules?: number;
    totalContributions: number;
    successfulContributions: number;
    failedContributions: number;
    totalAmountContributed: number;
    recentActivity?: RecentActivity[];
}

export interface ScheduleListResponse {
    schedules: ScheduledContribution[];
    totalSchedules: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaymentLogsResponse {
    logs: PaymentLog[];
    totalLogs: number;
    page: number;
    limit: number;
    totalPages: number;
}

const scheduledContributionsApi = {
    /**
     * Create a new scheduled contribution
     */
    createSchedule: async (payload: CreateSchedulePayload): Promise<ScheduledContribution> => {
        const response = await api.post<ScheduledContribution>('/scheduled-contributions', payload);
        return response.data;
    },

    /**
     * Get user's scheduled contributions
     */
    getUserSchedules: async (page: number = 1, limit: number = 10): Promise<ScheduleListResponse> => {
        const response = await api.get<ScheduleListResponse>(`/scheduled-contributions?page=${page}&limit=${limit}`);
        return response.data;
    },

    /**
     * Get schedule statistics
     */
    getScheduleStats: async (): Promise<ScheduleStats> => {
        interface NestedStatsFormat {
            schedules?: {
                total?: number;
                active?: number;
                paused?: number;
                suspended?: number;
            };
            payments?: {
                total?: number;
                successful?: number;
                failed?: number;
                totalAmount?: number;
            };
            recentActivity?: RecentActivity[];
        }

        interface FlatStatsFormat {
            totalSchedules?: number;
            activeSchedules?: number;
            pausedSchedules?: number;
            suspendedSchedules?: number;
            totalContributions?: number;
            successfulContributions?: number;
            failedContributions?: number;
            totalAmountContributed?: number;
            recentActivity?: RecentActivity[];
        }

        const response = await api.get<{ success: boolean; data: NestedStatsFormat | FlatStatsFormat }>('/scheduled-contributions/stats');
        const statsData = response.data.data;
        
        // Handle both old nested format and new flat format
        if ('schedules' in statsData && 'payments' in statsData) {
            // Old nested format - transform to flat format
            const nestedData = statsData as NestedStatsFormat;
            return {
                totalSchedules: nestedData.schedules?.total || 0,
                activeSchedules: nestedData.schedules?.active || 0,
                pausedSchedules: nestedData.schedules?.paused || 0,
                suspendedSchedules: nestedData.schedules?.suspended || 0,
                totalContributions: nestedData.payments?.total || 0,
                successfulContributions: nestedData.payments?.successful || 0,
                failedContributions: nestedData.payments?.failed || 0,
                totalAmountContributed: nestedData.payments?.totalAmount || 0,
                recentActivity: nestedData.recentActivity || [],
            };
        } else {
            // New flat format - return with defaults if properties are missing
            const flatData = statsData as FlatStatsFormat;
            return {
                totalSchedules: flatData.totalSchedules || 0,
                activeSchedules: flatData.activeSchedules || 0,
                pausedSchedules: flatData.pausedSchedules || 0,
                suspendedSchedules: flatData.suspendedSchedules || 0,
                totalContributions: flatData.totalContributions || 0,
                successfulContributions: flatData.successfulContributions || 0,
                failedContributions: flatData.failedContributions || 0,
                totalAmountContributed: flatData.totalAmountContributed || 0,
                recentActivity: flatData.recentActivity || [],
            };
        }
    },

    /**
     * Get a specific schedule by ID
     */
    getSchedule: async (scheduleId: string): Promise<ScheduledContribution> => {
        const response = await api.get<{ success: boolean; message: string; data: ScheduledContribution }>(`/scheduled-contributions/${scheduleId}`);
        return response.data.data;
    },

    /**
     * Update a schedule
     */
    updateSchedule: async (scheduleId: string, payload: UpdateSchedulePayload): Promise<ScheduledContribution> => {
        const response = await api.patch<ScheduledContribution>(`/scheduled-contributions/${scheduleId}`, payload);
        return response.data;
    },

    /**
     * Pause a schedule
     */
    pauseSchedule: async (scheduleId: string): Promise<ScheduledContribution> => {
        const response = await api.patch<ScheduledContribution>(`/scheduled-contributions/${scheduleId}/pause`);
        return response.data;
    },

    /**
     * Resume a schedule
     */
    resumeSchedule: async (scheduleId: string): Promise<ScheduledContribution> => {
        const response = await api.patch<ScheduledContribution>(`/scheduled-contributions/${scheduleId}/resume`);
        return response.data;
    },

    /**
     * Cancel a schedule
     */
    cancelSchedule: async (scheduleId: string): Promise<ScheduledContribution> => {
        const response = await api.patch<ScheduledContribution>(`/scheduled-contributions/${scheduleId}/cancel`);
        return response.data;
    },

    /**
     * Get payment logs for a schedule
     */
    getPaymentLogs: async (scheduleId: string, page: number = 1, limit: number = 10): Promise<PaymentLogsResponse> => {
        const response = await api.get<{ success: boolean; message: string; data: PaymentLogsResponse }>(`/scheduled-contributions/${scheduleId}/logs?page=${page}&limit=${limit}`);
        return response.data.data;
    },

};

export default scheduledContributionsApi; 