import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { useCardQueries } from '@/hooks/queries/useCardQueries';
import { useAccountQueries } from '@/hooks/queries/useAccountQueries';
import { CreateSchedulePayload } from '@/lib/api/scheduledContributions';
import { formatCurrency } from '@/lib/utils';
import {
    Calendar,
    ArrowLeft,
    CreditCard,
    Wallet,
    AlertCircle,
    CheckCircle2,
    Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

function CreateSchedule() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<CreateSchedulePayload>({
        accountId: '',
        cardId: '',
        amount: 0,
        frequency: 'monthly',
        startDate: '',
        endDate: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof CreateSchedulePayload, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { createScheduleAsync, isCreateScheduleLoading } = useScheduleQueries();
    const { cards, hasCards, isCardsLoading } = useCardQueries();
    const { accounts, hasAccounts, isAccountsLoading } = useAccountQueries();

    // Set default start date to today
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({
            ...prev,
            startDate: today
        }));
    }, []);

    const handleInputChange = (field: keyof CreateSchedulePayload, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CreateSchedulePayload, string>> = {};

        // Account validation
        if (!formData.accountId) {
            newErrors.accountId = 'Please select an account';
        }

        // Card validation
        if (!formData.cardId) {
            newErrors.cardId = 'Please select a card';
        }

        // Amount validation
        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        } else if (formData.amount < 100) {
            newErrors.amount = 'Minimum amount is ₦100';
        }

        // Start date validation
        if (!formData.startDate) {
            newErrors.startDate = 'Please select a start date';
        } else {
            const startDate = new Date(formData.startDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (startDate < today) {
                newErrors.startDate = 'Start date cannot be in the past';
            }
        }

        // End date validation (optional)
        if (formData.endDate) {
            const endDate = new Date(formData.endDate);
            const startDate = new Date(formData.startDate);

            if (endDate <= startDate) {
                newErrors.endDate = 'End date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateNextPayment = () => {
        if (!formData.startDate || !formData.frequency) return null;

        const startDate = new Date(formData.startDate);
        const nextDate = new Date(startDate);

        switch (formData.frequency) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
        }

        return nextDate.toISOString().split('T')[0];
    };

    const getFrequencyDescription = (frequency: string) => {
        switch (frequency) {
            case 'daily':
                return 'Every day';
            case 'weekly':
                return 'Every week';
            case 'monthly':
                return 'Every month';
            default:
                return '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await createScheduleAsync(formData);
            navigate('/schedules');
        } catch (error) {
            console.error('Error creating schedule:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCardsLoading || isAccountsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mr-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold text-[#212529]">Create Scheduled Contribution</h1>
            </div>

            {/* Prerequisites Check */}
            {(!hasAccounts || !hasCards) && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {!hasAccounts && !hasCards && (
                            <span>You need to have at least one account and one card to create a scheduled contribution.</span>
                        )}
                        {!hasAccounts && hasCards && (
                            <span>You need to have at least one account to create a scheduled contribution.</span>
                        )}
                        {hasAccounts && !hasCards && (
                            <span>You need to have at least one card to create a scheduled contribution.</span>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {/* Information Card */}
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Scheduled contributions will automatically transfer the specified amount from your selected card to your chosen account at the selected frequency.
                </AlertDescription>
            </Alert>

            {/* Create Schedule Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        Schedule Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Account Selection */}
                        <div>
                            <Label htmlFor="accountId">Destination Account</Label>
                            <Select value={formData.accountId} onValueChange={(value) => handleInputChange('accountId', value)}>
                                <SelectTrigger className={errors.accountId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select account to contribute to" />
                                </SelectTrigger>
                                <SelectContent>
                                    {accounts?.map((account) => (
                                        <SelectItem key={account._id} value={account._id}>
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center space-x-2">
                                                    <Wallet className="h-4 w-4" />
                                                    <span>{account.accountNumber}</span>
                                                    <Badge variant="outline">{account.accountType.toUpperCase()}</Badge>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {formatCurrency(account.availableBalance)}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.accountId && (
                                <p className="text-sm text-red-600 mt-1">{errors.accountId}</p>
                            )}
                        </div>

                        {/* Card Selection */}
                        <div>
                            <Label htmlFor="cardId">Payment Card</Label>
                            <Select value={formData.cardId} onValueChange={(value) => handleInputChange('cardId', value)}>
                                <SelectTrigger className={errors.cardId ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select card for payments" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cards?.filter(card => card.isActive).map((card) => (
                                        <SelectItem key={card._id} value={card._id}>
                                            <div className="flex items-center space-x-2">
                                                <CreditCard className="h-4 w-4" />
                                                <span>•••• •••• •••• {card.lastFourDigits}</span>
                                                <span className="text-sm text-gray-500">({card.bank})</span>
                                                {card.isDefault && <Badge variant="outline">Default</Badge>}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.cardId && (
                                <p className="text-sm text-red-600 mt-1">{errors.cardId}</p>
                            )}
                        </div>

                        {/* Amount */}
                        <div>
                            <Label htmlFor="amount">Amount (₦)</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="1000"
                                value={formData.amount || ''}
                                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                                min="100"
                                step="100"
                                className={errors.amount ? 'border-red-500' : ''}
                            />
                            {errors.amount && (
                                <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Minimum amount is ₦100
                            </p>
                        </div>

                        {/* Frequency */}
                        <div>
                            <Label htmlFor="frequency">Frequency</Label>
                            <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                                {getFrequencyDescription(formData.frequency)} - {formatCurrency(formData.amount)} will be transferred {formData.frequency}
                            </p>
                        </div>

                        {/* Start Date */}
                        <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className={errors.startDate ? 'border-red-500' : ''}
                            />
                            {errors.startDate && (
                                <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
                            )}
                            {calculateNextPayment() && (
                                <p className="text-xs text-gray-500 mt-1">
                                    First payment: {formData.startDate}, Next payment: {calculateNextPayment()}
                                </p>
                            )}
                        </div>

                        {/* End Date (Optional) */}
                        <div>
                            <Label htmlFor="endDate">End Date (Optional)</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleInputChange('endDate', e.target.value)}
                                min={formData.startDate}
                                className={errors.endDate ? 'border-red-500' : ''}
                            />
                            {errors.endDate && (
                                <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty for indefinite schedule
                            </p>
                        </div>

                        {/* Summary */}
                        {formData.amount > 0 && formData.frequency && (
                            <Card className="bg-gray-50">
                                <CardContent className="p-4">
                                    <h4 className="font-medium mb-2">Schedule Summary</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><strong>Amount:</strong> {formatCurrency(formData.amount)}</p>
                                        <p><strong>Frequency:</strong> {getFrequencyDescription(formData.frequency)}</p>
                                        <p><strong>Monthly estimate:</strong> {formatCurrency(
                                            formData.frequency === 'daily' ? formData.amount * 30 :
                                                formData.frequency === 'weekly' ? formData.amount * 4 :
                                                    formData.amount
                                        )}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-[#0066A1] hover:bg-[#005085]"
                            disabled={isSubmitting || isCreateScheduleLoading || !hasAccounts || !hasCards}
                        >
                            {isSubmitting || isCreateScheduleLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                    Creating Schedule...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Create Schedule
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default CreateSchedule; 