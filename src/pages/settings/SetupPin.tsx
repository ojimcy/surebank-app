import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePin } from '@/lib/pin-provider';
import { useToast } from '@/lib/toast-provider';
import { PinPad } from '@/components/ui/PinPad';

function SetupPin() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const { isPinSet, setupPin, clearPin } = usePin();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();

  // Reset form when component mounts
  useEffect(() => {
    setPin('');
    setConfirmPin('');
    setError('');
    setStep('enter');
  }, []);

  const handlePinChange = (value: string) => {
    if (step === 'enter') {
      setPin(value);
    } else {
      setConfirmPin(value);
    }
    setError('');
  };

  const handleFirstStepComplete = () => {
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    // Move to confirm step
    setStep('confirm');
    setConfirmPin('');
  };

  const handleConfirmComplete = () => {
    if (pin !== confirmPin) {
      setError('PINs do not match');
      setConfirmPin('');
      return;
    }

    try {
      setupPin(pin);
      success({
        title: 'PIN Setup Successful',
        description: 'Your security PIN has been set successfully.',
      });
      navigate('/settings');
    } catch (err: Error | unknown) {
      showError({
        title: 'PIN Setup Failed',
        description:
          err instanceof Error ? err.message : 'Failed to set up PIN',
      });
    }
  };

  const handleRemovePin = () => {
    clearPin();
    success({
      title: 'PIN Removed',
      description: 'Your security PIN has been removed.',
    });
    navigate('/settings');
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('enter');
      setError('');
    } else {
      navigate('/settings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Security PIN</h1>
        <button
          onClick={handleBack}
          className="text-[#0066A1] hover:text-[#004a75]"
        >
          {step === 'confirm' ? 'Back' : 'Cancel'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">
            {isPinSet
              ? 'Change Security PIN'
              : step === 'enter'
              ? 'Set Up Security PIN'
              : 'Confirm Your PIN'}
          </h2>
          <p className="text-gray-600 text-sm">
            {step === 'enter'
              ? 'Your PIN will be used to unlock the app after a period of inactivity. Choose a PIN that is easy for you to remember but hard for others to guess.'
              : 'Please enter your PIN again to confirm.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-[#f8d7da] border border-[#f5c2c7] text-[#DC3545] rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mt-6">
          <PinPad
            value={step === 'enter' ? pin : confirmPin}
            onChange={handlePinChange}
            onSubmit={
              step === 'enter' ? handleFirstStepComplete : handleConfirmComplete
            }
            maxLength={6}
          />
        </div>

        {isPinSet && step === 'enter' && (
          <div className="mt-8">
            <button
              type="button"
              onClick={handleRemovePin}
              className="w-full border border-red-500 text-red-500 py-2 px-4 rounded-md hover:bg-red-50 transition-colors"
            >
              Remove PIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SetupPin;
