import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePin } from '@/lib/pin-provider';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/toast-provider';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">PIN Settings</h1>
        <button
          onClick={() => navigate('/settings')}
          className="text-[#0066A1] hover:text-[#004a75]"
        >
          Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Security Timeout</h2>
          <p className="text-gray-600 text-sm">
            Choose how long the app can remain inactive before requiring your
            PIN to unlock.
          </p>
        </div>

        {!isPinSet && (
          <div className="mb-6 p-4 bg-[#fff3cd] border border-[#ffecb5] text-[#856404] rounded-md flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-[#856404]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <span className="block font-medium">PIN not set</span>
              <span className="block text-sm mt-1">
                You haven't set up a PIN yet.
                <button
                  onClick={() => navigate('/settings/setup-pin')}
                  className="ml-1 text-[#0066A1] hover:underline"
                >
                  Set up a PIN
                </button>
                to enable this security feature.
              </span>
            </div>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label
              htmlFor="timeout"
              className="block text-sm font-medium text-gray-700"
            >
              Lock after inactivity period
            </label>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
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
                    className={`flex items-center justify-center p-3 border ${
                      timeoutMinutes === option.value
                        ? 'bg-[#0066A1]/10 border-[#0066A1] text-[#0066A1]'
                        : 'bg-white border-gray-300 text-gray-700'
                    } rounded-md cursor-pointer transition-colors peer-disabled:opacity-50 peer-disabled:cursor-not-allowed`}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500">
              The app will lock after being inactive for this amount of time.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={!isPinSet}>
            Save Settings
          </Button>
        </form>
      </div>
    </div>
  );
}

export default PinSettings;
