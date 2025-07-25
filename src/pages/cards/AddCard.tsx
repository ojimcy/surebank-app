import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCardQueries } from '@/hooks/queries/useCardQueries';
import { StoreCardPayload, CardVerificationPayload } from '@/lib/api/cards';
import {
    CreditCard,
    ArrowLeft,
    Shield,
    AlertCircle,
    CheckCircle2,
    Calendar,
    Lock,
    Eye,
    EyeOff,
    Check,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'react-hot-toast';

type CardType = 'visa' | 'mastercard' | 'verve' | 'american-express' | 'unknown';

interface ValidationStatus {
    [key: string]: 'valid' | 'invalid' | 'pending';
}

interface PaystackResponse {
    reference: string;
    status: string;
    message: string;
}

function AddCard() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<CardVerificationPayload>({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        email: '',
        amount: 100 // Minimum verification amount (₦1.00)
    });
    const [errors, setErrors] = useState<Partial<CardVerificationPayload>>({});
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCvv, setShowCvv] = useState(false);
    const [cardType, setCardType] = useState<CardType>('unknown');
    const [isFormValid, setIsFormValid] = useState(false);
    const [isPaystackLoaded, setIsPaystackLoaded] = useState(false);

    const { storeCardAsync, isStoreCardLoading } = useCardQueries();
    const { user } = useAuth();

    // Set user email when component mounts
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email! }));
        }
    }, [user?.email]);

    // Load Paystack script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => setIsPaystackLoaded(true);
        script.onerror = () => {
            console.error('Failed to load Paystack script');
            toast.error('Payment system not available. Please try again later.');
        };
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    const detectCardType = (cardNumber: string): CardType => {
        const cleaned = cardNumber.replace(/\D/g, '');
        
        if (/^4/.test(cleaned)) return 'visa';
        if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
        if (/^3[47]/.test(cleaned)) return 'american-express';
        if (/^(506099|506188|650002|650003)/.test(cleaned)) return 'verve';
        
        return 'unknown';
    };

    const validateField = (field: keyof CardVerificationPayload, value: string): boolean => {
        switch (field) {
            case 'cardNumber': {
                const cleaned = value.replace(/\D/g, '');
                return cleaned.length >= 13 && cleaned.length <= 19 && luhnCheck(cleaned);
            }
            case 'expiryMonth': {
                const month = parseInt(value);
                return month >= 1 && month <= 12;
            }
            case 'expiryYear': {
                const currentYear = new Date().getFullYear() % 100;
                const inputYear = parseInt(value);
                return inputYear >= currentYear && inputYear <= currentYear + 20;
            }
            case 'cvv':
                return value.length >= 3 && value.length <= 4;
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'amount': {
                const num = parseFloat(value);
                return num >= 100 && num <= 100; // Fixed verification amount
            }
            default:
                return false;
        }
    };

    const luhnCheck = (cardNumber: string): boolean => {
        let sum = 0;
        let alternate = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let n = parseInt(cardNumber.charAt(i), 10);
            
            if (alternate) {
                n *= 2;
                if (n > 9) n = (n % 10) + 1;
            }
            
            sum += n;
            alternate = !alternate;
        }
        
        return sum % 10 === 0;
    };

    const handleInputChange = (field: keyof CardVerificationPayload, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Real-time validation
        const isValid = validateField(field, value);
        setValidationStatus(prev => ({
            ...prev,
            [field]: value ? (isValid ? 'valid' : 'invalid') : 'pending'
        }));

        // Update card type for card number
        if (field === 'cardNumber') {
            setCardType(detectCardType(value));
        }

        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    // Check overall form validity
    useEffect(() => {
        const allFieldsValid = Object.values(validationStatus).every(status => status === 'valid');
        const allFieldsFilled = Object.values(formData).every(value => {
            if (typeof value === 'string') {
                return value.trim() !== '';
            }
            return value !== null && value !== undefined;
        });
        setIsFormValid(allFieldsValid && allFieldsFilled);
    }, [validationStatus, formData]);

    const formatCardNumber = (value: string) => {
        // Remove all non-digit characters
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

        // Add spaces every 4 digits, supporting up to 19 digits
        const matches = v.match(/\d{4,19}/g);
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

    const getCardTypeDisplay = (type: CardType) => {
        switch (type) {
            case 'visa':
                return { name: 'Visa', color: 'text-blue-600', bgColor: 'bg-blue-600' };
            case 'mastercard':
                return { name: 'Mastercard', color: 'text-red-600', bgColor: 'bg-red-600' };
            case 'verve':
                return { name: 'Verve', color: 'text-green-600', bgColor: 'bg-green-600' };
            case 'american-express':
                return { name: 'American Express', color: 'text-purple-600', bgColor: 'bg-purple-600' };
            default:
                return { name: 'Card', color: 'text-gray-600', bgColor: 'bg-gray-600' };
        }
    };

    const getValidationIcon = (field: keyof CardVerificationPayload) => {
        const status = validationStatus[field];
        if (!formData[field]) return null;
        
        if (status === 'valid') {
            return <Check className="h-4 w-4 text-green-600" />;
        } else if (status === 'invalid') {
            return <X className="h-4 w-4 text-red-600" />;
        }
        return null;
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<CardVerificationPayload> = {};

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

        const initializePaystackPayment = () => {
        if (!isPaystackLoaded) {
            toast.error('Payment system not ready. Please try again.');
            return;
        }

        const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
        if (!paystackKey) {
            toast.error('Payment configuration error. Please contact support.');
            return;
        }

        // @ts-expect-error - Paystack is loaded dynamically
        const handler = window.PaystackPop.setup({
            key: paystackKey,
            email: formData.email,
            amount: formData.amount * 100, // Convert to kobo
            currency: 'NGN',
            ref: `card_verification_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            callback: function(response: PaystackResponse) {
                handleCardStorage(response.reference);
            },
            onClose: function() {
                setIsSubmitting(false);
                toast.error('Payment was cancelled');
            },
            metadata: {
                purpose: 'card_verification',
                custom_fields: [
                    {
                        display_name: "Purpose",
                        variable_name: "purpose",
                        value: "Card Verification"
                    }
                ]
            }
        });
        
        handler.openIframe();
    };

    const handleCardStorage = async (reference: string) => {
        try {
            const storePayload: StoreCardPayload = {
                paystackReference: reference,
                setAsDefault: false
            };
            
            await storeCardAsync(storePayload);
            toast.success('Card added successfully!');
            navigate('/cards');
        } catch (error) {
            console.error('Error storing card:', error);
            toast.error('Failed to save card. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        initializePaystackPayment();
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

            {/* Card Preview */}
            <div className="relative">
                <div className={`
                    relative w-full h-52 rounded-xl shadow-lg transform transition-all duration-300 
                    ${getCardTypeDisplay(cardType).bgColor} text-white overflow-hidden
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
                            <div className="text-sm font-medium">
                                {getCardTypeDisplay(cardType).name}
                            </div>
                            <div className="flex items-center space-x-1">
                                <Shield className="h-4 w-4" />
                                <span className="text-xs">Secured</span>
                            </div>
                        </div>

                        {/* Middle Section - Card Number */}
                        <div className="flex-1 flex items-center">
                            <div className="space-y-2">
                                <div className="text-lg font-mono tracking-wider">
                                    {formatCardNumber(formData.cardNumber) || '•••• •••• •••• ••••'}
                                </div>
                                {cardType !== 'unknown' && (
                                    <div className="text-sm opacity-90">
                                        {getCardTypeDisplay(cardType).name}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="flex justify-between items-end">
                            <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">
                                    {formData.expiryMonth || 'MM'}/{formData.expiryYear || 'YY'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Lock className="h-3 w-3" />
                                <span className="text-xs">
                                    CVV: {showCvv ? formData.cvv || '•••' : '•••'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Verification Notice */}
            <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                    <strong>Card Verification Process:</strong> To securely add your card, we'll charge ₦1.00 for verification. This amount will be refunded immediately. Your card details are encrypted and your CVV is never stored.
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
                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on" method="post" action="#">
                        {/* Card Number */}
                        <div>
                            <Label htmlFor="cardNumber" className="flex items-center justify-between">
                                <span>Card Number</span>
                                {cardType !== 'unknown' && (
                                    <span className={`text-xs font-medium ${getCardTypeDisplay(cardType).color}`}>
                                        {getCardTypeDisplay(cardType).name}
                                    </span>
                                )}
                            </Label>
                            <div className="relative">
                                <Input
                                    id="cardNumber"
                                    name="cardNumber"
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    value={formatCardNumber(formData.cardNumber)}
                                    onChange={(e) => handleCardNumberChange(e.target.value)}
                                    maxLength={23}
                                    autoComplete="cc-number"
                                    className={`pr-10 ${
                                        errors.cardNumber 
                                            ? 'border-red-500' 
                                            : validationStatus.cardNumber === 'valid'
                                                ? 'border-green-500'
                                                : ''
                                    }`}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {getValidationIcon('cardNumber')}
                                </div>
                            </div>
                            {errors.cardNumber && (
                                <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
                            )}
                            {validationStatus.cardNumber === 'valid' && !errors.cardNumber && (
                                <p className="text-sm text-green-600 mt-1">Valid card number</p>
                            )}
                        </div>

                        {/* Expiry Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="expiryMonth">Expiry Month</Label>
                                <div className="relative">
                                    <Input
                                        id="expiryMonth"
                                        name="expiryMonth"
                                        type="text"
                                        placeholder="MM"
                                        value={formData.expiryMonth}
                                        onChange={(e) => handleInputChange('expiryMonth', e.target.value.replace(/\D/g, ''))}
                                        maxLength={2}
                                        autoComplete="cc-exp-month"
                                        className={`pr-10 ${
                                            errors.expiryMonth 
                                                ? 'border-red-500' 
                                                : validationStatus.expiryMonth === 'valid'
                                                    ? 'border-green-500'
                                                    : ''
                                        }`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        {getValidationIcon('expiryMonth')}
                                    </div>
                                </div>
                                {errors.expiryMonth && (
                                    <p className="text-sm text-red-600 mt-1">{errors.expiryMonth}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="expiryYear">Expiry Year</Label>
                                <div className="relative">
                                    <Input
                                        id="expiryYear"
                                        name="expiryYear"
                                        type="text"
                                        placeholder="YY"
                                        value={formData.expiryYear}
                                        onChange={(e) => handleInputChange('expiryYear', e.target.value.replace(/\D/g, ''))}
                                        maxLength={2}
                                        autoComplete="cc-exp-year"
                                        className={`pr-10 ${
                                            errors.expiryYear 
                                                ? 'border-red-500' 
                                                : validationStatus.expiryYear === 'valid'
                                                    ? 'border-green-500'
                                                    : ''
                                        }`}
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        {getValidationIcon('expiryYear')}
                                    </div>
                                </div>
                                {errors.expiryYear && (
                                    <p className="text-sm text-red-600 mt-1">{errors.expiryYear}</p>
                                )}
                            </div>
                        </div>

                        {/* CVV */}
                        <div>
                            <Label htmlFor="cvv" className="flex items-center justify-between">
                                <span>CVV</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCvv(!showCvv)}
                                    className="h-auto p-1 text-xs"
                                >
                                    {showCvv ? (
                                        <>
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            Hide
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="h-3 w-3 mr-1" />
                                            Show
                                        </>
                                    )}
                                </Button>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="cvv"
                                    name="cvv"
                                    type={showCvv ? "text" : "password"}
                                    placeholder="123"
                                    value={formData.cvv}
                                    onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                                    maxLength={4}
                                    autoComplete="cc-csc"
                                    className={`pr-10 ${
                                        errors.cvv 
                                            ? 'border-red-500' 
                                            : validationStatus.cvv === 'valid'
                                                ? 'border-green-500'
                                                : ''
                                    }`}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {getValidationIcon('cvv')}
                                </div>
                            </div>
                            {errors.cvv && (
                                <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                3-4 digit code on the back of your card
                            </p>
                        </div>

                        {/* Form Validation Summary */}
                        {(formData.cardNumber || formData.expiryMonth || formData.expiryYear || formData.cvv) && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-sm mb-2">Validation Status</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center space-x-2">
                                        {getValidationIcon('cardNumber') || <div className="h-4 w-4" />}
                                        <span>Card Number</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getValidationIcon('expiryMonth') || <div className="h-4 w-4" />}
                                        <span>Expiry Month</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getValidationIcon('expiryYear') || <div className="h-4 w-4" />}
                                        <span>Expiry Year</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {getValidationIcon('cvv') || <div className="h-4 w-4" />}
                                        <span>CVV</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className={`w-full transition-all duration-300 ${
                                isFormValid 
                                    ? 'bg-[#0066A1] hover:bg-[#005085]' 
                                    : 'bg-gray-400 hover:bg-gray-500'
                            }`}
                            disabled={isSubmitting || isStoreCardLoading || !isFormValid}
                        >
                            {isSubmitting || isStoreCardLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                    Adding Card...
                                </>
                            ) : isFormValid ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Verify & Add Card (₦1.00)
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Complete Form to Continue
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