import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-provider';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface AuthGuardProps {
  children: ReactNode;
  redirectPath?: string;
}

// AuthGuard ensures a user is authenticated before allowing access to a route
// If not authenticated, redirects to login or a specified path
export function AuthGuard({
  children,
  redirectPath = '/auth/login',
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While auth state is loading, show a loading overlay
  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <LoadingOverlay
          isLoading={true}
          message="Loading your account..."
          fullScreen={true}
          spinnerSize="md"
        />
      </div>
    );
  }

  // If not authenticated, redirect to login with a return URL
  if (!isAuthenticated) {
    // Store the attempted URL for redirecting back after login
    return (
      <Navigate to={redirectPath} state={{ from: location.pathname }} replace />
    );
  }

  // If authenticated, render the protected content
  return <>{children}</>;
}

export default AuthGuard;
