import api from './axios';

// Raw API response interface
interface StoredCardApiResponse {
    id: string;
    userId: string;
    cardType: string;
    bank: string;
    isDefault: boolean;
    isActive: boolean;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    authorizationCode: string;
    signature: string;
    lastValidated: string;
    failedAttempts: number;
    metadata: {
        bin: string;
        channel: string;
        countryCode: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Frontend interface (for backward compatibility)
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

// Transform API response to frontend interface
const transformStoredCard = (apiCard: StoredCardApiResponse): StoredCard => ({
    _id: apiCard.id,
    userId: apiCard.userId,
    cardNumber: `•••• •••• •••• ${apiCard.last4}`,
    cardType: apiCard.cardType,
    bank: apiCard.bank,
    isDefault: apiCard.isDefault,
    isActive: apiCard.isActive,
    lastFourDigits: apiCard.last4,
    expiryMonth: apiCard.expiryMonth,
    expiryYear: apiCard.expiryYear,
    authorizationCode: apiCard.authorizationCode,
    createdAt: apiCard.createdAt,
    updatedAt: apiCard.updatedAt,
});

export interface StoreCardPayload {
    paystackReference: string;
    setAsDefault?: boolean;
}

export interface CardVerificationPayload {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    email: string;
    amount: number;
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
     * Store a new card using Paystack transaction reference
     */
    storeCard: async (payload: StoreCardPayload): Promise<StoredCard> => {
        const response = await api.post<{data: StoredCardApiResponse}>('/stored-cards', payload);
        return transformStoredCard(response.data.data);
    },

    /**
     * Initialize card verification payment with Paystack
     */
    initializeCardVerification: async (payload: CardVerificationPayload) => {
        // This would typically go through your backend to initialize a Paystack transaction
        // For now, returning a mock structure
        return {
            authorization_url: `https://checkout.paystack.com/...`,
            access_code: 'access_code_here',
            reference: `ref_${Date.now()}`
        };
    },

    /**
     * Get all user cards
     */
    getUserCards: async (): Promise<StoredCard[]> => {
        const response = await api.get<{data: StoredCardApiResponse[]}>('/stored-cards');
        return response.data.data.map(transformStoredCard);
    },

    /**
     * Get default card
     */
    getDefaultCard: async (): Promise<StoredCard | null> => {
        const response = await api.get<{data: StoredCardApiResponse | null}>('/stored-cards/default');
        return response.data.data ? transformStoredCard(response.data.data) : null;
    },

    /**
     * Get a specific card by ID
     */
    getCard: async (cardId: string): Promise<StoredCard> => {
        console.log('cardsApi.getCard: Making request to:', `/stored-cards/${cardId}`);
        try {
            const response = await api.get<{data: StoredCardApiResponse}>(`/stored-cards/${cardId}`, {
                timeout: 10000 // 10 second timeout
            });
            console.log('cardsApi.getCard: Raw API response:', response.data);
            return transformStoredCard(response.data.data);
        } catch (error) {
            console.error('cardsApi.getCard: Request failed:', error);
            throw error;
        }
    },

    /**
     * Set a card as default
     */
    setDefaultCard: async (cardId: string): Promise<StoredCard> => {
        const response = await api.patch<{data: StoredCardApiResponse}>(`/stored-cards/${cardId}`, { isDefault: true });
        return transformStoredCard(response.data.data);
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
        const response = await api.patch<{data: StoredCardApiResponse}>(`/stored-cards/${cardId}/deactivate`);
        return transformStoredCard(response.data.data);
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