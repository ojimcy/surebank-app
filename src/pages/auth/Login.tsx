import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/layout/AuthLayout';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
    general?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message in location state (e.g., from password reset)
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clean up the location state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);

    // Validate fields
    const newErrors: {
      identifier?: string;
      password?: string;
      general?: string;
    } = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email or phone number is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    // If there are validation errors, stop form submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(identifier, password);
      navigate('/');
    } catch {
      setErrors({
        general: 'Invalid credentials. Please try again.',
      });
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      {successMessage && (
        <div className="mb-6 p-3 bg-[#d1e7dd] border border-[#badbcc] text-[#28A745] rounded-md text-sm">
          {successMessage}
        </div>
      )}

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

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#212529]"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`block w-full rounded-md border ${
              errors.password ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
            } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
              errors.password
                ? 'focus:ring-[#DC3545]/30'
                : 'focus:ring-[#0066A1]/30'
            } disabled:cursor-not-allowed disabled:opacity-50 h-12`}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-[#DC3545]">{errors.password}</p>
          )}
        </div>

        <div className="text-right">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-[#0066A1] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full py-3 font-semibold h-12 bg-[#0066A1] text-white hover:bg-[#0066A1]/90"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#6C757D]">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="text-[#0066A1] hover:underline font-medium"
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
