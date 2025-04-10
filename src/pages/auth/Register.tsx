import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/layout/AuthLayout';
import Spinner from '@/components/ui/Spinner';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nigeria',
    },
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    'address.street'?: string;
    'address.city'?: string;
    'address.state'?: string;
    'address.zipCode'?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const { register, isRegisterLoading } = useAuth();
  const navigate = useNavigate();

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

    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors['address.state'] = 'State is required';
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
        address: {
          street: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          zipCode: formData.address.zipCode,
          country: formData.address.country,
        },
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

      <form className="space-y-5 relative" onSubmit={handleSubmit}>
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
                className={`mt-1 block w-full rounded-md border ${
                  errors.name ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
                } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'focus:ring-[#DC3545]/30'
                    : 'focus:ring-[#0066A1]/30'
                } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                placeholder="Enter your full name"
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
                className={`mt-1 block w-full rounded-md border ${
                  errors.email ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
                } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'focus:ring-[#DC3545]/30'
                    : 'focus:ring-[#0066A1]/30'
                } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                placeholder="Enter your email address"
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
                className={`mt-1 block w-full rounded-md border ${
                  errors.phone ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
                } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? 'focus:ring-[#DC3545]/30'
                    : 'focus:ring-[#0066A1]/30'
                } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-[#DC3545]">{errors.phone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-[#212529]">
            Address
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="address.street"
                className="block text-sm font-medium text-[#212529]"
              >
                Street Address*
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors['address.street']
                    ? 'border-[#DC3545]'
                    : 'border-[#E5E8ED]'
                } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
                  errors['address.street']
                    ? 'focus:ring-[#DC3545]/30'
                    : 'focus:ring-[#0066A1]/30'
                } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                placeholder="Enter your street address"
              />
              {errors['address.street'] && (
                <p className="mt-1 text-xs text-[#DC3545]">
                  {errors['address.street']}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="address.city"
                  className="block text-sm font-medium text-[#212529]"
                >
                  City*
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors['address.city']
                      ? 'border-[#DC3545]'
                      : 'border-[#E5E8ED]'
                  } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
                    errors['address.city']
                      ? 'focus:ring-[#DC3545]/30'
                      : 'focus:ring-[#0066A1]/30'
                  } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                  placeholder="City"
                />
                {errors['address.city'] && (
                  <p className="mt-1 text-xs text-[#DC3545]">
                    {errors['address.city']}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="address.state"
                  className="block text-sm font-medium text-[#212529]"
                >
                  State/Province*
                </label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors['address.state']
                      ? 'border-[#DC3545]'
                      : 'border-[#E5E8ED]'
                  } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
                    errors['address.state']
                      ? 'focus:ring-[#DC3545]/30'
                      : 'focus:ring-[#0066A1]/30'
                  } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                  placeholder="State"
                />
                {errors['address.state'] && (
                  <p className="mt-1 text-xs text-[#DC3545]">
                    {errors['address.state']}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="address.zipCode"
                  className="block text-sm font-medium text-[#212529]"
                >
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#E5E8ED] bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#0066A1]/30 disabled:cursor-not-allowed disabled:opacity-50 h-10"
                  placeholder="Zip code"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="address.country"
                  className="block text-sm font-medium text-[#212529]"
                >
                  Country*
                </label>
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#E5E8ED] bg-[#F6F8FA] px-3 py-2 text-sm text-[#6C757D] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#0066A1]/30 disabled:cursor-not-allowed disabled:opacity-50 h-10"
                  placeholder="Country"
                  disabled
                />
              </div>
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
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.password ? 'border-[#DC3545]' : 'border-[#E5E8ED]'
                } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'focus:ring-[#DC3545]/30'
                    : 'focus:ring-[#0066A1]/30'
                } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                placeholder="Create a password"
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
                Confirm Password*
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.confirmPassword
                    ? 'border-[#DC3545]'
                    : 'border-[#E5E8ED]'
                } bg-white px-3 py-2 text-sm text-[#212529] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? 'focus:ring-[#DC3545]/30'
                    : 'focus:ring-[#0066A1]/30'
                } disabled:cursor-not-allowed disabled:opacity-50 h-10`}
                placeholder="Confirm your password"
              />
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

      <div className="mt-6 text-center">
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
