import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCardQueries } from '@/hooks/queries/useCardQueries';
import { StoredCard } from '@/lib/api/cards';
import {
    CreditCard,
    Plus,
    Star,
    MoreVertical,
    Trash2,
    Eye,
    ArrowLeft,
    AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function CardsList() {
    const navigate = useNavigate();
    const [cardToDelete, setCardToDelete] = useState<StoredCard | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const {
        cards,
        hasCards,
        isCardsLoading,
        isCardsError,
        deleteCard,
        isDeleteCardLoading,
        setDefaultCard,
        isSetDefaultCardLoading,
        deactivateCard,
        isDeactivateCardLoading,
        refetchCards,
    } = useCardQueries();

    const handleDeleteCard = (card: StoredCard) => {
        setCardToDelete(card);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (cardToDelete) {
            deleteCard(cardToDelete._id);
            setIsDeleteDialogOpen(false);
            setCardToDelete(null);
        }
    };

    const handleSetDefault = (cardId: string) => {
        setDefaultCard(cardId);
    };

    const handleDeactivate = (cardId: string) => {
        deactivateCard(cardId);
    };

    const getCardTypeIcon = (cardType: string) => {
        return <CreditCard className="h-6 w-6" />;
    };

    const getStatusBadge = (card: StoredCard) => {
        if (!card.isActive) {
            return <Badge variant="secondary">Inactive</Badge>;
        }
        if (card.isDefault) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Default</Badge>;
        }
        return <Badge variant="outline">Active</Badge>;
    };

    if (isCardsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
            </div>
        );
    }

    if (isCardsError) {
        return (
            <div className="space-y-6">
                <div className="flex items-center mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">My Cards</h1>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        Error Loading Cards
                    </h2>
                    <p className="text-red-600 mb-4">
                        We couldn't load your cards. Please try again.
                    </p>
                    <Button onClick={() => refetchCards()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(-1)}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">My Cards</h1>
                </div>
                <Link to="/cards/add">
                    <Button className="bg-[#0066A1] hover:bg-[#005085]">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Card
                    </Button>
                </Link>
            </div>

            {/* Cards List */}
            {!hasCards ? (
                <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        No Cards Added Yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Add your first card to start making scheduled payments
                    </p>
                    <Link to="/cards/add">
                        <Button className="bg-[#0066A1] hover:bg-[#005085]">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Card
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {cards.map((card) => (
                        <Card key={card._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center justify-center w-12 h-12 bg-[#0066A1] bg-opacity-10 rounded-lg">
                                            {getCardTypeIcon(card.cardType)}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold text-lg">
                                                    •••• •••• •••• {card.lastFourDigits}
                                                </h3>
                                                {card.isDefault && (
                                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <p className="text-sm text-gray-600">
                                                    {card.bank} • {card.cardType}
                                                </p>
                                                {getStatusBadge(card)}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Expires: {card.expiryMonth}/{card.expiryYear}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Link to={`/cards/${card._id}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {!card.isDefault && card.isActive && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleSetDefault(card._id)}
                                                        disabled={isSetDefaultCardLoading}
                                                    >
                                                        <Star className="h-4 w-4 mr-2" />
                                                        Set as Default
                                                    </DropdownMenuItem>
                                                )}
                                                {card.isActive && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeactivate(card._id)}
                                                        disabled={isDeactivateCardLoading}
                                                    >
                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                        Deactivate
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteCard(card)}
                                                    className="text-red-600 hover:text-red-700"
                                                    disabled={isDeleteCardLoading}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Card</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this card ending in {cardToDelete?.lastFourDigits}?
                            This action cannot be undone and will also cancel any scheduled payments using this card.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleteCardLoading}
                        >
                            {isDeleteCardLoading ? 'Deleting...' : 'Delete Card'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default CardsList; 