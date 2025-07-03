import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        // Check if this is an extension-related error
        if (error && error.stack && error.stack.includes('chrome-extension://')) {
            // Don't show error UI for extension errors, just ignore them
            return { hasError: false, error: null };
        }

        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Check if this is an extension-related error
        if (error && error.stack && error.stack.includes('chrome-extension://')) {
            // Log extension errors but don't display them to users
            console.warn('Browser extension error caught and ignored:', error);
            return;
        }

        // Log non-extension errors
        console.error('Application error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return (
                <div className="flex items-center justify-center min-h-screen p-4">
                    <div className="text-center space-y-4">
                        <h1 className="text-xl font-bold text-gray-900">
                            Something went wrong
                        </h1>
                        <p className="text-gray-600">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 