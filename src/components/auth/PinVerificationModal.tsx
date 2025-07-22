import { useState, useEffect } from 'react';
import { usePin } from '@/lib/pin-provider';
import { PinPad } from '@/components/ui/PinPad';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AlertCircle, Shield } from 'lucide-react';
import storage from '@/lib/api/storage';

// Storage keys for PIN verification
const LAST_VERIFICATION_KEY = 'last-pin-verification';
const FAILED_ATTEMPTS_KEY = 'pin-failed-attempts';
const LOCKOUT_END_KEY = 'pin-lockout-end';
const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes

export interface PinVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
  bypassSession?: boolean; // Force verification even if session is active
}

export function PinVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Verify PIN',
  description = 'Enter your PIN to continue with this operation',
  bypassSession = false,
}: PinVerificationModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const { verifyPin } = usePin();

  // Check for active session
  useEffect(() => {
    const checkSession = async () => {
      if (!isOpen || bypassSession) return;

      const lastVerification = await storage.getItem(LAST_VERIFICATION_KEY);
      if (lastVerification) {
        const lastTime = parseInt(lastVerification, 10);
        if (Date.now() - lastTime < SESSION_DURATION) {
          // Session is still active, auto-success
          onSuccess();
          onClose();
        }
      }
    };

    checkSession();
  }, [isOpen, bypassSession, onSuccess, onClose]);

  // Load failed attempts and check lockout
  useEffect(() => {
    const loadAttempts = async () => {
      if (!isOpen) return;

      // Check lockout
      const lockoutEnd = await storage.getItem(LOCKOUT_END_KEY);
      if (lockoutEnd) {
        const endTime = parseInt(lockoutEnd, 10);
        if (Date.now() < endTime) {
          setIsLocked(true);
          setLockoutEndTime(endTime);
        } else {
          // Lockout expired, clear it
          await storage.removeItem(LOCKOUT_END_KEY);
          await storage.removeItem(FAILED_ATTEMPTS_KEY);
        }
      }

      // Load failed attempts
      const attempts = await storage.getItem(FAILED_ATTEMPTS_KEY);
      if (attempts) {
        setFailedAttempts(parseInt(attempts, 10));
      }
    };

    loadAttempts();
  }, [isOpen]);

  // Update lockout timer
  useEffect(() => {
    if (!isLocked || !lockoutEndTime) return;

    const interval = setInterval(() => {
      if (Date.now() >= lockoutEndTime) {
        setIsLocked(false);
        setLockoutEndTime(null);
        storage.removeItem(LOCKOUT_END_KEY);
        storage.removeItem(FAILED_ATTEMPTS_KEY);
        setFailedAttempts(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockoutEndTime]);

  const handlePinChange = (value: string) => {
    setPin(value);
    setError('');
  };

  const getLockoutDuration = (attempts: number): number => {
    if (attempts >= 10) return 30 * 60 * 1000; // 30 minutes
    if (attempts >= 5) return 5 * 60 * 1000; // 5 minutes
    if (attempts >= 3) return 60 * 1000; // 1 minute
    return 0;
  };

  const handleSubmit = async () => {
    if (isLocked) {
      const remainingTime = lockoutEndTime ? lockoutEndTime - Date.now() : 0;
      const minutes = Math.ceil(remainingTime / 60000);
      setError(`Too many failed attempts. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`);
      return;
    }

    if (verifyPin(pin)) {
      // Success - clear attempts and set session
      await storage.removeItem(FAILED_ATTEMPTS_KEY);
      await storage.setItem(LAST_VERIFICATION_KEY, Date.now().toString());
      setPin('');
      setError('');
      setFailedAttempts(0);
      onSuccess();
      onClose();
    } else {
      // Failed attempt
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      await storage.setItem(FAILED_ATTEMPTS_KEY, newAttempts.toString());

      // Check if we need to lock out
      const lockoutDuration = getLockoutDuration(newAttempts);
      if (lockoutDuration > 0) {
        const lockoutEnd = Date.now() + lockoutDuration;
        await storage.setItem(LOCKOUT_END_KEY, lockoutEnd.toString());
        setIsLocked(true);
        setLockoutEndTime(lockoutEnd);
        
        const minutes = Math.ceil(lockoutDuration / 60000);
        setError(`Too many failed attempts. Locked for ${minutes} minute${minutes > 1 ? 's' : ''}.`);
      } else {
        setError(`Incorrect PIN. ${3 - newAttempts} attempts remaining before lockout.`);
      }
      
      setPin('');
    }
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutEndTime) return '';
    const remaining = lockoutEndTime - Date.now();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#0066A1] to-[#004d7a] px-6 py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-white mb-2">{title}</DialogTitle>
          <DialogDescription className="text-blue-100 text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </div>

        {/* Content Section */}
        <div className="px-6 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {isLocked && lockoutEndTime && (
            <div className="mb-6 p-6 bg-orange-50 border border-orange-200 rounded-xl text-center">
              <div className="bg-orange-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Account Temporarily Locked</h3>
              <p className="text-orange-700 mb-3">Too many failed attempts</p>
              <div className="bg-white rounded-lg p-3 border border-orange-200">
                <p className="text-2xl font-mono font-bold text-orange-800">
                  {getRemainingLockoutTime()}
                </p>
                <p className="text-xs text-orange-600 uppercase tracking-wide">Time Remaining</p>
              </div>
            </div>
          )}

          {!isLocked && (
            <div className="space-y-6">
              {/* PIN Display */}
              <div className="flex justify-center">
                <div className="flex space-x-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        index < pin.length
                          ? 'bg-[#0066A1] border-[#0066A1] scale-110'
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* PIN Pad */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <PinPad
                  value={pin}
                  onChange={handlePinChange}
                  onSubmit={handleSubmit}
                  maxLength={6}
                />
              </div>
            </div>
          )}

          {failedAttempts > 0 && !isLocked && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-center text-yellow-700">
                <span className="font-semibold">Warning:</span> {failedAttempts} failed attempt{failedAttempts > 1 ? 's' : ''}. 
                Account will be locked after {3 - failedAttempts} more failed attempt{3 - failedAttempts !== 1 ? 's' : ''}.
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="ml-2 text-xs text-blue-700">
                Your PIN is stored securely on your device and never transmitted to our servers.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

