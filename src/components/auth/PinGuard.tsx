import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePin } from '@/lib/pin-provider';

interface PinGuardProps {
  children: ReactNode;
}

export function PinGuard({ children }: PinGuardProps) {
  const { isLocked, isPinSet } = usePin();
  const location = useLocation();

  // If PIN is not set, or we're already on the PIN lock page, or PIN setup pages, just render children
  if (
    !isPinSet ||
    location.pathname === '/pin-lock' ||
    location.pathname === '/settings/setup-pin' ||
    location.pathname === '/settings/pin-settings'
  ) {
    return <>{children}</>;
  }

  // If app is locked, redirect to PIN lock screen
  if (isLocked) {
    return (
      <Navigate to="/pin-lock" state={{ from: location.pathname }} replace />
    );
  }

  // Otherwise, render children
  return <>{children}</>;
}

export default PinGuard;
