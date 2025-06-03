import { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/components/layout/AuthLayout';
import Spinner from '@/components/ui/Spinner';

function Verify() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const {
    verifyCode,
    resendVerificationCode,
    isVerifyLoading,
    isResendLoading,
    pendingVerification,
    verificationEmail,
  } = useAuth();
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend button - moved outside conditional
  useEffect(() => {
    // Only run the effect if we're in verification mode
    if (pendingVerification && verificationEmail) {
      const timer =
        countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
      if (countdown === 0) setCanResend(true);
      return () => {
        if (timer) clearInterval(timer);
      };
    }
  }, [countdown, pendingVerification, verificationEmail]);

  // Redirect if not in verification flow
  if (!pendingVerification || !verificationEmail) {
    return <Navigate to="/auth/register" />;
  }

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

      // Focus on the last input
      inputRefs.current[5]?.focus();
    }
  };

  // Mask identifier for display
  const maskIdentifier = (identifier?: string) => {
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

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      setError(null);
      await resendVerificationCode();

      // Reset the countdown
      setCountdown(60);
      setCanResend(false);
    } catch (error: unknown) {
      console.error('Error resending verification code:', error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        'Failed to resend code. Please try again.';
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check if code is complete
    if (code.some((digit) => !digit)) {
      setError('Please enter all 6 digits of the verification code');
      return;
    }

    try {
      await verifyCode(code.join(''));
      navigate('/');
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        'Invalid verification code. Please try again.';

      // Handle specific error types
      if (errorMessage.includes('expired')) {
        setError('Verification code has expired. Please request a new code.');
      } else if (
        errorMessage.includes('invalid') ||
        errorMessage.includes('incorrect')
      ) {
        setError('Invalid verification code. Please try again.');
      } else if (errorMessage.includes('attempts')) {
        setError('Too many failed attempts. Please request a new code.');
      } else {
        setError(errorMessage);
      }
    }
  };

  return (
    <AuthLayout
      title="Verification"
      subtitle={`Enter the 6-digit code we sent to ${maskIdentifier(
        verificationEmail
      )}`}
    >
      {error && (
        <div className="mb-6 p-3 bg-[#f8d7da] border border-[#f5c2c7] text-[#DC3545] rounded-md text-sm">
          {error}
        </div>
      )}

      <form className="space-y-6 relative" onSubmit={handleSubmit}>
        {isVerifyLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-md flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <Spinner size="md" color="primary" />
              <p className="mt-2 text-sm text-gray-600 font-medium">
                Verifying code...
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2 sm:gap-3">
          {code.map((digit, index) => (
            <input
              key={index}
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
              className="w-full aspect-square text-center text-lg font-semibold rounded-md border border-input bg-background ring-offset-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={isVerifyLoading}
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full py-3 font-semibold h-12 bg-[#0066A1] text-white hover:bg-[#007DB8] transition-colors flex items-center justify-center gap-2"
          disabled={isVerifyLoading}
        >
          {isVerifyLoading && <Spinner size="sm" color="white" />}
          <span>{isVerifyLoading ? 'Verifying...' : 'Verify'}</span>
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Didn't receive a code?{' '}
          {canResend ? (
            <button
              type="button"
              onClick={handleResendCode}
              className="text-primary hover:underline font-medium flex items-center justify-center gap-1 mx-auto"
              disabled={isResendLoading || isVerifyLoading}
            >
              {isResendLoading && <Spinner size="sm" color="primary" />}
              <span>{isResendLoading ? 'Sending...' : 'Resend code'}</span>
            </button>
          ) : (
            <span className="text-muted-foreground">
              Resend in {countdown}s
            </span>
          )}
        </p>
      </div>
    </AuthLayout>
  );
}

export default Verify;
