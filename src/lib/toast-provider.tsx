import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import {
  Toast,
  ToastProvider as ToastUIProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

// Let's install uuid first
// npm install uuid @types/uuid

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  // Helper functions
  success: (options: {
    title: string;
    description?: string;
    duration?: number;
  }) => void;
  error: (options: {
    title: string;
    description?: string;
    duration?: number;
  }) => void;
  info: (options: {
    title: string;
    description?: string;
    duration?: number;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Icons
const SuccessIcon = () => (
  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100">
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.66674 10.1147L12.7947 3.98599L13.7381 4.92866L6.66674 12L2.42407 7.75733L3.36674 6.81466L6.66674 10.1147Z"
        fill="currentColor"
      />
    </svg>
  </div>
);

const ErrorIcon = () => (
  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100">
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.00047 11.3334C8.36825 11.3334 8.66714 11.0345 8.66714 10.6667C8.66714 10.2989 8.36825 10 8.00047 10C7.6327 10 7.33381 10.2989 7.33381 10.6667C7.33381 11.0345 7.6327 11.3334 8.00047 11.3334Z"
        fill="currentColor"
      />
      <path
        d="M8.00047 8.66675C8.36825 8.66675 8.66714 8.36786 8.66714 8.00008V5.33341C8.66714 4.96564 8.36825 4.66675 8.00047 4.66675C7.6327 4.66675 7.33381 4.96564 7.33381 5.33341V8.00008C7.33381 8.36786 7.6327 8.66675 8.00047 8.66675Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00047 14.6667C11.6824 14.6667 14.6671 11.682 14.6671 8.00008C14.6671 4.31817 11.6824 1.33341 8.00047 1.33341C4.31856 1.33341 1.33381 4.31817 1.33381 8.00008C1.33381 11.682 4.31856 14.6667 8.00047 14.6667ZM8.00047 13.3334C10.9455 13.3334 13.3338 10.9451 13.3338 8.00008C13.3338 5.05508 10.9455 2.66675 8.00047 2.66675C5.05547 2.66675 2.66714 5.05508 2.66714 8.00008C2.66714 10.9451 5.05547 13.3334 8.00047 13.3334Z"
        fill="currentColor"
      />
    </svg>
  </div>
);

const InfoIcon = () => (
  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100">
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.00047 4.00008C8.36825 4.00008 8.66714 3.70118 8.66714 3.33341C8.66714 2.96564 8.36825 2.66675 8.00047 2.66675C7.6327 2.66675 7.33381 2.96564 7.33381 3.33341C7.33381 3.70118 7.6327 4.00008 8.00047 4.00008Z"
        fill="currentColor"
      />
      <path
        d="M8.66714 5.33341C8.66714 4.96564 8.36825 4.66675 8.00047 4.66675C7.6327 4.66675 7.33381 4.96564 7.33381 5.33341V12.0001C7.33381 12.3678 7.6327 12.6667 8.00047 12.6667C8.36825 12.6667 8.66714 12.3678 8.66714 12.0001V5.33341Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.33381 8.00008C1.33381 4.31817 4.31856 1.33341 8.00047 1.33341C11.6824 1.33341 14.6671 4.31817 14.6671 8.00008C14.6671 11.682 11.6824 14.6667 8.00047 14.6667C4.31856 14.6667 1.33381 11.682 1.33381 8.00008ZM8.00047 2.66675C5.05547 2.66675 2.66714 5.05508 2.66714 8.00008C2.66714 10.9451 5.05547 13.3334 8.00047 13.3334C10.9455 13.3334 13.3338 10.9451 13.3338 8.00008C13.3338 5.05508 10.9455 2.66675 8.00047 2.66675Z"
        fill="currentColor"
      />
    </svg>
  </div>
);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = uuid();
    const duration =
      toast.duration || (toast.variant === 'destructive' ? 8000 : 6000);

    setToasts((prev) => [...prev, { id, duration, ...toast }]);

    // Auto remove toast after duration
    if (duration) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Helper functions for different toast types
  const success = useCallback(
    ({
      title,
      description,
      duration,
    }: {
      title: string;
      description?: string;
      duration?: number;
    }) => {
      addToast({
        title,
        description,
        variant: 'success',
        duration,
      });
    },
    [addToast]
  );

  const error = useCallback(
    ({
      title,
      description,
      duration,
    }: {
      title: string;
      description?: string;
      duration?: number;
    }) => {
      addToast({
        title,
        description,
        variant: 'destructive',
        duration,
      });
    },
    [addToast]
  );

  const info = useCallback(
    ({
      title,
      description,
      duration,
    }: {
      title: string;
      description?: string;
      duration?: number;
    }) => {
      addToast({
        title,
        description,
        variant: 'default',
        duration,
      });
    },
    [addToast]
  );

  const getToastIcon = (variant?: 'default' | 'destructive' | 'success') => {
    switch (variant) {
      case 'success':
        return <SuccessIcon />;
      case 'destructive':
        return <ErrorIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, info }}
    >
      {children}
      <ToastUIProvider>
        {toasts.map(({ id, title, description, variant, ...props }) => (
          <Toast
            key={id}
            variant={variant}
            onOpenChange={(open) => {
              if (!open) removeToast(id);
            }}
            {...props}
          >
            {getToastIcon(variant)}
            <div className="flex-1 grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastUIProvider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
