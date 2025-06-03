import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/layout/AuthLayout';

function VerifyResetCode() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<{
    code?: string;
    general?: string;
  }>({});
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const {
    verifyPasswordResetCode,
    requestPasswordReset,
    isVerifyResetLoading,
    isResetRequestLoading,
    resetEmail,
  } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resetEmail) {
      const timer =
        countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
      if (countdown === 0) setCanResend(true);
      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [countdown, resetEmail]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Focus next input after entering a digit
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;

    // Only allow digits
    if (value && !/^\d*$/.test(value)) return;

    // Update the code array
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last character
    setCode(newCode);

    // Clear any existing errors
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: undefined }));
    }

    // Move to next input if a digit was entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key events for backspace navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event to fill multiple inputs
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();

    // If pasted data is a 6-digit number, distribute it across inputs
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setCode(digits);

      // Clear any existing errors
      if (errors.code) {
        setErrors((prev) => ({ ...prev, code: undefined }));
      }

      // Focus on the last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (!resetEmail) return;

    setErrors({});
    try {
      await requestPasswordReset(resetEmail);
      setCountdown(60);
      setCanResend(false);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        'Failed to resend verification code. Please try again.';
      setErrors({
        general: errorMessage,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check if code is complete
    if (code.some((digit) => !digit)) {
      setErrors({
        code: 'Please enter all 6 digits of the verification code',
      });
      return;
    }

    try {
      await verifyPasswordResetCode(code.join(''));
      navigate('/auth/reset-password');
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        'Invalid verification code. Please try again.';

      // Handle specific error cases
      if (errorMessage.includes('expired')) {
        setErrors({
          code: 'Verification code has expired. Please request a new code.',
        });
      } else if (errorMessage.includes('attempts')) {
        setErrors({
          general: 'Too many failed attempts. Please request a new code.',
        });
      } else {
        setErrors({
          general: errorMessage,
        });
      }
    }
  };

  // Format the email for display
  const formatEmail = (email?: string) => {
    if (!email || !email.includes('@')) return '';

    // For email: show first 3 chars and domain, hide the rest
    const [username, domain] = email.split('@');
    const maskedUsername =
      username.slice(0, 3) + '*'.repeat(username.length - 3);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <AuthLayout
      title="Verify reset code"
      subtitle={`Enter the code sent to ${formatEmail(resetEmail)}`}
    >
      {errors.general && (
        <div className="mb-6 p-3 bg-[#f8d7da] border border-[#f5c2c7] text-[#DC3545] rounded-md text-sm">
          {errors.general}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="code-0"
            className="block text-sm font-medium text-[#212529] mb-3"
          >
            Verification Code
          </label>

          <div className="flex justify-between gap-2 sm:gap-3">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-full aspect-square text-center text-lg font-semibold rounded-md border border-[#E5E8ED] bg-white ring-offset-background focus:outline-none focus:ring-2 focus:ring-[#0066A1]/30 focus:border-[#0066A1] disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            ))}
          </div>

          {errors.code && (
            <p className="mt-2 text-xs text-[#DC3545]">{errors.code}</p>
          )}
        </div>

        <div className="mt-2 text-center">
          <p className="text-sm text-[#6C757D]">
            For demo purposes, use code: 123456
          </p>
        </div>

        <Button
          type="submit"
          className="w-full py-3 font-semibold h-12 bg-[#0066A1] text-white hover:bg-[#007DB8] transition-colors"
          disabled={isVerifyResetLoading}
        >
          {isVerifyResetLoading ? 'Verifying...' : 'Verify code'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#6C757D]">
          Didn't receive a code?{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResendCode}
              className="text-[#0066A1] hover:underline font-medium"
              disabled={isResetRequestLoading || isVerifyResetLoading}
            >
              {isResetRequestLoading ? 'Sending...' : 'Resend code'}
            </button>
          ) : (
            <span className="text-[#6C757D]">Resend in {countdown}s</span>
          )}
        </p>
      </div>
    </AuthLayout>
  );
}

export default VerifyResetCode;
