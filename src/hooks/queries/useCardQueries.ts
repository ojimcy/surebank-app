import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import cardsApi, { StoredCard, StoreCardPayload, ValidateCardPayload } from '@/lib/api/cards';
import { useToast } from '@/lib/toast-provider';
import { AxiosError } from 'axios';
import { useEffect } from 'react';

export function useCardQueries() {
    const queryClient = useQueryClient();
    const { success: showSuccess, error: showError } = useToast();

    // Get user cards query
    const {
        data: cards = [] as StoredCard[],
        isLoading: isCardsLoading,
        isError: isCardsError,
        error: cardsError,
        refetch: refetchCards,
    } = useQuery({
        queryKey: ['cards'],
        queryFn: async () => {
            const fetchedCards = await cardsApi.getUserCards();
            return fetchedCards;
        },
    });

    // Get default card query
    const {
        data: defaultCard,
        isLoading: isDefaultCardLoading,
        isError: isDefaultCardError,
        error: defaultCardError,
        refetch: refetchDefaultCard,
    } = useQuery({
        queryKey: ['defaultCard'],
        queryFn: async () => {
            const fetchedDefaultCard = await cardsApi.getDefaultCard();
            return fetchedDefaultCard;
        },
    });

    // Get specific card by ID
    const getCard = async (cardId: string) => {
        try {
            const card = await cardsApi.getCard(cardId);
            return card;
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Get card error:', {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message,
            });

            showError({
                title: 'Error fetching card',
                description:
                    axiosError.response?.data?.message ||
                    'Could not fetch the card details',
            });

            throw error;
        }
    };

    // Store card mutation
    const {
        mutate: storeCard,
        mutateAsync: storeCardAsync,
        isPending: isStoreCardLoading,
        isError: isStoreCardError,
    } = useMutation({
        mutationFn: async (payload: StoreCardPayload) => {
            try {
                const result = await cardsApi.storeCard(payload);
                return result;
            } catch (error) {
                console.error('Error storing card:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            queryClient.invalidateQueries({ queryKey: ['defaultCard'] });
            showSuccess({
                title: 'Card Added',
                description: 'Your card has been added successfully',
            });
        },
        onError: (error: unknown) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Store card error:', {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message,
            });

            showError({
                title: 'Error adding card',
                description:
                    axiosError.response?.data?.message ||
                    'Could not add card. Please try again.',
            });
        },
    });

    // Set default card mutation
    const {
        mutate: setDefaultCard,
        mutateAsync: setDefaultCardAsync,
        isPending: isSetDefaultCardLoading,
    } = useMutation({
        mutationFn: async (cardId: string) => {
            try {
                const result = await cardsApi.setDefaultCard(cardId);
                return result;
            } catch (error) {
                console.error('Error setting default card:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            queryClient.invalidateQueries({ queryKey: ['defaultCard'] });
            showSuccess({
                title: 'Default Card Updated',
                description: 'Your default card has been updated successfully',
            });
        },
        onError: (error: unknown) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error updating default card',
                description:
                    axiosError.response?.data?.message ||
                    'Could not update default card. Please try again.',
            });
        },
    });

    // Delete card mutation
    const {
        mutate: deleteCard,
        mutateAsync: deleteCardAsync,
        isPending: isDeleteCardLoading,
    } = useMutation({
        mutationFn: async (cardId: string) => {
            try {
                await cardsApi.deleteCard(cardId);
                return cardId;
            } catch (error) {
                console.error('Error deleting card:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            queryClient.invalidateQueries({ queryKey: ['defaultCard'] });
            showSuccess({
                title: 'Card Deleted',
                description: 'Your card has been deleted successfully',
            });
        },
        onError: (error: unknown) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error deleting card',
                description:
                    axiosError.response?.data?.message ||
                    'Could not delete card. Please try again.',
            });
        },
    });

    // Deactivate card mutation
    const {
        mutate: deactivateCard,
        mutateAsync: deactivateCardAsync,
        isPending: isDeactivateCardLoading,
    } = useMutation({
        mutationFn: async (cardId: string) => {
            try {
                const result = await cardsApi.deactivateCard(cardId);
                return result;
            } catch (error) {
                console.error('Error deactivating card:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            queryClient.invalidateQueries({ queryKey: ['defaultCard'] });
            showSuccess({
                title: 'Card Deactivated',
                description: 'Your card has been deactivated successfully',
            });
        },
        onError: (error: unknown) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error deactivating card',
                description:
                    axiosError.response?.data?.message ||
                    'Could not deactivate card. Please try again.',
            });
        },
    });

    // Validate card mutation
    const {
        mutate: validateCard,
        mutateAsync: validateCardAsync,
        isPending: isValidateCardLoading,
    } = useMutation({
        mutationFn: async ({ cardId, payload }: { cardId: string; payload: ValidateCardPayload }) => {
            try {
                const result = await cardsApi.validateCard(cardId, payload);
                return result;
            } catch (error) {
                console.error('Error validating card:', error);
                throw error;
            }
        },
        onSuccess: () => {
            showSuccess({
                title: 'Card Validated',
                description: 'Your card has been validated successfully',
            });
        },
        onError: (error: unknown) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error validating card',
                description:
                    axiosError.response?.data?.message ||
                    'Could not validate card. Please try again.',
            });
        },
    });

    // Effect for handling query errors
    useEffect(() => {
        if (isCardsError && cardsError) {
            const axiosError = cardsError as AxiosError<{ message?: string }>;
            if (axiosError.response?.status !== 404) {
                console.error('Cards query error:', {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data,
                    message: axiosError.message,
                });

                showError({
                    title: 'Error fetching cards',
                    description:
                        axiosError.response?.data?.message ||
                        'Could not fetch your cards',
                });
            }
        }
    }, [isCardsError, cardsError, showError]);

    useEffect(() => {
        if (isDefaultCardError && defaultCardError) {
            const axiosError = defaultCardError as AxiosError<{ message?: string }>;
            if (axiosError.response?.status !== 404) {
                console.error('Default card query error:', {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data,
                    message: axiosError.message,
                });
            }
        }
    }, [isDefaultCardError, defaultCardError, showError]);

    return {
        // Cards data
        cards,
        defaultCard,
        hasCards: cards.length > 0,

        // Action methods
        storeCard,
        storeCardAsync,
        setDefaultCard,
        setDefaultCardAsync,
        deleteCard,
        deleteCardAsync,
        deactivateCard,
        deactivateCardAsync,
        validateCard,
        validateCardAsync,
        getCard,
        refetchCards,
        refetchDefaultCard,

        // Loading states
        isCardsLoading,
        isDefaultCardLoading,
        isStoreCardLoading,
        isSetDefaultCardLoading,
        isDeleteCardLoading,
        isDeactivateCardLoading,
        isValidateCardLoading,

        // Error states
        isCardsError,
        isDefaultCardError,
        isStoreCardError,
    };
} 