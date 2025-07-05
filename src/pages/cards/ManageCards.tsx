import { useState } from 'react';
import { Plus, CreditCard, AlertCircle, Search } from 'lucide-react';
import { useStoredCardQueries } from '@/hooks/queries/useStoredCardQueries';
import { StoredCardItem } from '@/components/cards/StoredCardItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function ManageCards() {
    const [searchTerm, setSearchTerm] = useState('');

    const {
        cards,
        defaultCard,
        isCardsLoading,
        hasCards,
        activeCards,
        setDefaultCard,
        deleteCard,
        deactivateCard,
        isSetDefaultCardLoading,
        isDeleteCardLoading,
        isDeactivateCardLoading,
    } = useStoredCardQueries();

    const filteredCards = cards.filter(card =>
        card.cardType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.last4.includes(searchTerm)
    );

    const handleAddCard = () => {
        // TODO: Navigate to add card flow or show dialog
        console.log('Add card clicked');
    };

    if (isCardsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Payment Cards</h1>
                    <p className="text-muted-foreground">
                        Manage your saved payment cards for automatic contributions
                    </p>
                </div>

                <Button onClick={handleAddCard} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Card
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-card-foreground">Total Cards</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-card-foreground">
                        {cards.length}
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-card-foreground">Active Cards</span>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-card-foreground">
                        {activeCards.length}
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium text-card-foreground">Default Card</span>
                    </div>
                    <div className="mt-2 text-sm text-card-foreground">
                        {defaultCard ?
                            `${defaultCard.cardType} •••• ${defaultCard.last4}` :
                            'No default card set'
                        }
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search cards by type, bank, or last 4 digits..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Cards Grid */}
            {hasCards ? (
                <div className="space-y-4">
                    {filteredCards.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCards.map((card) => (
                                <StoredCardItem
                                    key={card._id}
                                    card={card}
                                    onSetDefault={setDefaultCard}
                                    onDelete={deleteCard}
                                    onDeactivate={deactivateCard}
                                    isLoading={
                                        isSetDefaultCardLoading ||
                                        isDeleteCardLoading ||
                                        isDeactivateCardLoading
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Search className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-card-foreground mb-2">
                                No cards found
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Try adjusting your search terms
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12">
                    <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                        No Payment Cards
                    </h3>
                    <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                        Add a payment card to start setting up automatic contributions.
                        Your card details are securely stored and encrypted.
                    </p>
                    <Button onClick={handleAddCard} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Your First Card
                    </Button>
                </div>
            )}

            {/* Help Section */}
            <div className="rounded-lg border bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900 mb-1">
                            How are my cards stored?
                        </h4>
                        <p className="text-sm text-blue-800">
                            Your payment cards are tokenized and encrypted using industry-standard security.
                            We never store your full card number, only the last 4 digits are visible for identification.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 

export default ManageCards;