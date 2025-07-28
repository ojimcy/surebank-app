import React, { Component, ErrorInfo, ReactNode } from 'react';
import { crashReportingService } from '@/lib/services/crash-reporting';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const errorLogger = logger.create('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;

    // Log error details
    errorLogger.error('Error caught by boundary:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Record error in crash reporting
    this.recordCrashReport(error, errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  }

  private async recordCrashReport(error: Error, errorInfo: ErrorInfo) {
    try {
      // Set context for the crash report
      await crashReportingService.setCustomKeys({
        error_boundary: 'true',
        component_stack: errorInfo.componentStack?.substring(0, 1000) || 'N/A',
        error_id: this.state.errorId || 'unknown',
        timestamp: new Date().toISOString(),
      });

      // Record the error
      await crashReportingService.recordError(error);

      errorLogger.info('Error reported to crash analytics');
    } catch (reportingError) {
      errorLogger.error('Failed to report error:', reportingError);
    }
  }

  private handleReload = () => {
    // Reset error state and reload
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    // Optionally reload the page
    window.location.reload();
  };

  private handleGoHome = () => {
    // Reset error state and navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });

    // Navigate to home page
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-gray-600">
                <p>We're sorry, but something unexpected happened.</p>
                <p className="text-sm mt-2">
                  Our team has been notified and is working on a fix.
                </p>
              </div>

              {this.state.errorId && (
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 text-center">
                    Error ID: {this.state.errorId}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={this.handleReload}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  className="w-full"
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="text-sm text-gray-500 cursor-pointer">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-red-50 rounded text-xs text-red-800 font-mono overflow-auto max-h-32">
                    <div className="font-bold">{this.state.error.message}</div>
                    <div className="mt-2 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </div>
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for recording errors in functional components
export function useErrorReporting() {
  const reportError = React.useCallback(async (error: Error, context?: Record<string, any>) => {
    try {
      if (context) {
        await crashReportingService.setCustomKeys(context);
      }
      await crashReportingService.recordError(error);
    } catch (reportingError) {
      errorLogger.error('Failed to report error:', reportingError);
    }
  }, []);

  const reportNonFatalError = React.useCallback(async (message: string, context?: Record<string, any>) => {
    try {
      if (context) {
        await crashReportingService.setCustomKeys(context);
      }
      await crashReportingService.recordNonFatalError(message);
    } catch (reportingError) {
      errorLogger.error('Failed to report non-fatal error:', reportingError);
    }
  }, []);

  return {
    reportError,
    reportNonFatalError,
  };
}