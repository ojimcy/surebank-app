import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/layout/AuthLayout';

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const { resetPassword, isLoading, passwordResetVerified, resetIdentifier } =
    useAuth();
  const navigate = useNavigate();

  // If the reset code hasn't been verified, redirect to forgot password
  if (!passwordResetVerified) {
    navigate('/auth/forgot-password');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof errors];
        return newErrors;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const newErrors: typeof errors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // If there are errors, stop form submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await resetPassword(formData.password);
      navigate('/auth/login', {
        state: {
          message:
            'Password reset successful. You can now log in with your new password.',
        },
      });
    } catch (error) {
      console.log('Error resetting password', error);
      setErrors({
        general: 'Password reset failed. Please try again.',
      });
    }
  };

  // Format the identifier for display
  const formatIdentifier = (identifier?: string) => {
    if (!identifier) return '';

    if (identifier.includes('@')) {
      // For email: show first 3 chars and domain, hide the rest
      const [username, domain] = identifier.split('@');
      const maskedUsername =
        username.slice(0, 3) + '*'.repeat(username.length - 3);
      return `${maskedUsername}@${domain}`;
    } else {
      // For phone: show last 4 digits, hide the rest
      return '*'.repeat(identifier.length - 4) + identifier.slice(-4);
    }
  };

  return (
    <AuthLayout
      title="Set new password"
      subtitle={`Create a new password for ${formatIdentifier(
        resetIdentifier
      )}`}
    >
      {errors.general && (
        <div className="mb-6 p-3 bg-[#f8d7da] border border-[#f5c2c7] text-[#DC3545] rounded-md text-sm">
          {errors.general}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#212529]"
          >
            New Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`block w-full rounded-md border ${
              errors.password ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
            } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
              errors.password
                ? 'focus:ring-[#DC3545]/30'
                : 'focus:ring-[#0066A1]/30'
            } disabled:cursor-not-allowed disabled:opacity-50 h-12`}
            placeholder="Create a new password"
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-[#DC3545]">{errors.password}</p>
          ) : (
            <p className="mt-1 text-xs text-[#6C757D]">
              Must be at least 6 characters
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-[#212529]"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`block w-full rounded-md border ${
              errors.confirmPassword ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
            } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
              errors.confirmPassword
                ? 'focus:ring-[#DC3545]/30'
                : 'focus:ring-[#0066A1]/30'
            } disabled:cursor-not-allowed disabled:opacity-50 h-12`}
            placeholder="Confirm your new password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-[#DC3545]">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full py-3 font-semibold h-12 mt-6 bg-[#0066A1] text-white hover:bg-[#0066A1]/90"
          disabled={isLoading}
        >
          {isLoading ? 'Updating password...' : 'Reset password'}
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

export default ResetPassword;
