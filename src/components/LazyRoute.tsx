import React, { Suspense, ComponentType } from 'react';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { crashReportingService } from '@/lib/services/crash-reporting';

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}

export function LazyRoute({ children, fallback, name }: LazyRouteProps) {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingOverlay isLoading={true} message="Loading..." />
    </div>
  );

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log lazy loading errors
        crashReportingService.recordError(error, {
          error_type: 'LAZY_LOADING_ERROR',
          route_name: name || 'unknown',
          component_stack: errorInfo.componentStack?.substring(0, 500),
        });
      }}
    >
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Higher-order component for creating lazy routes
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  name?: string,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));
  
  return function WrappedLazyComponent(props: P) {
    return (
      <LazyRoute name={name} fallback={fallback}>
        <LazyComponent {...props} />
      </LazyRoute>
    );
  };
}

// Create a lazy wrapper for dynamic imports
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  name?: string,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFn);
  
  return function LazyWrapper(props: P) {
    return (
      <LazyRoute name={name} fallback={fallback}>
        <LazyComponent {...props} />
      </LazyRoute>
    );
  };
}