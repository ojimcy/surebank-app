import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePin } from '@/lib/pin-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/toast-provider';
import { ArrowLeft, Shield, Settings, AlertTriangle } from 'lucide-react';

function PinSettings() {
  const { isPinSet, inactivityTimeout, setInactivityTimeout } = usePin();
  const navigate = useNavigate();
  const { success } = useToast();

  // Convert milliseconds to minutes for the UI
  const [timeoutMinutes, setTimeoutMinutes] = useState(
    Math.floor(inactivityTimeout / (60 * 1000))
  );

  // Update local state when inactivityTimeout changes
  useEffect(() => {
    setTimeoutMinutes(Math.floor(inactivityTimeout / (60 * 1000)));
  }, [inactivityTimeout]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert minutes to milliseconds for storage
    const timeoutMs = timeoutMinutes * 60 * 1000;
    setInactivityTimeout(timeoutMs);

    success({
      title: 'Settings Saved',
      description: 'Your PIN timeout settings have been updated.',
    });
  };

  const timeoutOptions = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/settings')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </button>
        </div>

        {/* Modal-style Card */}
        <div className="bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#0066A1] to-[#004d7a] px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Settings className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">PIN Settings</h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Configure your PIN security timeout settings
            </p>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8">
            {/* PIN Not Set Warning */}
            {!isPinSet && (
              <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-orange-800">PIN not set</p>
                    <p className="text-xs text-orange-700 mt-1">
                      You haven't set up a PIN yet.{' '}
                      <button
                        onClick={() => navigate('/settings/setup-pin')}
                        className="font-medium underline hover:no-underline"
                      >
                        Set up a PIN
                      </button>{' '}
                      to enable security features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Security Timeout</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Choose how long the app can remain inactive before requiring your PIN to unlock.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {timeoutOptions.map((option) => (
                    <div key={option.value}>
                      <input
                        type="radio"
                        id={`timeout-${option.value}`}
                        name="timeout"
                        value={option.value}
                        checked={timeoutMinutes === option.value}
                        onChange={() => setTimeoutMinutes(option.value)}
                        className="sr-only peer"
                        disabled={!isPinSet}
                      />
                      <label
                        htmlFor={`timeout-${option.value}`}
                        className={`flex items-center justify-center p-3 border-2 text-sm font-medium ${
                          timeoutMinutes === option.value
                            ? 'bg-[#0066A1]/10 border-[#0066A1] text-[#0066A1]'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        } rounded-xl cursor-pointer transition-all peer-disabled:opacity-40 peer-disabled:cursor-not-allowed`}
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    The app will automatically lock after being inactive for the selected time period.
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-[#0066A1] to-[#004d7a] hover:from-[#004d7a] hover:to-[#003d5c] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg" 
                disabled={!isPinSet}
              >
                {isPinSet ? 'Save Settings' : 'PIN Required'}
              </Button>
            </form>

            {/* Change PIN Option */}
            {isPinSet && (
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => navigate('/settings/setup-pin')}
                  className="text-[#0066A1] hover:text-[#004d7a] text-sm font-medium transition-colors underline hover:no-underline"
                >
                  Change PIN
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PinSettings;
