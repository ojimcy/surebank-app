import { useState, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/layout/AuthLayout';
import Spinner from '@/components/ui/Spinner';
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const { register, isRegisterLoading } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordChecks = useMemo(() => {
    const pwd = formData.password || '';
    return {
      length: pwd.length >= 8, // recommendation; backend minimum remains 6
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
  }, [formData.password]);

  const allChecksMet = useMemo(() =>
    Object.values(passwordChecks).every(Boolean)
    , [passwordChecks]);

  // Handle input focus to scroll into view with keyboard avoidance
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Small delay to ensure keyboard is shown
    setTimeout(() => {
      const element = e.target;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Check if element is near bottom of viewport (where keyboard appears)
      if (rect.bottom > viewportHeight * 0.5) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

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

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (numbers only)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

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
      // Register with all the data
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
      });

      // Navigate to verification page
      navigate('/auth/verify');
    } catch (error: unknown) {
      // Handle specific error messages from the API
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        'Registration failed. Please try again.';

      // Check for specific error messages
      if (errorMessage.includes('email already taken')) {
        setErrors({
          email:
            'This email is already registered. Please use a different email or sign in.',
        });
      } else if (errorMessage.includes('phone number already taken')) {
        setErrors({
          phone:
            'This phone number is already registered. Please use a different number or sign in.',
        });
      } else if (errorMessage.includes('verification') && errorMessage.includes('failed')) {
        // If email verification failed, show a message but still allow navigation
        setErrors({
          general: 'Account created successfully, but email verification failed. You can still login and verify your email later.',
        });
        // Store the credentials for easy login
        sessionStorage.setItem('login-identifier', formData.email || formData.phone);
        // Navigate to login page after a delay
        setTimeout(() => {
          navigate('/auth/login', { 
            state: { 
              message: 'Your account has been created. Please login to continue. You can verify your email from your account settings.',
              needsVerification: true,
              identifier: formData.email || formData.phone
            } 
          });
        }, 3000);
      } else {
        setErrors({
          general: errorMessage,
        });
      }
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Fill in your details to get started"
    >
      {errors.general && (
        <div className="mb-6 p-3 bg-[#f8d7da] border border-[#f5c2c7] text-[#DC3545] rounded-md text-sm">
          {errors.general}
        </div>
      )}

      <form ref={formRef} className="space-y-5 relative" onSubmit={handleSubmit}>
        {isRegisterLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-md flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <Spinner size="md" color="primary" />
              <p className="mt-2 text-sm text-gray-600 font-medium">
                Creating account...
              </p>
            </div>
          </div>
        )}

        {/* Personal Information */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-[#212529]">
            Personal Information
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#212529]"
              >
                Full Name*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.name ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
                  } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${errors.name
                    ? 'focus:ring-[#DC3545]/30'
                    : 'focus:ring-[#0066A1]/30'
                  } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                placeholder="Enter your full name"
                onFocus={handleInputFocus}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-[#DC3545]">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#212529]"
              >
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.email ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
                  } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${errors.email
                    ? 'focus:ring-[#DC3545]/30'
                    : 'focus:ring-[#0066A1]/30'
                  } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                placeholder="Enter your email address"
                onFocus={handleInputFocus}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#DC3545]">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-[#212529]"
              >
                Phone Number*
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.phone ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
                  } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${errors.phone
                    ? 'focus:ring-[#DC3545]/30'
                    : 'focus:ring-[#0066A1]/30'
                  } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                placeholder="Enter your phone number"
                onFocus={handleInputFocus}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-[#DC3545]">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-[#212529]"
              >
                Address*
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.address ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
                  } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${errors.address
                    ? 'focus:ring-[#DC3545]/30'
                    : 'focus:ring-[#0066A1]/30'
                  } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                placeholder="Enter your address"
                onFocus={handleInputFocus}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-[#DC3545]">{errors.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-[#212529]">
            Security
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#212529]"
              >
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${errors.password ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
                    } bg-white px-3 py-2 pr-10 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${errors.password
                      ? 'focus:ring-[#DC3545]/30'
                      : 'focus:ring-[#0066A1]/30'
                    } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                  placeholder="Create a password"
                  onFocus={handleInputFocus}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6C757D] hover:text-[#212529]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[#DC3545]">{errors.password}</p>
              )}
              <div className="mt-2">
                <p className="text-xs font-medium text-[#6C757D]">Make your password stronger by meeting these:</p>
                <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                  <li className="flex items-center gap-2 text-xs">
                    {passwordChecks.length ? (
                      <CheckCircle2 className="h-4 w-4 text-[#28A745]" />
                    ) : (
                      <Circle className="h-4 w-4 text-[#6C757D]" />
                    )}
                    <span className={passwordChecks.length ? 'text-[#212529]' : 'text-[#6C757D]'}>
                      At least 8 characters
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    {passwordChecks.upper ? (
                      <CheckCircle2 className="h-4 w-4 text-[#28A745]" />
                    ) : (
                      <Circle className="h-4 w-4 text-[#6C757D]" />
                    )}
                    <span className={passwordChecks.upper ? 'text-[#212529]' : 'text-[#6C757D]'}>
                      One uppercase letter
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    {passwordChecks.lower ? (
                      <CheckCircle2 className="h-4 w-4 text-[#28A745]" />
                    ) : (
                      <Circle className="h-4 w-4 text-[#6C757D]" />
                    )}
                    <span className={passwordChecks.lower ? 'text-[#212529]' : 'text-[#6C757D]'}>
                      One lowercase letter
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    {passwordChecks.number ? (
                      <CheckCircle2 className="h-4 w-4 text-[#28A745]" />
                    ) : (
                      <Circle className="h-4 w-4 text-[#6C757D]" />
                    )}
                    <span className={passwordChecks.number ? 'text-[#212529]' : 'text-[#6C757D]'}>
                      One number
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-xs">
                    {passwordChecks.special ? (
                      <CheckCircle2 className="h-4 w-4 text-[#28A745]" />
                    ) : (
                      <Circle className="h-4 w-4 text-[#6C757D]" />
                    )}
                    <span className={passwordChecks.special ? 'text-[#212529]' : 'text-[#6C757D]'}>
                      One special character
                    </span>
                  </li>
                </ul>
                {allChecksMet && (
                  <p className="mt-2 text-xs text-[#28A745]">Great password!</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[#212529]"
              >
                Confirm Password*
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${errors.confirmPassword
                    ? 'border-[#DC3545]'
                    : 'border-[#E5E8ED]'
                    } bg-white px-3 py-2 pr-10 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${errors.confirmPassword
                      ? 'focus:ring-[#DC3545]/30'
                      : 'focus:ring-[#0066A1]/30'
                    } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                  placeholder="Confirm your password"
                  onFocus={handleInputFocus}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6C757D] hover:text-[#212529]"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-[#DC3545]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-3 font-semibold h-12 bg-[#0066A1] text-white hover:bg-[#0066A1]/90 flex items-center justify-center gap-2"
          disabled={isRegisterLoading}
        >
          {isRegisterLoading && <Spinner size="sm" color="white" />}
          <span>
            {isRegisterLoading ? 'Creating account...' : 'Create account'}
          </span>
        </Button>
      </form>

      <div className="mt-6 text-center pb-10">
        <p className="text-sm text-[#6C757D]">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="text-[#0066A1] hover:underline font-medium"
            tabIndex={isRegisterLoading ? -1 : 0}
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;
