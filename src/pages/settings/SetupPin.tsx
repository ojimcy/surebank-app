import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePin } from '@/lib/pin-provider';
import { useToast } from '@/lib/toast-provider';
import { PinPad } from '@/components/ui/PinPad';
import { AlertCircle, Shield, ArrowLeft, Trash2 } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 'confirm' ? 'Back' : 'Cancel'}
          </button>
        </div>

        {/* Modal-style Card */}
        <div className="bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#0066A1] to-[#004d7a] px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              {isPinSet
                ? 'Change Security PIN'
                : step === 'enter'
                ? 'Set Up Security PIN'
                : 'Confirm Your PIN'}
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              {step === 'enter'
                ? 'Choose a PIN that is easy for you to remember but hard for others to guess.'
                : 'Please enter your PIN again to confirm.'}
            </p>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* PIN Display */}
              <div className="flex justify-center">
                <div className="flex space-x-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        index < (step === 'enter' ? pin : confirmPin).length
                          ? 'bg-[#0066A1] border-[#0066A1] scale-110'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* PIN Pad */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <PinPad
                  value={step === 'enter' ? pin : confirmPin}
                  onChange={handlePinChange}
                  onSubmit={
                    step === 'enter' ? handleFirstStepComplete : handleConfirmComplete
                  }
                  maxLength={6}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="ml-2 text-xs text-blue-700">
                  Your PIN is stored securely on your device and never transmitted to our servers.
                </p>
              </div>
            </div>

            {/* Remove PIN Option */}
            {isPinSet && step === 'enter' && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove PIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetupPin;
