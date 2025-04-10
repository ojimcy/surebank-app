import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './auth-provider';

// Inactivity timeout in milliseconds (5 minutes by default)
const DEFAULT_INACTIVITY_TIMEOUT = 5 * 60 * 1000;

interface PinContextType {
  // PIN management
  isPinSet: boolean;
  isLocked: boolean;
  setupPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  lockApp: () => void;
  unlockApp: (pin: string) => boolean;

  // Settings
  inactivityTimeout: number;
  setInactivityTimeout: (timeout: number) => void;

  // For development/testing
  clearPin: () => void;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export function PinProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State
  const [pin, setPin] = useState<string | null>(localStorage.getItem('pin'));
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [inactivityTimeout, setInactivityTimeout] = useState(
    Number(localStorage.getItem('inactivityTimeout')) ||
      DEFAULT_INACTIVITY_TIMEOUT
  );

  // Setup a new PIN
  const setupPin = useCallback((newPin: string) => {
    if (newPin.length < 4) {
      throw new Error('PIN must be at least 4 digits');
    }

    localStorage.setItem('pin', newPin);
    setPin(newPin);
    setIsLocked(false);
  }, []);

  // Verify PIN without unlocking
  const verifyPin = useCallback(
    (inputPin: string) => {
      return pin === inputPin;
    },
    [pin]
  );

  // Lock the app
  const lockApp = useCallback(() => {
    if (pin) {
      setIsLocked(true);
      navigate('/pin-lock');
    }
  }, [pin, navigate]);

  // Unlock the app with PIN
  const unlockApp = useCallback(
    (inputPin: string) => {
      if (verifyPin(inputPin)) {
        setIsLocked(false);
        setLastActivity(Date.now());
        return true;
      }
      return false;
    },
    [verifyPin]
  );

  // Clear PIN (for settings/development)
  const clearPin = useCallback(() => {
    localStorage.removeItem('pin');
    setPin(null);
    setIsLocked(false);
  }, []);

  // Update inactivity timeout
  const updateInactivityTimeout = useCallback((timeout: number) => {
    localStorage.setItem('inactivityTimeout', timeout.toString());
    setInactivityTimeout(timeout);
  }, []);

  // Track user activity to reset the inactivity timer
  useEffect(() => {
    if (!isAuthenticated || !pin) return;

    const resetTimer = () => {
      setLastActivity(Date.now());
    };

    // Add event listeners to track user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('touchmove', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    return () => {
      // Clean up event listeners
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('touchmove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, [isAuthenticated, pin]);

  // Check for inactivity and lock app if needed
  useEffect(() => {
    if (!isAuthenticated || !pin || isLocked) return;

    const checkInactivity = () => {
      if (Date.now() - lastActivity > inactivityTimeout) {
        lockApp();
      }
    };

    const intervalId = setInterval(checkInactivity, 10000); // Check every 10 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [
    isAuthenticated,
    pin,
    isLocked,
    lastActivity,
    inactivityTimeout,
    lockApp,
  ]);

  const contextValue: PinContextType = {
    isPinSet: !!pin,
    isLocked,
    setupPin,
    verifyPin,
    lockApp,
    unlockApp,
    inactivityTimeout,
    setInactivityTimeout: updateInactivityTimeout,
    clearPin,
  };

  return (
    <PinContext.Provider value={contextValue}>{children}</PinContext.Provider>
  );
}

export function usePin() {
  const context = useContext(PinContext);
  if (context === undefined) {
    throw new Error('usePin must be used within a PinProvider');
  }
  return context;
}
