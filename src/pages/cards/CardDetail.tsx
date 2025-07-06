import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCardQueries } from '@/hooks/queries/useCardQueries';
import { StoredCard } from '@/lib/api/cards';
import { formatDate } from '@/lib/utils';
import {
    CreditCard,
    ArrowLeft,
    Star,
    Shield,
    AlertCircle,
    CheckCircle2,
    Trash2,
    MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function CardDetail() {
    const { cardId } = useParams<{ cardId: string }>();
    const navigate = useNavigate();
    const [card, setCard] = useState<StoredCard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const {
        getCard,
        deleteCard,
        isDeleteCardLoading,
        setDefaultCard,
        isSetDefaultCardLoading,
        deactivateCard,
        isDeactivateCardLoading,
    } = useCardQueries();

    useEffect(() => {
        const fetchCard = async () => {
            if (!cardId) return;

            setIsLoading(true);
            try {
                const cardData = await getCard(cardId);
                setCard(cardData);
            } catch (error) {
                console.error('Error fetching card:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCard();
    }, [cardId, getCard]);

    const handleDeleteCard = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (card) {
            deleteCard(card._id);
            setIsDeleteDialogOpen(false);
            navigate('/cards');
        }
    };

    const handleSetDefault = () => {
        if (card) {
            setDefaultCard(card._id);
            // Update local state to reflect the change
            setCard(prev => prev ? { ...prev, isDefault: true } : null);
        }
    };

    const handleDeactivate = () => {
        if (card) {
            deactivateCard(card._id);
            // Update local state to reflect the change
            setCard(prev => prev ? { ...prev, isActive: false } : null);
        }
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

    const getCardTypeIcon = () => {
        return <CreditCard className="h-8 w-8 text-[#0066A1]" />;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
            </div>
        );
    }

    if (!card) {
        return (
            <div className="space-y-6">
                <div className="flex items-center mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/cards')}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">Card Details</h1>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        Card Not Found
                    </h2>
                    <p className="text-red-600 mb-4">
                        The card you're looking for doesn't exist or has been deleted.
                    </p>
                    <Button onClick={() => navigate('/cards')}>
                        Back to Cards
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/cards')}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">Card Details</h1>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {!card.isDefault && card.isActive && (
                            <DropdownMenuItem
                                onClick={handleSetDefault}
                                disabled={isSetDefaultCardLoading}
                            >
                                <Star className="h-4 w-4 mr-2" />
                                Set as Default
                            </DropdownMenuItem>
                        )}
                        {card.isActive && (
                            <DropdownMenuItem
                                onClick={handleDeactivate}
                                disabled={isDeactivateCardLoading}
                            >
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Deactivate
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onClick={handleDeleteCard}
                            className="text-red-600 hover:text-red-700"
                            disabled={isDeleteCardLoading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Card Display */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-16 h-16 bg-[#0066A1] bg-opacity-10 rounded-xl">
                                {getCardTypeIcon(card.cardType)}
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h2 className="text-2xl font-bold">
                                        •••• •••• •••• {card.lastFourDigits}
                                    </h2>
                                    {card.isDefault && (
                                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-gray-600">
                                        {card.bank} • {card.cardType}
                                    </p>
                                    {getStatusBadge(card)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Card Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Card Type</p>
                                    <p className="font-medium">{card.cardType}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Bank</p>
                                    <p className="font-medium">{card.bank}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Expiry Date</p>
                                    <p className="font-medium">{card.expiryMonth}/{card.expiryYear}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Status & Settings</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium">{card.isActive ? 'Active' : 'Inactive'}</p>
                                        {card.isActive && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Default Card</p>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium">{card.isDefault ? 'Yes' : 'No'}</p>
                                        {card.isDefault && (
                                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Added On</p>
                                    <p className="font-medium">{formatDate(card.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!card.isDefault && card.isActive && (
                    <Button
                        onClick={handleSetDefault}
                        disabled={isSetDefaultCardLoading}
                        className="bg-[#0066A1] hover:bg-[#005085]"
                    >
                        {isSetDefaultCardLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Setting...
                            </>
                        ) : (
                            <>
                                <Star className="h-4 w-4 mr-2" />
                                Set as Default
                            </>
                        )}
                    </Button>
                )}
                {card.isActive && (
                    <Button
                        onClick={handleDeactivate}
                        disabled={isDeactivateCardLoading}
                        variant="outline"
                    >
                        {isDeactivateCardLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-600 mr-2"></div>
                                Deactivating...
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Deactivate Card
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Security Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Security Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-sm">Encrypted Storage</h4>
                                <p className="text-xs text-gray-600">
                                    Your card information is encrypted and stored securely
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-sm">Secure Transactions</h4>
                                <p className="text-xs text-gray-600">
                                    All transactions are processed through secure payment gateways
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-sm">CVV Not Stored</h4>
                                <p className="text-xs text-gray-600">
                                    Your CVV is never stored on our servers for security
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Card</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this card ending in {card.lastFourDigits}?
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

export default CardDetail; 