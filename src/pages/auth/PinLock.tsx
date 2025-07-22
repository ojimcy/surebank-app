import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePin } from '@/lib/pin-provider';
import { useAuth } from '@/lib/auth-provider';
import { PinPad } from '@/components/ui/PinPad';
import { AlertCircle, Shield, LogOut } from 'lucide-react';

function PinLock() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { unlockApp } = usePin();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handlePinChange = (value: string) => {
    setPin(value);
    setError('');
  };

  const handleSubmit = () => {
    if (unlockApp(pin)) {
      // On successful unlock, navigate back to previous page
      navigate(-1);
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Modal-style Card */}
        <div className="bg-white border-0 shadow-2xl rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-[#0066A1] to-[#004d7a] px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">App Locked</h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Welcome back, {user?.firstName || 'User'}. Enter your PIN to unlock the app.
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
                        index < pin.length
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
                  value={pin}
                  onChange={handlePinChange}
                  onSubmit={handleSubmit}
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

            {/* Logout Option */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 text-sm font-medium transition-colors duration-200 rounded-lg hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log out instead
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} SureBank. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PinLock;
