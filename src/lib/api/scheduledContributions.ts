import api from './axios';
import { AxiosError } from 'axios';

export interface ScheduledContribution {
    _id: string;
    userId: string;
    packageId: string;
    contributionType: 'ds' | 'sb' | 'ibs';
    amount: number;
    frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
    storedCardId: string;
    startDate: string;
    endDate?: string;
    nextPaymentDate: string;
    lastPaymentDate?: string;
    status: 'active' | 'paused' | 'suspended' | 'completed' | 'cancelled';
    isActive: boolean;
    totalPayments: number;
    totalAmount: number;
    failedPayments: number;
    pausedUntil?: string;
    createdAt: string;
    updatedAt: string;

    // Populated fields
    storedCard?: {
        cardType: string;
        last4: string;
        bank: string;
    };
    packageName?: string;
}

export interface CreateSchedulePayload {
    packageId: string;
    contributionType: 'ds' | 'sb' | 'ibs';
    amount: number;
    frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
    storedCardId: string;
    startDate: string;
    endDate?: string;
}

export interface UpdateSchedulePayload {
    amount?: number;
    frequency?: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
    storedCardId?: string;
    endDate?: string;
}

export interface ScheduleFilters {
    status?: string;
    contributionType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

export interface PauseSchedulePayload {
    pausedUntil?: string;
}

export interface ScheduleStats {
    totalActive: number;
    totalScheduled: number;
    totalPaused: number;
    monthlyContributions: number;
    nextPaymentDate?: string;
}

export interface PaymentLog {
    _id: string;
    scheduledContributionId: string;
    userId: string;
    packageId: string;
    amount: number;
    status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
    authorizationCode: string;
    paystackReference?: string;
    gatewayResponse?: string;
    errorMessage?: string;
    errorCode?: string;
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: string;
    scheduledFor: string;
    processedAt?: string;
    contributionType: string;
    metadata: {
        reference: string;
        cardLast4: string;
        frequency: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    logs: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Scheduled Contributions API functions
const scheduledContributionsApi = {
    // Create a new schedule
    createSchedule: async (payload: CreateSchedulePayload): Promise<ScheduledContribution> => {
        const response = await api.post<ApiResponse<ScheduledContribution>>(
            '/scheduled-contributions',
            payload
        );
        return response.data.data;
    },

    // Get user's scheduled contributions
    getUserSchedules: async (filters: ScheduleFilters = {}): Promise<ScheduledContribution[]> => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, value.toString());
                }
            });

            const response = await api.get<ApiResponse<ScheduledContribution[]>>(
                `/scheduled-contributions?${params.toString()}`
            );
            return response.data.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 404) {
                return [];
            }
            throw error;
        }
    },

    // Get a specific schedule
    getSchedule: async (scheduleId: string): Promise<ScheduledContribution> => {
        const response = await api.get<ApiResponse<ScheduledContribution>>(
            `/scheduled-contributions/${scheduleId}`
        );
        return response.data.data;
    },

    // Update a schedule
    updateSchedule: async (
        scheduleId: string,
        payload: UpdateSchedulePayload
    ): Promise<ScheduledContribution> => {
        const response = await api.patch<ApiResponse<ScheduledContribution>>(
            `/scheduled-contributions/${scheduleId}`,
            payload
        );
        return response.data.data;
    },

    // Pause a schedule
    pauseSchedule: async (
        scheduleId: string,
        payload: PauseSchedulePayload = {}
    ): Promise<ScheduledContribution> => {
        const response = await api.patch<ApiResponse<ScheduledContribution>>(
            `/scheduled-contributions/${scheduleId}/pause`,
            payload
        );
        return response.data.data;
    },

    // Resume a schedule
    resumeSchedule: async (scheduleId: string): Promise<ScheduledContribution> => {
        const response = await api.patch<ApiResponse<ScheduledContribution>>(
            `/scheduled-contributions/${scheduleId}/resume`,
            {}
        );
        return response.data.data;
    },

    // Cancel a schedule
    cancelSchedule: async (scheduleId: string): Promise<ScheduledContribution> => {
        const response = await api.patch<ApiResponse<ScheduledContribution>>(
            `/scheduled-contributions/${scheduleId}/cancel`,
            {}
        );
        return response.data.data;
    },

    // Get payment logs for a schedule
    getPaymentLogs: async (
        scheduleId: string,
        options: { page?: number; limit?: number; status?: string } = {}
    ): Promise<PaginatedResponse<PaymentLog>> => {
        const params = new URLSearchParams();
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });

        const response = await api.get<ApiResponse<PaginatedResponse<PaymentLog>>>(
            `/scheduled-contributions/${scheduleId}/logs?${params.toString()}`
        );
        return response.data.data;
    },

    // Get schedule statistics
    getScheduleStats: async (): Promise<ScheduleStats> => {
        const response = await api.get<ApiResponse<ScheduleStats>>(
            '/scheduled-contributions/stats'
        );
        return response.data.data;
    },
};

export default scheduledContributionsApi; 