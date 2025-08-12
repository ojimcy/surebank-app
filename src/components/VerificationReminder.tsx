import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-provider';
import { useToast } from '@/lib/toast-provider';
import { Button } from '@/components/ui/button';
import { X, AlertCircle, Mail } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

interface VerificationReminderProps {
  onDismiss?: () => void;
}

function VerificationReminder({ onDismiss }: VerificationReminderProps) {
  const { user, resendVerificationCode, isResendLoading } = useAuth();
  const { success, error: showError } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if user needs verification
  useEffect(() => {
    // Show reminder if user exists and email is not verified
    if (user && !user.isEmailVerified && !isDismissed) {
      // Check if we've already shown this reminder in this session
      const dismissedKey = `verification-reminder-dismissed-${user.id}`;
      const wasDismissed = sessionStorage.getItem(dismissedKey);
      
      if (!wasDismissed) {
        setIsVisible(true);
      }
    }
  }, [user, isDismissed]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResendVerification = async () => {
    if (!canResend || !user?.email) return;

    try {
      setCanResend(false);
      await resendVerificationCode();
      
      success({
        title: 'Verification Email Sent',
        description: 'Please check your email for the verification code.',
      });
      
      // Start countdown for next resend
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      console.error('Failed to resend verification:', err);
      showError({
        title: 'Failed to Send Verification',
        description: 'Unable to send verification email. Please try again later.',
      });
      setCanResend(true);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    
    // Store dismissal in session storage
    if (user) {
      const dismissedKey = `verification-reminder-dismissed-${user.id}`;
      sessionStorage.setItem(dismissedKey, 'true');
    }
    
    onDismiss?.();
  };

  if (!isVisible || !user || user.isEmailVerified) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">
                    Email Verification Required
                  </h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Your email address is not verified. Some features may be limited until you verify your account.
                  </p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Button
                      onClick={handleResendVerification}
                      disabled={!canResend || isResendLoading}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                    >
                      {isResendLoading ? (
                        <>
                          <Spinner size="sm" color="white" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4" />
                          <span>
                            {canResend 
                              ? 'Send Verification Email' 
                              : `Resend in ${countdown}s`}
                          </span>
                        </>
                      )}
                    </Button>
                    
                    <a 
                      href="/auth/verify"
                      className="text-sm text-amber-700 hover:text-amber-900 underline"
                    >
                      Enter verification code
                    </a>
                  </div>
                </div>
                
                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 rounded-md hover:bg-amber-100 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4 text-amber-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationReminder;