import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { shouldShowOnboarding } from '@/hooks/useOnboarding';

interface OnboardingGuardProps {
  children: ReactNode;
}

// OnboardingGuard checks if user should see the welcome screen
// If onboarding hasn't been completed, redirects to welcome screen
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const location = useLocation();
  const shouldShow = shouldShowOnboarding();

  // Paths that should bypass onboarding check
  const bypassPaths = [
    '/welcome',
    '/settings/setup-pin',
    '/settings/pin-settings',
    '/pin-lock'
  ];

  // If we're on a bypass path, don't redirect
  if (bypassPaths.includes(location.pathname)) {
    return <>{children}</>;
  }

  // If onboarding should be shown, redirect to welcome screen
  if (shouldShow) {
    return <Navigate to="/welcome" replace />;
  }

  // Otherwise, render children
  return <>{children}</>;
}

export default OnboardingGuard;