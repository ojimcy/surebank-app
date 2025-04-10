import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePin } from '@/lib/pin-provider';
import AuthLayout from '@/components/layout/AuthLayout';
import { useAuth } from '@/lib/auth-provider';
import { PinPad } from '@/components/ui/PinPad';

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
    <AuthLayout
      title="App Locked"
      subtitle={`Welcome back, ${
        user?.firstName || 'User'
      }. Enter your PIN to unlock the app.`}
    >
      {error && (
        <div className="mb-6 p-3 bg-[#f8d7da] border border-[#f5c2c7] text-[#DC3545] rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="mt-8">
        <PinPad
          value={pin}
          onChange={handlePinChange}
          onSubmit={handleSubmit}
          maxLength={6}
        />
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-900 text-sm"
        >
          Log out instead
        </button>
      </div>
    </AuthLayout>
  );
}

export default PinLock;
