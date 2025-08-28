import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import { useToast } from '@/lib/toast-provider';
import { shouldShowOnboarding } from '@/hooks/useOnboarding';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import AuthLayout from '@/components/layout/AuthLayout';
import Spinner from '@/components/ui/Spinner';
import { User, Lock } from 'lucide-react';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});
  const passwordRef = useRef<HTMLInputElement>(null);
  const { success: showSuccess, error: showError } = useToast();

  const { login, isLoginLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Load saved identifier from sessionStorage
  useEffect(() => {
    const savedIdentifier = sessionStorage.getItem('login-identifier');
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
    }
  }, []);

  // Check for success message in location state (e.g., from password reset)
  useEffect(() => {
    if (location.state?.message) {
      showSuccess({
        title: 'Success',
        description: location.state.message,
        duration: 6000
      });
      // Note: We don't manipulate history here to avoid refresh issues
    }
  }, [location, showSuccess]);

  // Save identifier to sessionStorage as user types
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdentifier(value);
    if (value.trim()) {
      sessionStorage.setItem('login-identifier', value);
    } else {
      sessionStorage.removeItem('login-identifier');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission to avoid page refresh
    e.preventDefault();
    e.stopPropagation();
    
    // Clear previous errors
    setErrors({});

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
      return false;
    }

    try {
      await login(identifier, password);
      // Clear saved identifier on successful login
      sessionStorage.removeItem('login-identifier');
      // Check if user needs to see welcome screen first
      if (shouldShowOnboarding()) {
        navigate('/welcome');
      } else {
        navigate('/');
      }
    } catch (error: unknown) {
      console.error("Login handleSubmit raw error:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message || 'Authentication failed.';

      // Handle specific error types
      if (
        errorMessage.includes('locked') ||
        errorMessage.includes('disabled')
      ) {
        showError({
          title: 'Account Locked',
          description: 'Your account has been temporarily locked. Please contact support.',
          duration: 8000
        });
      } else if (
        errorMessage.includes('verification') ||
        errorMessage.includes('verify')
      ) {
        // Instead of blocking login, allow user to proceed with a warning
        // The backend should still allow login for unverified users
        showError({
          title: 'Email Verification Pending',
          description: 'Your email is not verified yet. You can still login but some features may be limited.',
          duration: 8000
        });
        // Note: If backend blocks login for unverified users, we need to handle it server-side
      } else if (errorMessage.includes('user not found. Please check your email or phone number')) {
        setErrors({
          identifier:
            'Account not found. Please check your email or phone number.',
        });
      } else if (errorMessage.includes('password')) { // Explicitly "password", not "credentials"
        setErrors({
          password: 'Incorrect password. Please try again.',
        });
      } else if (errorMessage.includes('credentials')) { // Handles generic "credentials" error
        showError({
          title: 'Login Failed',
          description: 'Invalid email/phone number or password. Please check your details and try again.',
          duration: 8000
        });
      } else {
        showError({
          title: 'Login Error',
          description: errorMessage,
          duration: 8000
        });
      }
      
      // Focus password field after login failure for better UX
      setTimeout(() => {
        passwordRef.current?.focus();
      }, 100);
    }
    
    // Always return false to prevent any form submission
    return false;
  };


  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >

      <form className="space-y-5 relative" onSubmit={handleSubmit} noValidate>
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

        <FormInput
          id="identifier"
          type="text"
          label="Email or Phone Number"
          placeholder="Enter your email or phone"
          value={identifier}
          onChange={handleIdentifierChange}
          error={errors.identifier}
          leftIcon={<User className="h-4 w-4" />}
          disabled={isLoginLoading}
          autoComplete="username"
          autoFocus
        />

        <FormInput
          ref={passwordRef}
          id="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          leftIcon={<Lock className="h-4 w-4" />}
          showPasswordToggle
          disabled={isLoginLoading}
          autoComplete="current-password"
        />

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
          className="w-full py-3 font-semibold h-12 bg-[#0066A1] text-white hover:bg-[#0066A1]/90 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
          disabled={isLoginLoading || (!identifier.trim() || !password.trim())}
        >
          {isLoginLoading && <Spinner size="sm" color="white" />}
          <span>{isLoginLoading ? 'Signing in...' : 'Sign in'}</span>
        </Button>
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
