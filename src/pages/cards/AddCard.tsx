import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCardQueries } from '@/hooks/queries/useCardQueries';
import { StoreCardPayload } from '@/lib/api/cards';
import {
    CreditCard,
    ArrowLeft,
    Shield,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

function AddCard() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<StoreCardPayload>({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
    });
    const [errors, setErrors] = useState<Partial<StoreCardPayload>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { storeCardAsync, isStoreCardLoading } = useCardQueries();

    const handleInputChange = (field: keyof StoreCardPayload, value: string) => {
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

    const formatCardNumber = (value: string) => {
        // Remove all non-digit characters
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

        // Add spaces every 4 digits
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const handleCardNumberChange = (value: string) => {
        const formatted = formatCardNumber(value);
        const cleaned = formatted.replace(/\s/g, '');
        handleInputChange('cardNumber', cleaned);
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<StoreCardPayload> = {};

        // Card number validation
        if (!formData.cardNumber) {
            newErrors.cardNumber = 'Card number is required';
        } else if (formData.cardNumber.length < 13 || formData.cardNumber.length > 19) {
            newErrors.cardNumber = 'Please enter a valid card number';
        }

        // Expiry month validation
        if (!formData.expiryMonth) {
            newErrors.expiryMonth = 'Expiry month is required';
        } else if (parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) {
            newErrors.expiryMonth = 'Please enter a valid month (01-12)';
        }

        // Expiry year validation
        if (!formData.expiryYear) {
            newErrors.expiryYear = 'Expiry year is required';
        } else {
            const currentYear = new Date().getFullYear();
            const inputYear = parseInt(`20${formData.expiryYear}`);
            if (inputYear < currentYear || inputYear > currentYear + 20) {
                newErrors.expiryYear = 'Please enter a valid year';
            }
        }

        // CVV validation
        if (!formData.cvv) {
            newErrors.cvv = 'CVV is required';
        } else if (formData.cvv.length < 3 || formData.cvv.length > 4) {
            newErrors.cvv = 'Please enter a valid CVV';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await storeCardAsync(formData);
            navigate('/cards');
        } catch (error) {
            console.error('Error adding card:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
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
                <h1 className="text-2xl font-bold text-[#212529]">Add New Card</h1>
            </div>

            {/* Security Notice */}
            <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                    Your card information is encrypted and stored securely. We never store your CVV.
                </AlertDescription>
            </Alert>

            {/* Add Card Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Card Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Card Number */}
                        <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input
                                id="cardNumber"
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={formatCardNumber(formData.cardNumber)}
                                onChange={(e) => handleCardNumberChange(e.target.value)}
                                maxLength={19}
                                className={errors.cardNumber ? 'border-red-500' : ''}
                            />
                            {errors.cardNumber && (
                                <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
                            )}
                        </div>

                        {/* Expiry Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="expiryMonth">Expiry Month</Label>
                                <Input
                                    id="expiryMonth"
                                    type="text"
                                    placeholder="MM"
                                    value={formData.expiryMonth}
                                    onChange={(e) => handleInputChange('expiryMonth', e.target.value.replace(/\D/g, ''))}
                                    maxLength={2}
                                    className={errors.expiryMonth ? 'border-red-500' : ''}
                                />
                                {errors.expiryMonth && (
                                    <p className="text-sm text-red-600 mt-1">{errors.expiryMonth}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="expiryYear">Expiry Year</Label>
                                <Input
                                    id="expiryYear"
                                    type="text"
                                    placeholder="YY"
                                    value={formData.expiryYear}
                                    onChange={(e) => handleInputChange('expiryYear', e.target.value.replace(/\D/g, ''))}
                                    maxLength={2}
                                    className={errors.expiryYear ? 'border-red-500' : ''}
                                />
                                {errors.expiryYear && (
                                    <p className="text-sm text-red-600 mt-1">{errors.expiryYear}</p>
                                )}
                            </div>
                        </div>

                        {/* CVV */}
                        <div>
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                                id="cvv"
                                type="text"
                                placeholder="123"
                                value={formData.cvv}
                                onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                                maxLength={4}
                                className={errors.cvv ? 'border-red-500' : ''}
                            />
                            {errors.cvv && (
                                <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                3-4 digit code on the back of your card
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-[#0066A1] hover:bg-[#005085]"
                            disabled={isSubmitting || isStoreCardLoading}
                        >
                            {isSubmitting || isStoreCardLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                    Adding Card...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Add Card
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Additional Security Information */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-sm">Bank-level Security</h4>
                                <p className="text-xs text-gray-600">
                                    Your card data is encrypted with industry-standard security
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-sm">PCI Compliant</h4>
                                <p className="text-xs text-gray-600">
                                    We follow strict payment card industry standards
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-sm">CVV Not Stored</h4>
                                <p className="text-xs text-gray-600">
                                    Your CVV is never stored on our servers
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default AddCard; 