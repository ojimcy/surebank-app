import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/layout/AuthLayout';

function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [errors, setErrors] = useState<{
    identifier?: string;
    general?: string;
  }>({});
  const { requestPasswordReset, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate fields
    const newErrors: {
      identifier?: string;
      general?: string;
    } = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    }

    // If there are validation errors, stop form submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await requestPasswordReset(identifier);
      navigate('/auth/verify-reset-code');
    } catch (error) {
      console.log('Error sending reset code', error);
      setErrors({
        general: 'Failed to send reset code. Please try again.',
      });
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email or phone number to receive a reset code"
    >
      {errors.general && (
        <div className="mb-6 p-3 bg-[#f8d7da] border border-[#f5c2c7] text-[#DC3545] rounded-md text-sm">
          {errors.general}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label
            htmlFor="identifier"
            className="block text-sm font-medium text-[#212529]"
          >
            Email or Phone Number
          </label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={`block w-full rounded-md border ${
              errors.identifier ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
            } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
              errors.identifier
                ? 'focus:ring-[#DC3545]/30'
                : 'focus:ring-[#0066A1]/30'
            } disabled:cursor-not-allowed disabled:opacity-50 h-12`}
            placeholder="Enter your email or phone"
          />
          {errors.identifier && (
            <p className="mt-1 text-xs text-[#DC3545]">{errors.identifier}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full py-3 font-semibold h-12 bg-[#0066A1] text-white hover:bg-[#0066A1]/90"
          disabled={isLoading}
        >
          {isLoading ? 'Sending code...' : 'Send reset code'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#6C757D]">
          Remember your password?{' '}
          <Link
            to="/auth/login"
            className="text-[#0066A1] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
