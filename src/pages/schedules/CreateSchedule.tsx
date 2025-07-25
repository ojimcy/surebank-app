import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { useCardQueries } from '@/hooks/queries/useCardQueries';
import { usePackageQueries } from '@/hooks/queries/usePackageQueries';
import { CreateSchedulePayload } from '@/lib/api/scheduledContributions';
import { formatCurrency } from '@/lib/utils';
import {
    ArrowLeft,
    CreditCard,
    Wallet,
    AlertCircle,
    CheckCircle2,
    Info,
    ChevronRight,
    ChevronLeft,
    DollarSign,
    Clock,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const STEPS = [
    { id: 1, title: 'Package & Card', description: 'Select savings package and payment method', icon: Wallet },
    { id: 2, title: 'Amount & Frequency', description: 'Set contribution amount and schedule', icon: DollarSign },
    { id: 3, title: 'Schedule & Review', description: 'Configure dates and review details', icon: Clock },
];

type PackageType = 'ds' | 'sb';

function CreateSchedule() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPackageType, setSelectedPackageType] = useState<PackageType>('ds');
    const [formData, setFormData] = useState<CreateSchedulePayload>({
        packageId: '',
        contributionType: 'ds',
        storedCardId: '',
        amount: 0,
        frequency: 'monthly',
        startDate: '',
        endDate: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof CreateSchedulePayload | 'storedCardId', string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { createScheduleAsync, isCreateScheduleLoading } = useScheduleQueries();
    const { cards, hasCards, isCardsLoading } = useCardQueries();
    const { packages, hasPackages, isLoading: isPackagesLoading } = usePackageQueries();
    // Set default start date to today
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({
            ...prev,
            startDate: today
        }));
    }, []);

    // Update form data when package type changes
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            contributionType: selectedPackageType,
            packageId: '' // Reset package selection when type changes
        }));
    }, [selectedPackageType]);

    // Filter active packages based on selected type
    const getActivePackages = () => {
        if (!packages) return [];

        if (selectedPackageType === 'ds') {
            const dsPackages = packages.filter(pkg => pkg.type === 'Daily Savings');

            // For DS packages, filter by status = 'open' (active packages)
            const activeDsPackages = dsPackages.filter(pkg => {
                console.log(`DS package ${pkg.id}: status = ${pkg.status}, totalCount = ${pkg.totalCount}`);
                return pkg.status === 'open';
            });
            return activeDsPackages;
        } else {
            const sbPackages = packages.filter(pkg => pkg.type === 'SB Package');

            const activeSbPackages = sbPackages.filter(pkg => pkg.current < pkg.target);

            return activeSbPackages;
        }
    };

    const activePackages = getActivePackages();

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

    const validateStep = (step: number): boolean => {
        const newErrors: Partial<Record<keyof CreateSchedulePayload, string>> = {};

        if (step === 1) {
            // Package validation
            if (!formData.packageId) {
                newErrors.packageId = 'Please select a package';
            }
            // Card validation
            if (!formData.storedCardId) {
                newErrors.storedCardId = 'Please select a card';
            }
        }

        if (step === 2) {
            // Amount validation
            if (!formData.amount || formData.amount <= 0) {
                newErrors.amount = 'Please enter a valid amount';
            } else if (formData.amount < 100) {
                newErrors.amount = 'Minimum amount is ₦100';
            }

            // Package-specific validation
            if (formData.packageId && selectedPackageType === 'ds') {
                const selectedPackage = activePackages.find(pkg => pkg.id === formData.packageId);
                if (selectedPackage && selectedPackage.amountPerDay) {
                    // Daily Savings packages must be multiples of amountPerDay
                    if (formData.amount % selectedPackage.amountPerDay !== 0) {
                        newErrors.amount = `Amount must be a multiple of ₦${selectedPackage.amountPerDay.toLocaleString()} (daily amount for this package)`;
                    }
                }
            }
        }

        if (step === 3) {
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
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateForm = (): boolean => {
        return validateStep(1) && validateStep(2) && validateStep(3);
    };

    const handleNext = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const canProceed = (step: number): boolean => {
        if (step === 1) {
            return formData.packageId !== '' && formData.storedCardId !== '';
        }
        if (step === 2) {
            return formData.amount > 0;
        }
        return true;
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

        // Only submit if we're on the final step
        if (currentStep < STEPS.length) {
            handleNext(e);
            return;
        }

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare payload with proper date formatting
            const submitData = {
                ...formData,
                endDate: formData.endDate || undefined // Convert empty string to undefined
            };
            await createScheduleAsync(submitData);
            navigate('/schedules');
        } catch {
            // Handle error silently - form will remain in current state
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCardsLoading || isPackagesLoading) {
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
            {(!hasPackages || !hasCards) && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        <div className="space-y-3">
                            {!hasPackages && !hasCards && (
                                <div>
                                    <p className="mb-3">You need to have at least one active package and one card to create a scheduled contribution.</p>
                                    <div className="flex gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link to="/packages">Create Package</Link>
                                        </Button>
                                        <Button asChild variant="outline" size="sm">
                                            <Link to="/cards/add">Add Card</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!hasPackages && hasCards && (
                                <div>
                                    <p className="mb-3">You need to have at least one active package to create a scheduled contribution.</p>
                                    <Button asChild variant="outline" size="sm">
                                        <Link to="/packages">Create Package</Link>
                                    </Button>
                                </div>
                            )}
                            {hasPackages && !hasCards && (
                                <div>
                                    <p className="mb-3">You need to have at least one card to create a scheduled contribution.</p>
                                    <Button asChild variant="outline" size="sm">
                                        <Link to="/cards/add">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Payment Card
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Information Card */}
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                    Scheduled contributions will automatically transfer the specified amount from your selected card to your chosen savings package at the selected frequency.
                </AlertDescription>
            </Alert>

            {/* Step Progress Indicator */}
            <div className="flex items-center justify-between mb-2">
                {STEPS.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const IconComponent = step.icon;

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isCompleted
                                ? 'bg-[#0066A1] border-[#0066A1] text-white'
                                : isActive
                                    ? 'border-[#0066A1] text-[#0066A1] bg-white'
                                    : 'border-gray-300 text-gray-400 bg-white'
                                }`}>
                                {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                    <IconComponent className="h-5 w-5" />
                                )}
                            </div>
                            <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${isActive ? 'text-[#0066A1]' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-500">{step.description}</p>
                            </div>
                            {index < STEPS.length - 1 && (
                                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Create Schedule Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {(() => {
                            const IconComponent = STEPS[currentStep - 1].icon;
                            return IconComponent ? <IconComponent className="h-5 w-5 mr-2" /> : null;
                        })()}
                        {STEPS[currentStep - 1].title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Package & Card Selection */}
                        {currentStep === 1 && (
                            <>
                                {/* Package Type Selection */}
                                <div>
                                    <Label>Package Type</Label>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPackageType('ds')}
                                            className={`p-4 border rounded-lg text-left transition-all ${selectedPackageType === 'ds'
                                                ? 'border-[#0066A1] bg-[#0066A1]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="font-medium">Daily Savings</div>
                                            <div className="text-sm text-gray-500">Fixed daily amount packages</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedPackageType('sb')}
                                            className={`p-4 border rounded-lg text-left transition-all ${selectedPackageType === 'sb'
                                                ? 'border-[#0066A1] bg-[#0066A1]/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="font-medium">Savings Buying</div>
                                            <div className="text-sm text-gray-500">Product purchase packages</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Package Selection */}
                                <div>
                                    <Label htmlFor="packageId">Select Package</Label>
                                    <Select value={formData.packageId} onValueChange={(value) => handleInputChange('packageId', value)}>
                                        <SelectTrigger className={errors.packageId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={`Select ${selectedPackageType === 'ds' ? 'Daily Savings' : 'SB'} package`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {activePackages.map((pkg) => (
                                                <SelectItem key={pkg.id} value={pkg.id}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center space-x-2">
                                                            <Wallet className="h-4 w-4" />
                                                            <div>
                                                                <div className="font-medium">{pkg.title}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {formatCurrency(pkg.current)} / {formatCurrency(pkg.target)} ({pkg.progress}%)
                                                                </div>
                                                                {selectedPackageType === 'ds' && pkg.amountPerDay && (
                                                                    <div className="text-xs text-blue-600">
                                                                        ₦{pkg.amountPerDay.toLocaleString()}/day
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.packageId && (
                                        <p className="text-sm text-red-600 mt-1">{errors.packageId}</p>
                                    )}
                                    {activePackages.length === 0 && (
                                        <p className="text-sm text-amber-600 mt-1">
                                            No active {selectedPackageType === 'ds' ? 'Daily Savings' : 'SB'} packages found.
                                            <Link to="/packages" className="underline ml-1">Create one</Link>
                                        </p>
                                    )}
                                </div>

                                {/* Card Selection */}
                                <div>
                                    <Label htmlFor="storedCardId">Payment Card</Label>
                                    <Select value={formData.storedCardId} onValueChange={(value) => handleInputChange('storedCardId', value)}>
                                        <SelectTrigger className={errors.storedCardId ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select card for payments" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(cards || []).filter(card => card.isActive).map((card) => (
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
                                    {errors.storedCardId && (
                                        <p className="text-sm text-red-600 mt-1">{errors.storedCardId}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Step 2: Amount & Frequency */}
                        {currentStep === 2 && (
                            <>
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
                                    {/* Package-specific amount hints */}
                                    {formData.packageId && selectedPackageType === 'ds' && (() => {
                                        const selectedPackage = activePackages.find(pkg => pkg.id === formData.packageId);
                                        if (selectedPackage && selectedPackage.amountPerDay) {
                                            return (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    For Daily Savings: Amount must be a multiple of ₦{selectedPackage.amountPerDay.toLocaleString()} (daily amount)
                                                </p>
                                            );
                                        }
                                        return null;
                                    })()}
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
                            </>
                        )}

                        {/* Step 3: Schedule & Review */}
                        {currentStep === 3 && (
                            <>
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
                            </>
                        )}

                        {/* Step Navigation Buttons */}
                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                                className="flex items-center"
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>

                            <div className="flex gap-2">
                                {currentStep < STEPS.length ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!canProceed(currentStep)}
                                        className="bg-[#0066A1] hover:bg-[#005085] flex items-center"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="bg-[#0066A1] hover:bg-[#005085] flex items-center"
                                        disabled={isSubmitting || isCreateScheduleLoading || !hasPackages || !hasCards}
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
                                )}
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default CreateSchedule; 