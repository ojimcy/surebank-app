import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCardQueries } from '@/hooks/queries/useCardQueries';
import { StoredCard } from '@/lib/api/cards';
import { usePinVerification } from '@/hooks/usePinVerification';

import {
    CreditCard,
    ArrowLeft,
    Star,
    Shield,
    AlertCircle,
    CheckCircle2,
    Trash2,
    MoreVertical,
    Calendar,
    Activity,
    TrendingUp,
    Clock,
    Building,
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
    const { id: cardId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [card, setCard] = useState<StoredCard | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { verifyPin, PinVerificationModal } = usePinVerification();

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

            console.log('CardDetail: Fetching card with ID:', cardId);
            setIsLoading(true);
            try {
                const cardData = await getCard(cardId);
                console.log('CardDetail: Received card data:', cardData);
                setCard(cardData);
            } catch (error) {
                console.error('CardDetail: Error fetching card:', error);
                // Handle error silently - UI will show "Card Not Found" state
            } finally {
                setIsLoading(false);
            }
        };

        fetchCard();
    }, [cardId]); // Removed getCard from dependencies to prevent infinite loop

    const handleDeleteCard = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (card) {
            // Verify PIN before deleting card
            const pinVerified = await verifyPin({
                title: 'Confirm Card Deletion',
                description: `Enter your PIN to delete card ending in ${card.lastFourDigits}`
            });

            if (!pinVerified) {
                setIsDeleteDialogOpen(false);
                return;
            }

            deleteCard(card._id);
            setIsDeleteDialogOpen(false);
            navigate('/cards');
        }
    };

    const handleSetDefault = async () => {
        if (card) {
            // Verify PIN before setting as default
            const pinVerified = await verifyPin({
                title: 'Set Default Card',
                description: `Enter your PIN to set card ending in ${card.lastFourDigits} as default`
            });

            if (!pinVerified) {
                return;
            }

            setDefaultCard(card._id);
            // Update local state to reflect the change
            setCard(prev => prev ? { ...prev, isDefault: true } : null);
        }
    };

    const handleDeactivate = async () => {
        if (card) {
            // Verify PIN before deactivating card
            const pinVerified = await verifyPin({
                title: 'Deactivate Card',
                description: `Enter your PIN to deactivate card ending in ${card.lastFourDigits}`
            });

            if (!pinVerified) {
                return;
            }

            deactivateCard(card._id);
            // Update local state to reflect the change
            setCard(prev => prev ? { ...prev, isActive: false } : null);
        }
    };


    const getCardTypeDisplay = (cardType: string) => {
        switch (cardType.toLowerCase()) {
            case 'visa':
                return { name: 'Visa', color: 'text-blue-600', bgColor: 'bg-blue-600' };
            case 'mastercard':
                return { name: 'Mastercard', color: 'text-red-600', bgColor: 'bg-red-600' };
            case 'verve':
                return { name: 'Verve', color: 'text-green-600', bgColor: 'bg-green-600' };
            case 'american-express':
                return { name: 'American Express', color: 'text-purple-600', bgColor: 'bg-purple-600' };
            default:
                return { name: cardType, color: 'text-gray-600', bgColor: 'bg-gray-600' };
        }
    };

    const getCardTypeIcon = (cardType: string) => {
        switch (cardType.toLowerCase()) {
            case 'visa':
                return <div className="text-lg font-bold text-white">VISA</div>;
            case 'mastercard':
                return <div className="text-lg font-bold text-white">MC</div>;
            case 'verve':
                return <div className="text-lg font-bold text-white">VERVE</div>;
            case 'american-express':
                return <div className="text-lg font-bold text-white">AMEX</div>;
            default:
                return <CreditCard className="h-6 w-6 text-white" />;
        }
    };

    const calculateDaysUntilExpiry = (month: string, year: string) => {
        // Parse month and year
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);
        
        // Handle both 2-digit and 4-digit year formats
        const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
        
        // Cards expire at the END of the expiry month
        // So we need to get the last day of the month
        // Create date for the first day of the NEXT month, then subtract 1 day
        const expiryDate = new Date(fullYear, monthNum, 0); // Day 0 = last day of previous month
        
        // Set to end of day (23:59:59) since cards expire at end of the expiry date
        expiryDate.setHours(23, 59, 59, 999);
        
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
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

            {/* Visual Card Display */}
            <div className="relative">
                <div className={`
                    relative w-full h-52 rounded-xl shadow-lg transform transition-all duration-300 
                    ${getCardTypeDisplay(card.cardType).bgColor} text-white overflow-hidden
                `}>
                    {/* Card Background Pattern */}
                    <div className="absolute inset-0 rounded-xl opacity-20">
                        <div className="absolute top-4 right-4 w-16 h-16 border border-white/30 rounded-full"></div>
                        <div className="absolute top-8 right-8 w-8 h-8 border border-white/20 rounded-full"></div>
                    </div>

                    {/* Card Content */}
                    <div className="relative h-full p-6 flex flex-col justify-between">
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
                </div>
            </div>

            {/* Card Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <p className="text-lg font-bold">
                                    {card.isActive ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${card.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                                {card.isActive ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircle className="h-5 w-5 text-gray-600" />
                                )}
                            </div>
                        </div>
                        <div className="flex items-center mt-2 text-xs">
                            <Activity className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="text-gray-500">
                                {card.isActive ? 'Ready for transactions' : 'Deactivated'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Card Type</p>
                                <p className="text-lg font-bold">{getCardTypeDisplay(card.cardType).name}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${getCardTypeDisplay(card.cardType).bgColor} bg-opacity-10`}>
                                <Building className={`h-5 w-5 ${getCardTypeDisplay(card.cardType).color}`} />
                            </div>
                        </div>
                        <div className="flex items-center mt-2 text-xs">
                            <Building className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="text-gray-500">{card.bank}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Expires In</p>
                                <p className="text-lg font-bold">
                                    {Math.max(0, calculateDaysUntilExpiry(card.expiryMonth, card.expiryYear))} days
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2 text-xs">
                            <Clock className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="text-gray-500">{card.expiryMonth}/{card.expiryYear}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Added</p>
                                <p className="text-lg font-bold">
                                    {Math.floor((new Date().getTime() - new Date(card.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2 text-xs">
                            <Calendar className="h-3 w-3 text-gray-500 mr-1" />
                            <span className="text-gray-500">{new Date(card.createdAt).toLocaleDateString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Information */}
            <Card>
                <CardContent className="p-6">

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <CreditCard className="h-5 w-5 mr-2" />
                                Card Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Card Number</label>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="font-mono text-lg">•••• •••• •••• {card.lastFourDigits}</span>
                                            <Badge variant="outline">{getCardTypeDisplay(card.cardType).name}</Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Issuing Bank</label>
                                        <div className="flex items-center mt-1">
                                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="font-medium">{card.bank}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                                        <div className="flex items-center mt-1">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="font-medium">{card.expiryMonth}/{card.expiryYear}</span>
                                            {calculateDaysUntilExpiry(card.expiryMonth, card.expiryYear) < 90 && (
                                                <Badge variant="destructive" className="ml-2">Expires Soon</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Status</label>
                                        <div className="flex items-center mt-1">
                                            {card.isActive ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                                                    <span className="font-medium text-green-700">Active</span>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-4 w-4 text-gray-500 mr-2" />
                                                    <span className="font-medium text-gray-700">Inactive</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Default Card</label>
                                        <div className="flex items-center mt-1">
                                            {card.isDefault ? (
                                                <>
                                                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-2" />
                                                    <span className="font-medium text-yellow-700">Yes</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Star className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span className="font-medium text-gray-700">No</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Added Date</label>
                                        <div className="flex items-center mt-1">
                                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="font-medium">{new Date(card.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Usage Information */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Activity className="h-5 w-5 mr-2" />
                                Usage Summary
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-[#0066A1]">0</div>
                                        <div className="text-sm text-gray-600">Scheduled Payments</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {Math.floor((new Date().getTime() - new Date(card.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                                        </div>
                                        <div className="text-sm text-gray-600">Days Active</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-purple-600">100%</div>
                                        <div className="text-sm text-gray-600">Security Score</div>
                                    </div>
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

            {/* PIN Verification Modal */}
            <PinVerificationModal />
        </div>
    );
}

export default CardDetail; 