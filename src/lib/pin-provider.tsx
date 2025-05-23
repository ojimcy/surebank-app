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
import storage from './api/storage';

// Storage keys
const PIN_KEY = 'pin';
const INACTIVITY_TIMEOUT_KEY = 'inactivityTimeout';

// Inactivity timeout in milliseconds (5 minutes by default)
const DEFAULT_INACTIVITY_TIMEOUT = 5 * 60 * 1000;

interface PinContextType {
  // PIN management
  isPinSet: boolean;
  isLocked: boolean;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => boolean;
  lockApp: () => void;
  unlockApp: (pin: string) => boolean;

  // Settings
  inactivityTimeout: number;
  setInactivityTimeout: (timeout: number) => Promise<void>;

  // For development/testing
  clearPin: () => Promise<void>;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export function PinProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State
  const [pin, setPin] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [inactivityTimeout, setInactivityTimeout] = useState(DEFAULT_INACTIVITY_TIMEOUT);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial values
  useEffect(() => {
    const loadValues = async () => {
      // Load PIN
      const savedPin = await storage.getItem(PIN_KEY);
      setPin(savedPin);
      
      // Load inactivity timeout
      const savedTimeout = await storage.getItem(INACTIVITY_TIMEOUT_KEY);
      if (savedTimeout) {
        setInactivityTimeout(Number(savedTimeout));
      }
      
      setIsLoaded(true);
    };
    
    loadValues();
  }, []);

  // Setup a new PIN
  const setupPin = useCallback(async (newPin: string) => {
    if (newPin.length < 4) {
      throw new Error('PIN must be at least 4 digits');
    }

    await storage.setItem(PIN_KEY, newPin);
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
  const clearPin = useCallback(async () => {
    await storage.removeItem(PIN_KEY);
    setPin(null);
    setIsLocked(false);
  }, []);

  // Update inactivity timeout
  const updateInactivityTimeout = useCallback(async (timeout: number) => {
    await storage.setItem(INACTIVITY_TIMEOUT_KEY, timeout.toString());
    setInactivityTimeout(timeout);
  }, []);

  // Track user activity to reset the inactivity timer
  useEffect(() => {
    if (!isAuthenticated || !pin || !isLoaded) return;

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
  }, [isAuthenticated, pin, isLoaded]);

  // Check for inactivity and lock app if needed
  useEffect(() => {
    if (!isAuthenticated || !pin || isLocked || !isLoaded) return;

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
    isLoaded,
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
