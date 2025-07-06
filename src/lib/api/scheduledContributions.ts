import api from './axios';

export interface ScheduledContribution {
    _id: string;
    userId: string;
    accountId: string;
    cardId: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate?: string;
    nextPaymentDate: string;
    status: 'active' | 'paused' | 'cancelled' | 'completed';
    totalContributions: number;
    successfulContributions: number;
    failedContributions: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSchedulePayload {
    accountId: string;
    cardId: string;
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

export interface ScheduleStats {
    totalSchedules: number;
    activeSchedules: number;
    pausedSchedules: number;
    totalContributions: number;
    successfulContributions: number;
    failedContributions: number;
    totalAmountContributed: number;
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
        const response = await api.get<ScheduleStats>('/scheduled-contributions/stats');
        return response.data;
    },

    /**
     * Get a specific schedule by ID
     */
    getSchedule: async (scheduleId: string): Promise<ScheduledContribution> => {
        const response = await api.get<ScheduledContribution>(`/scheduled-contributions/${scheduleId}`);
        return response.data;
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
        const response = await api.get<PaymentLogsResponse>(`/scheduled-contributions/${scheduleId}/logs?page=${page}&limit=${limit}`);
        return response.data;
    },
};

export default scheduledContributionsApi; 