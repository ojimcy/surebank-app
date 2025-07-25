import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScheduleQueries } from '@/hooks/queries/useScheduleQueries';
import { useCardQueries } from '@/hooks/queries/useCardQueries';
import { ScheduledContribution, UpdateSchedulePayload } from '@/lib/api/scheduledContributions';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { usePinVerification } from '@/hooks/usePinVerification';
import {
    ArrowLeft,
    CreditCard,
    AlertCircle,
    CheckCircle2,
    Info,
    DollarSign,
    Clock,
    Save,
    Pause,
    Play,
    Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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

function EditSchedule() {
    const { id: scheduleId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { verifyPin, PinVerificationModal } = usePinVerification();
    const [schedule, setSchedule] = useState<ScheduledContribution | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState<UpdateSchedulePayload>({
        amount: 0,
        frequency: 'monthly',
        endDate: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof UpdateSchedulePayload, string>>>({});
    
    // Modal states
    const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
    const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const {
        getSchedule,
        updateSchedule,
        isUpdateScheduleLoading,
        pauseSchedule,
        isPauseScheduleLoading,
        resumeSchedule,
        isResumeScheduleLoading,
        cancelSchedule,
        isCancelScheduleLoading,
    } = useScheduleQueries();

    const { cards, isCardsLoading } = useCardQueries();

    useEffect(() => {
        const fetchSchedule = async () => {
            if (!scheduleId) return;

            setIsLoading(true);
            try {
                const scheduleData = await getSchedule(scheduleId);
                setSchedule(scheduleData);
                setFormData({
                    amount: scheduleData.amount,
                    frequency: scheduleData.frequency,
                    endDate: scheduleData.endDate || '',
                });
            } catch (error) {
                console.error('Error fetching schedule:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedule();
    }, [scheduleId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleInputChange = (field: keyof UpdateSchedulePayload, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof UpdateSchedulePayload, string>> = {};

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.frequency) {
            newErrors.frequency = 'Please select a frequency';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!schedule || !validateForm()) return;

        const pinVerified = await verifyPin({
            title: 'Update Schedule',
            description: `Enter your PIN to update the ${schedule.frequency} schedule of ${formatCurrency(schedule.amount)}`
        });

        if (!pinVerified) return;

        try {
            await updateSchedule({ 
                scheduleId: schedule._id || schedule.id!, 
                payload: formData 
            });
            navigate(`/schedules/${schedule._id || schedule.id}`);
        } catch (error) {
            console.error('Error updating schedule:', error);
        }
    };

    const handlePause = async () => {
        if (!schedule) return;

        const pinVerified = await verifyPin({
            title: 'Pause Schedule',
            description: `Enter your PIN to pause the ${schedule.frequency} schedule of ${formatCurrency(schedule.amount)}`
        });

        if (!pinVerified) {
            setIsPauseDialogOpen(false);
            return;
        }

        try {
            await pauseSchedule(schedule._id || schedule.id!);
            setIsPauseDialogOpen(false);
            navigate(`/schedules/${schedule._id || schedule.id}`);
        } catch (error) {
            console.error('Error pausing schedule:', error);
            setIsPauseDialogOpen(false);
        }
    };

    const handleResume = async () => {
        if (!schedule) return;

        const pinVerified = await verifyPin({
            title: 'Resume Schedule',
            description: `Enter your PIN to resume the ${schedule.frequency} schedule of ${formatCurrency(schedule.amount)}`
        });

        if (!pinVerified) {
            setIsResumeDialogOpen(false);
            return;
        }

        try {
            await resumeSchedule(schedule._id || schedule.id!);
            setIsResumeDialogOpen(false);
            navigate(`/schedules/${schedule._id || schedule.id}`);
        } catch (error) {
            console.error('Error resuming schedule:', error);
            setIsResumeDialogOpen(false);
        }
    };

    const handleCancel = async () => {
        if (!schedule) return;

        const pinVerified = await verifyPin({
            title: 'Cancel Schedule',
            description: `Enter your PIN to cancel the ${schedule.frequency} schedule of ${formatCurrency(schedule.amount)}`
        });

        if (!pinVerified) {
            setIsCancelDialogOpen(false);
            return;
        }

        try {
            await cancelSchedule(schedule._id || schedule.id!);
            setIsCancelDialogOpen(false);
            navigate('/schedules');
        } catch (error) {
            console.error('Error cancelling schedule:', error);
            setIsCancelDialogOpen(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
            case 'paused':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Paused</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            case 'completed':
                return <Badge variant="outline" className="bg-blue-100 text-blue-800">Completed</Badge>;
            case 'suspended':
                return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Suspended</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
            </div>
        );
    }

    if (!schedule) {
        return (
            <div className="space-y-6">
                <div className="flex items-center mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/schedules')}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">Edit Schedule</h1>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-800 mb-2">
                        Schedule Not Found
                    </h2>
                    <p className="text-red-600 mb-4">
                        The schedule you're trying to edit doesn't exist or has been deleted.
                    </p>
                    <Button onClick={() => navigate('/schedules')}>
                        Back to Schedules
                    </Button>
                </div>
            </div>
        );
    }

    const storedCard = typeof schedule.storedCardId === 'object' ? schedule.storedCardId : null;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/schedules/${schedule._id || schedule.id}`)}
                        className="mr-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold text-[#212529]">Edit Schedule</h1>
                </div>
                {getStatusBadge(schedule.status)}
            </div>

            {/* Schedule Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Info className="h-5 w-5 mr-2" />
                        Current Schedule Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="font-medium uppercase">{schedule.contributionType}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium capitalize">{schedule.status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Start Date</p>
                            <p className="font-medium">{schedule.startDate ? formatDateTime(schedule.startDate) : 'Not specified'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Next Payment</p>
                            <p className="font-medium">{schedule.nextPaymentDate ? formatDateTime(schedule.nextPaymentDate) : 'Not scheduled'}</p>
                        </div>
                    </div>
                    
                    {storedCard && (
                        <div>
                            <p className="text-sm text-gray-500">Payment Card</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <CreditCard className="h-4 w-4 text-gray-600" />
                                <span className="font-medium">
                                    **** {storedCard.last4} ({storedCard.cardType.toUpperCase()})
                                </span>
                                <span className="text-sm text-gray-500">- {storedCard.bank}</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Update Schedule Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (₦)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={formData.amount || ''}
                            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                            className={errors.amount ? 'border-red-500' : ''}
                        />
                        {errors.amount && (
                            <p className="text-sm text-red-600">{errors.amount}</p>
                        )}
                        <p className="text-sm text-gray-500">
                            Current: {typeof schedule.amount === 'number' ? formatCurrency(schedule.amount) : '₦0'}
                        </p>
                    </div>

                    {/* Frequency */}
                    <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select
                            value={formData.frequency}
                            onValueChange={(value) => handleInputChange('frequency', value)}
                        >
                            <SelectTrigger className={errors.frequency ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.frequency && (
                            <p className="text-sm text-red-600">{errors.frequency}</p>
                        )}
                        <p className="text-sm text-gray-500">
                            Current: {schedule.frequency}
                        </p>
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <Label htmlFor="endDate">End Date (Optional)</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={formData.endDate || ''}
                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                            Leave empty for indefinite schedule
                        </p>
                    </div>

                    {/* Preview */}
                    {formData.amount > 0 && (
                        <Alert>
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                New schedule: <strong>{formatCurrency(formData.amount)} {formData.frequency}</strong>
                                {formData.endDate && ` until ${new Date(formData.endDate).toLocaleDateString()}`}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button
                    onClick={handleSubmit}
                    disabled={isUpdateScheduleLoading}
                    className="bg-[#0066A1] hover:bg-[#005085]"
                >
                    {isUpdateScheduleLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            Updating...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Schedule
                        </>
                    )}
                </Button>

                {schedule.status === 'active' && (
                    <Button
                        variant="outline"
                        onClick={() => setIsPauseDialogOpen(true)}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                    </Button>
                )}

                {schedule.status === 'paused' && (
                    <Button
                        variant="outline"
                        onClick={() => setIsResumeDialogOpen(true)}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                    </Button>
                )}

                {schedule.status !== 'cancelled' && schedule.status !== 'completed' && (
                    <Button
                        variant="outline"
                        onClick={() => setIsCancelDialogOpen(true)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                        <Square className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                )}
            </div>

            {/* Pause Confirmation Dialog */}
            <AlertDialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Pause Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to pause this scheduled contribution of {formatCurrency(schedule.amount)} {schedule.frequency}?
                            You can resume it anytime.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePause}
                            className="bg-yellow-600 hover:bg-yellow-700"
                            disabled={isPauseScheduleLoading}
                        >
                            {isPauseScheduleLoading ? 'Pausing...' : 'Pause Schedule'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Resume Confirmation Dialog */}
            <AlertDialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Resume Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to resume this scheduled contribution of {formatCurrency(schedule.amount)} {schedule.frequency}?
                            Payments will restart according to the schedule.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleResume}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isResumeScheduleLoading}
                        >
                            {isResumeScheduleLoading ? 'Resuming...' : 'Resume Schedule'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this scheduled contribution of {formatCurrency(schedule.amount)} {schedule.frequency}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isCancelScheduleLoading}
                        >
                            {isCancelScheduleLoading ? 'Cancelling...' : 'Cancel Schedule'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* PIN Verification Modal */}
            <PinVerificationModal />
        </div>
    );
}

export default EditSchedule;