import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/layout/AuthLayout';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});
  const { requestPasswordReset, isResetRequestLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate fields
    const newErrors: {
      email?: string;
      general?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }

    // If there are validation errors, stop form submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await requestPasswordReset(email);
      navigate('/auth/verify-reset-code');
    } catch (error: unknown) {
      console.log('Error sending reset code', error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        'Failed to send reset code. Please try again.';

      // Handle specific error types
      if (
        errorMessage.includes('not found') ||
        errorMessage.includes('no account')
      ) {
        setErrors({
          email: 'No account found with this email address.',
        });
      } else if (
        errorMessage.includes('too many') ||
        errorMessage.includes('rate limit')
      ) {
        setErrors({
          general: 'Too many requests. Please try again later.',
        });
      } else {
        setErrors({
          general: errorMessage,
        });
      }
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address to receive a reset code"
    >
      {errors.general && (
        <div className="mb-6 p-3 bg-[#f8d7da] border border-[#f5c2c7] text-[#DC3545] rounded-md text-sm">
          {errors.general}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#212529]"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`block w-full rounded-md border ${
              errors.email ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
            } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
              errors.email
                ? 'focus:ring-[#DC3545]/30'
                : 'focus:ring-[#0066A1]/30'
            } disabled:cursor-not-allowed disabled:opacity-50 h-12`}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-[#DC3545]">{errors.email}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full py-3 font-semibold h-12 bg-[#0066A1] text-white hover:bg-[#0066A1]/90"
          disabled={isResetRequestLoading}
        >
          {isResetRequestLoading ? 'Sending code...' : 'Send reset code'}
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
