import api from './axios';

export interface StoredCard {
    _id: string;
    userId: string;
    cardNumber: string;
    cardType: string;
    bank: string;
    isDefault: boolean;
    isActive: boolean;
    lastFourDigits: string;
    expiryMonth: string;
    expiryYear: string;
    authorizationCode: string;
    createdAt: string;
    updatedAt: string;
}

export interface StoreCardPayload {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
}

export interface ValidateCardPayload {
    pin: string;
    otp?: string;
}

export interface ValidateCardResponse {
    success: boolean;
    message?: string;
    requiresOTP?: boolean;
}

const cardsApi = {
    /**
     * Store a new card
     */
    storeCard: async (payload: StoreCardPayload): Promise<StoredCard> => {
        const response = await api.post<StoredCard>('/stored-cards', payload);
        return response.data;
    },

    /**
     * Get all user cards
     */
    getUserCards: async (): Promise<StoredCard[]> => {
        const response = await api.get<StoredCard[]>('/stored-cards');
        return response.data;
    },

    /**
     * Get default card
     */
    getDefaultCard: async (): Promise<StoredCard | null> => {
        const response = await api.get<StoredCard>('/stored-cards/default');
        return response.data;
    },

    /**
     * Get a specific card by ID
     */
    getCard: async (cardId: string): Promise<StoredCard> => {
        const response = await api.get<StoredCard>(`/stored-cards/${cardId}`);
        return response.data;
    },

    /**
     * Set a card as default
     */
    setDefaultCard: async (cardId: string): Promise<StoredCard> => {
        const response = await api.patch<StoredCard>(`/stored-cards/${cardId}`, { isDefault: true });
        return response.data;
    },

    /**
     * Delete a card
     */
    deleteCard: async (cardId: string): Promise<void> => {
        await api.delete(`/stored-cards/${cardId}`);
    },

    /**
     * Deactivate a card
     */
    deactivateCard: async (cardId: string): Promise<StoredCard> => {
        const response = await api.patch<StoredCard>(`/stored-cards/${cardId}/deactivate`);
        return response.data;
    },

    /**
     * Validate a card (for PIN/OTP verification)
     */
    validateCard: async (cardId: string, payload: ValidateCardPayload): Promise<ValidateCardResponse> => {
        const response = await api.post<ValidateCardResponse>(`/stored-cards/${cardId}/validate`, payload);
        return response.data;
    },
};

export default cardsApi; 