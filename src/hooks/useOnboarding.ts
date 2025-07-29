import { useState, useEffect } from 'react';

interface OnboardingState {
  isCompleted: boolean;
  shouldShow: boolean;
  markAsCompleted: () => void;
  resetOnboarding: () => void;
}

const ONBOARDING_STORAGE_KEY = 'surebank_onboarding_completed';

export function useOnboarding(): OnboardingState {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [shouldShow, setShouldShow] = useState<boolean>(false);

  useEffect(() => {
    // Check if onboarding has been completed before
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    setIsCompleted(completed);
    
    // Show onboarding if not completed and user is authenticated
    setShouldShow(!completed);
  }, []);

  const markAsCompleted = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsCompleted(true);
    setShouldShow(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setIsCompleted(false);
    setShouldShow(true);
  };

  return {
    isCompleted,
    shouldShow,
    markAsCompleted,
    resetOnboarding,
  };
}

// Helper function to check if user should see onboarding
export function shouldShowOnboarding(): boolean {
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== 'true';
}

// Helper function to mark onboarding as completed
export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
}

export default useOnboarding;