import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCardQueries } from '@/hooks/queries/useCardQueries';
import { usePinVerification } from '@/hooks/usePinVerification';
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
    Shield,
    Calendar,
    Activity,
    TrendingUp,
    Settings,
    CheckCircle
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
    const { verifyPin, PinVerificationModal } = usePinVerification();
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

    const confirmDelete = async () => {
        if (cardToDelete) {
            // Verify PIN before deleting card
            const pinVerified = await verifyPin({
                title: 'Delete Card',
                description: `Enter your PIN to delete the card ending in ${cardToDelete.lastFourDigits}`
            });

            if (!pinVerified) {
                setIsDeleteDialogOpen(false);
                return;
            }

            deleteCard(cardToDelete._id);
            setIsDeleteDialogOpen(false);
            setCardToDelete(null);
        }
    };

    const handleSetDefault = async (card: StoredCard) => {
        // Verify PIN before setting default card
        const pinVerified = await verifyPin({
            title: 'Set Default Card',
            description: `Enter your PIN to set the card ending in ${card.lastFourDigits} as default`
        });

        if (pinVerified) {
            setDefaultCard(card._id);
        }
    };

    const handleDeactivate = async (card: StoredCard) => {
        // Verify PIN before deactivating card
        const pinVerified = await verifyPin({
            title: 'Deactivate Card',
            description: `Enter your PIN to deactivate the card ending in ${card.lastFourDigits}`
        });

        if (pinVerified) {
            deactivateCard(card._id);
        }
    };

    const getCardTypeIcon = (cardType: string) => {
        switch (cardType.toLowerCase()) {
            case 'visa':
                return <div className="text-lg font-bold text-blue-600">VISA</div>;
            case 'mastercard':
                return <div className="text-lg font-bold text-red-600">MC</div>;
            case 'verve':
                return <div className="text-lg font-bold text-green-600">VERVE</div>;
            default:
                return <CreditCard className="h-6 w-6" />;
        }
    };

    const getCardGradient = (index: number) => {
        const gradients = [
            'bg-gradient-to-br from-blue-600 to-blue-800',
            'bg-gradient-to-br from-purple-600 to-purple-800',
            'bg-gradient-to-br from-green-600 to-green-800',
            'bg-gradient-to-br from-red-600 to-red-800',
            'bg-gradient-to-br from-indigo-600 to-indigo-800',
        ];
        return gradients[index % gradients.length];
    };


    const activeCards = Array.isArray(cards) ? cards.filter(card => card.isActive) : [];
    const defaultCard = Array.isArray(cards) ? cards.find(card => card.isDefault) : undefined;
    const cardStats = {
        total: Array.isArray(cards) ? cards.length : 0,
        active: activeCards.length,
        hasDefault: !!defaultCard,
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

            {/* Cards Statistics */}
            {hasCards && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Cards</p>
                                    <p className="text-2xl font-bold text-[#0066A1]">{cardStats.total}</p>
                                </div>
                                <div className="p-3 bg-[#0066A1] bg-opacity-10 rounded-lg">
                                    <CreditCard className="h-5 w-5 text-[#0066A1]" />
                                </div>
                            </div>
                            <div className="flex items-center mt-2 text-xs">
                                <Activity className="h-3 w-3 text-gray-500 mr-1" />
                                <span className="text-gray-500">Stored securely</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active Cards</p>
                                    <p className="text-2xl font-bold text-green-600">{cardStats.active}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                            </div>
                            <div className="flex items-center mt-2 text-xs">
                                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                                <span className="text-green-600">Ready for use</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Default Card</p>
                                    <p className="text-lg font-bold">
                                        {defaultCard ? `•••• ${defaultCard.lastFourDigits}` : 'None set'}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Star className="h-5 w-5 text-yellow-600" />
                                </div>
                            </div>
                            <div className="flex items-center mt-2 text-xs">
                                <Shield className="h-3 w-3 text-yellow-600 mr-1" />
                                <span className="text-yellow-600">{defaultCard ? defaultCard.bank : 'Set preferred card'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Security</p>
                                    <p className="text-lg font-bold text-blue-600">Encrypted</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                            <div className="flex items-center mt-2 text-xs">
                                <Settings className="h-3 w-3 text-blue-600 mr-1" />
                                <span className="text-blue-600">PIN protected</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

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
                    <div className="space-y-3">
                        <Link to="/cards/add">
                            <Button className="bg-[#0066A1] hover:bg-[#005085] w-full">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Card
                            </Button>
                        </Link>
                        <Link to="/schedules">
                            <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                                <Calendar className="h-4 w-4 mr-2" />
                                View Scheduled Payments
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array.isArray(cards) && cards.map((card, index) => (
                        <div key={card._id} className="relative group">
                            {/* Credit Card Visual Design */}
                            <div className={`
                                relative w-full h-52 rounded-xl shadow-lg transform transition-all duration-300 
                                hover:scale-105 hover:shadow-xl cursor-pointer ${getCardGradient(index)}
                            `}>
                                {/* Card Background Pattern */}
                                <div className="absolute inset-0 rounded-xl opacity-20">
                                    <div className="absolute top-4 right-4 w-16 h-16 border border-white/30 rounded-full"></div>
                                    <div className="absolute top-8 right-8 w-8 h-8 border border-white/20 rounded-full"></div>
                                </div>

                                {/* Card Content */}
                                <div className="relative h-full p-6 flex flex-col justify-between text-white">
                                    {/* Top Section */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            {card.isDefault && (
                                                <div className="flex items-center bg-yellow-500 rounded-full px-2 py-1">
                                                    <Star className="h-3 w-3 text-white fill-current" />
                                                    <span className="text-xs font-medium ml-1">Default</span>
                                                </div>
                                            )}
                                            {!card.isActive && (
                                                <Badge variant="secondary" className="bg-gray-500 text-white">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {getCardTypeIcon(card.cardType)}
                                        </div>
                                    </div>

                                    {/* Middle Section - Card Number */}
                                    <div className="flex-1 flex items-center">
                                        <div className="space-y-2">
                                            <div className="text-lg font-mono tracking-wider">
                                                •••• •••• •••• {card.lastFourDigits}
                                            </div>
                                            <div className="text-sm opacity-90">
                                                {card.bank}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Section */}
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="h-3 w-3" />
                                            <span className="text-xs">
                                                {card.expiryMonth}/{card.expiryYear}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Shield className="h-3 w-3" />
                                            <span className="text-xs">Secured</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Actions Overlay */}
                                <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="flex space-x-2">
                                        <Link to={`/cards/${card._id}`}>
                                            <Button variant="secondary" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="secondary" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {!card.isDefault && card.isActive && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleSetDefault(card)}
                                                        disabled={isSetDefaultCardLoading}
                                                    >
                                                        <Star className="h-4 w-4 mr-2" />
                                                        Set as Default
                                                    </DropdownMenuItem>
                                                )}
                                                {card.isActive && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeactivate(card)}
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
                            </div>

                            {/* Card Info Below */}
                            <div className="mt-3 text-center">
                                <p className="font-medium text-gray-900">
                                    {card.bank} {card.cardType}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Added {new Date(card.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
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

            {/* PIN Verification Modal */}
            <PinVerificationModal />
        </div>
    );
}

export default CardsList; 