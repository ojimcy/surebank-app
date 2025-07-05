import { useState } from 'react';
import { Star, MoreHorizontal, Trash2, Eye, EyeOff } from 'lucide-react';
import { StoredCard } from '@/lib/api/storedCards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { cn } from '@/lib/utils';

interface StoredCardItemProps {
    card: StoredCard;
    onSetDefault: (cardId: string) => void;
    onDelete: (cardId: string) => void;
    onDeactivate: (cardId: string) => void;
    isLoading?: boolean;
    className?: string;
}

export function StoredCardItem({
    card,
    onSetDefault,
    onDelete,
    onDeactivate,
    isLoading = false,
    className
}: StoredCardItemProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    const [showFullNumber, setShowFullNumber] = useState(false);

    const getCardTypeIcon = (cardType: string) => {
        const type = cardType.toLowerCase();
        if (type.includes('visa')) return '💳';
        if (type.includes('mastercard')) return '💳';
        if (type.includes('verve')) return '💳';
        return '💳';
    };

    const getCardTypeColor = (cardType: string) => {
        const type = cardType.toLowerCase();
        if (type.includes('visa')) return 'from-blue-500 to-blue-600';
        if (type.includes('mastercard')) return 'from-red-500 to-red-600';
        if (type.includes('verve')) return 'from-green-500 to-green-600';
        return 'from-gray-500 to-gray-600';
    };

    const formatCardNumber = (last4: string) => {
        if (showFullNumber) {
            return `•••• •••• •••• ${last4}`;
        }
        return `•••• ${last4}`;
    };

    const handleSetDefault = async () => {
        try {
            await onSetDefault(card._id);
        } catch (error) {
            console.error('Error setting default card:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await onDelete(card._id);
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting card:', error);
        }
    };

    const handleDeactivate = async () => {
        try {
            await onDeactivate(card._id);
            setShowDeactivateDialog(false);
        } catch (error) {
            console.error('Error deactivating card:', error);
        }
    };

    return (
        <>
            <div className={cn(
                'relative overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md',
                !card.isActive && 'opacity-60',
                className
            )}>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            'w-8 h-8 rounded-md bg-gradient-to-br flex items-center justify-center text-white text-sm font-medium',
                            getCardTypeColor(card.cardType)
                        )}>
                            {getCardTypeIcon(card.cardType)}
                        </div>
                        <div>
                            <h3 className="font-medium text-sm text-card-foreground">
                                {card.cardType.toUpperCase()}
                            </h3>
                            <p className="text-xs text-muted-foreground">{card.bank}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {card.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Default
                            </Badge>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {!card.isDefault && (
                                    <DropdownMenuItem onClick={handleSetDefault} disabled={isLoading}>
                                        <Star className="w-4 h-4 mr-2" />
                                        Set as Default
                                    </DropdownMenuItem>
                                )}
                                {card.isActive && (
                                    <DropdownMenuItem
                                        onClick={() => setShowDeactivateDialog(true)}
                                        disabled={isLoading}
                                    >
                                        <EyeOff className="w-4 h-4 mr-2" />
                                        Deactivate
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={isLoading}
                                    className="text-destructive"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Card Number */}
                <div className="mb-3">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-card-foreground">
                            {formatCardNumber(card.last4)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setShowFullNumber(!showFullNumber)}
                        >
                            {showFullNumber ? (
                                <EyeOff className="h-3 w-3" />
                            ) : (
                                <Eye className="h-3 w-3" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Card Details */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Expires {card.expiryMonth}/{card.expiryYear}</span>
                    <div className="flex items-center gap-2">
                        {card.isVerified && (
                            <Badge variant="outline" className="text-xs">
                                Verified
                            </Badge>
                        )}
                        {!card.isActive && (
                            <Badge variant="destructive" className="text-xs">
                                Inactive
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleDelete}
                title="Delete Payment Card"
                description="Are you sure you want to delete this payment card? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                destructive
            />

            {/* Deactivate Confirmation Dialog */}
            <ConfirmationDialog
                open={showDeactivateDialog}
                onOpenChange={setShowDeactivateDialog}
                onConfirm={handleDeactivate}
                title="Deactivate Payment Card"
                description="Are you sure you want to deactivate this payment card? You can reactivate it later."
                confirmText="Deactivate"
                cancelText="Cancel"
            />
        </>
    );
} 