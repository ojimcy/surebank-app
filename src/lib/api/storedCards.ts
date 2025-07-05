import api from './axios';
import { AxiosError } from 'axios';

export interface StoredCard {
    _id: string;
    userId: string;
    authorizationCode: string;
    cardType: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    bank: string;
    isDefault: boolean;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface StoreCardPayload {
    paystackReference: string;
    setAsDefault?: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Stored Cards API functions
const storedCardsApi = {
    // Get user's stored cards
    getUserCards: async (activeOnly: boolean = true): Promise<StoredCard[]> => {
        try {
            const response = await api.get<ApiResponse<StoredCard[]>>(
                `/stored-cards?activeOnly=${activeOnly}`
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

    // Get a specific stored card
    getCard: async (cardId: string): Promise<StoredCard> => {
        const response = await api.get<ApiResponse<StoredCard>>(
            `/stored-cards/${cardId}`
        );
        return response.data.data;
    },

    // Store a card from a transaction
    storeCard: async (payload: StoreCardPayload): Promise<StoredCard> => {
        const response = await api.post<ApiResponse<StoredCard>>(
            '/stored-cards',
            payload
        );
        return response.data.data;
    },

    // Set a card as default
    setDefaultCard: async (cardId: string): Promise<StoredCard> => {
        const response = await api.patch<ApiResponse<StoredCard>>(
            `/stored-cards/${cardId}`,
            {}
        );
        return response.data.data;
    },

    // Deactivate a card
    deactivateCard: async (cardId: string): Promise<StoredCard> => {
        const response = await api.patch<ApiResponse<StoredCard>>(
            `/stored-cards/${cardId}/deactivate`,
            {}
        );
        return response.data.data;
    },

    // Delete a card
    deleteCard: async (cardId: string): Promise<void> => {
        await api.delete(`/stored-cards/${cardId}`);
    },

    // Validate a card
    validateCard: async (cardId: string): Promise<{ isValid: boolean; message: string }> => {
        const response = await api.post<ApiResponse<{ isValid: boolean; message: string }>>(
            `/stored-cards/${cardId}/validate`,
            {}
        );
        return response.data.data;
    },

    // Get default card
    getDefaultCard: async (): Promise<StoredCard | null> => {
        try {
            const response = await api.get<ApiResponse<StoredCard>>('/stored-cards/default');
            return response.data.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },
};

export default storedCardsApi; 