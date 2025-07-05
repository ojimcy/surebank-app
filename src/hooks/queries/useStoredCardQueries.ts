import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import storedCardsApi, {
    StoredCard,
    StoreCardPayload,
} from '@/lib/api/storedCards';
import { useToast } from '@/lib/toast-provider';
import { AxiosError } from 'axios';

export function useStoredCardQueries() {
    const queryClient = useQueryClient();
    const { success: showSuccess, error: showError } = useToast();

    // Get user's stored cards
    const {
        data: cards = [] as StoredCard[],
        isLoading: isCardsLoading,
        isError: isCardsError,
        error: cardsError,
        refetch: refetchCards,
    } = useQuery({
        queryKey: ['storedCards'],
        queryFn: () => storedCardsApi.getUserCards(true),
        retry: 1,
    });

    // Get default card
    const {
        data: defaultCard,
        isLoading: isDefaultCardLoading,
        refetch: refetchDefaultCard,
    } = useQuery({
        queryKey: ['defaultCard'],
        queryFn: storedCardsApi.getDefaultCard,
        retry: 1,
    });

    // Store card mutation
    const storeCardMutation = useMutation({
        mutationFn: (payload: StoreCardPayload) => storedCardsApi.storeCard(payload),
        onSuccess: (newCard) => {
            queryClient.setQueryData(['storedCards'], (oldCards: StoredCard[] = []) => [
                ...oldCards,
                newCard,
            ]);

            if (newCard.isDefault) {
                queryClient.setQueryData(['defaultCard'], newCard);
            }

            showSuccess({
                title: 'Card Saved Successfully!',
                description: 'Your payment card has been securely saved for future use.',
            });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showError({
                title: 'Failed to Save Card',
                description: error.response?.data?.message || 'Could not save your payment card. Please try again.',
            });
        },
    });

    // Set default card mutation
    const setDefaultCardMutation = useMutation({
        mutationFn: (cardId: string) => storedCardsApi.setDefaultCard(cardId),
        onSuccess: (updatedCard) => {
            // Update the cards list
            queryClient.setQueryData(['storedCards'], (oldCards: StoredCard[] = []) =>
                oldCards.map((card) => ({
                    ...card,
                    isDefault: card._id === updatedCard._id,
                }))
            );

            // Update default card
            queryClient.setQueryData(['defaultCard'], updatedCard);

            showSuccess({
                title: 'Default Card Updated',
                description: 'Your default payment card has been updated successfully.',
            });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showError({
                title: 'Failed to Update Default Card',
                description: error.response?.data?.message || 'Could not update your default card. Please try again.',
            });
        },
    });

    // Deactivate card mutation
    const deactivateCardMutation = useMutation({
        mutationFn: (cardId: string) => storedCardsApi.deactivateCard(cardId),
        onSuccess: (updatedCard) => {
            queryClient.setQueryData(['storedCards'], (oldCards: StoredCard[] = []) =>
                oldCards.map((card) =>
                    card._id === updatedCard._id ? updatedCard : card
                )
            );

            showSuccess({
                title: 'Card Deactivated',
                description: 'Your payment card has been deactivated successfully.',
            });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showError({
                title: 'Failed to Deactivate Card',
                description: error.response?.data?.message || 'Could not deactivate your card. Please try again.',
            });
        },
    });

    // Delete card mutation
    const deleteCardMutation = useMutation({
        mutationFn: (cardId: string) => storedCardsApi.deleteCard(cardId),
        onSuccess: (_, deletedCardId) => {
            queryClient.setQueryData(['storedCards'], (oldCards: StoredCard[] = []) =>
                oldCards.filter((card) => card._id !== deletedCardId)
            );

            // If deleted card was default, clear default card
            queryClient.setQueryData(['defaultCard'], (oldDefault: StoredCard | null) =>
                oldDefault?._id === deletedCardId ? null : oldDefault
            );

            showSuccess({
                title: 'Card Deleted',
                description: 'Your payment card has been permanently removed.',
            });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showError({
                title: 'Failed to Delete Card',
                description: error.response?.data?.message || 'Could not delete your card. Please try again.',
            });
        },
    });

    // Validate card mutation
    const validateCardMutation = useMutation({
        mutationFn: (cardId: string) => storedCardsApi.validateCard(cardId),
        onSuccess: (result) => {
            if (result.isValid) {
                showSuccess({
                    title: 'Card Valid',
                    description: result.message || 'Your payment card is valid and ready to use.',
                });
            } else {
                showError({
                    title: 'Card Invalid',
                    description: result.message || 'Your payment card validation failed.',
                });
            }
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            showError({
                title: 'Validation Failed',
                description: error.response?.data?.message || 'Could not validate your card. Please try again.',
            });
        },
    });

    // Get card by ID
    const getCard = async (cardId: string) => {
        try {
            return await storedCardsApi.getCard(cardId);
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            showError({
                title: 'Error Fetching Card',
                description: axiosError.response?.data?.message || 'Could not fetch card details.',
            });
            throw error;
        }
    };

    return {
        // Data and loading states
        cards,
        defaultCard,
        isCardsLoading,
        isDefaultCardLoading,
        isCardsError,
        cardsError,
        hasCards: cards.length > 0,
        activeCards: cards.filter(card => card.isActive),

        // Mutations
        storeCard: storeCardMutation.mutateAsync,
        isStoreCardLoading: storeCardMutation.isPending,

        setDefaultCard: setDefaultCardMutation.mutateAsync,
        isSetDefaultCardLoading: setDefaultCardMutation.isPending,

        deactivateCard: deactivateCardMutation.mutateAsync,
        isDeactivateCardLoading: deactivateCardMutation.isPending,

        deleteCard: deleteCardMutation.mutateAsync,
        isDeleteCardLoading: deleteCardMutation.isPending,

        validateCard: validateCardMutation.mutateAsync,
        isValidateCardLoading: validateCardMutation.isPending,

        // Utility functions
        getCard,
        refetchCards,
        refetchDefaultCard,
    };
} 