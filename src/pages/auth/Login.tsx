import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/layout/AuthLayout';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/lib/toast-provider';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
    general?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, isLoginLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

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
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message || 'Authentication failed.';

      // Handle specific error types
      if (errorMessage.includes('not found')) {
        setErrors({
          identifier:
            'Account not found. Please check your email or phone number.',
        });
      } else if (
        errorMessage.includes('password') ||
        errorMessage.includes('credentials')
      ) {
        setErrors({
          password: 'Incorrect password. Please try again.',
        });
      } else if (
        errorMessage.includes('locked') ||
        errorMessage.includes('disabled')
      ) {
        setErrors({
          general:
            'Your account has been temporarily locked. Please contact support.',
        });
      } else if (
        errorMessage.includes('verification') ||
        errorMessage.includes('verify')
      ) {
        setErrors({
          general:
            'Your account is not verified. Please verify your account first.',
        });
      } else {
        setErrors({
          general: errorMessage,
        });
      }
    }
  };

  // Test toast - will remove this later
  const testToast = () => {
    addToast({
      title: 'Welcome to SureBank',
      description: 'Thank you for logging in to our application.',
      variant: 'success',
    });
  };

  // Add test examples for all toast types
  const testToasts = () => {
    // Success toast
    addToast({
      title: 'Success Message',
      description: 'This is a success toast notification example.',
      variant: 'success',
    });

    // After a delay, show error toast
    setTimeout(() => {
      addToast({
        title: 'Error Message',
        description: 'This is an error toast notification example.',
        variant: 'destructive',
      });
    }, 1000);

    // After another delay, show info toast
    setTimeout(() => {
      addToast({
        title: 'Information',
        description: 'This is a default/info toast notification example.',
        variant: 'default',
      });
    }, 2000);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

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

      <form className="space-y-5 relative" onSubmit={handleSubmit}>
        {isLoginLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-md flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <Spinner size="md" color="primary" />
              <p className="mt-2 text-sm text-gray-600 font-medium">
                Signing in...
              </p>
            </div>
          </div>
        )}

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
            disabled={isLoginLoading}
            autoComplete="username"
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
            disabled={isLoginLoading}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-[#DC3545]">{errors.password}</p>
          )}
        </div>

        <div className="text-right">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-[#0066A1] hover:underline"
            tabIndex={isLoginLoading ? -1 : 0}
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full py-3 font-semibold h-12 bg-[#0066A1] text-white hover:bg-[#0066A1]/90 flex items-center justify-center gap-2"
          disabled={isLoginLoading}
        >
          {isLoginLoading && <Spinner size="sm" color="white" />}
          <span>{isLoginLoading ? 'Signing in...' : 'Sign in'}</span>
        </Button>

        {/* Toast test button - for development only */}
        <div className="pt-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={testToast}
            className="text-xs text-[#6C757D] hover:underline"
          >
            Test success toast
          </button>
          <button
            type="button"
            onClick={testToasts}
            className="text-xs text-[#6C757D] hover:underline"
          >
            Test all toasts
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#6C757D]">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="text-[#0066A1] hover:underline font-medium"
            tabIndex={isLoginLoading ? -1 : 0}
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
