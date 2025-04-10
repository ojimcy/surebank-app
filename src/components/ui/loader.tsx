import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const loaderVariants = cva('animate-spin text-[--muted-foreground]', {
  variants: {
    size: {
      default: 'h-8 w-8',
      sm: 'h-6 w-6',
      lg: 'h-10 w-10',
      xl: 'h-16 w-16',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

interface LoaderProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xl';
  fullScreen?: boolean;
  text?: string;
}

export function Loader({
  className,
  size,
  fullScreen = false,
  text,
}: LoaderProps) {
  const spinner = (
    <svg
      className={cn(loaderVariants({ size }), className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  // If it's not a full screen loader, just return the spinner
  if (!fullScreen) {
    return text ? (
      <div className="flex flex-col items-center gap-2">
        {spinner}
        <span className="text-sm text-[--muted-foreground]">{text}</span>
      </div>
    ) : (
      spinner
    );
  }

  // Full screen loader with overlay
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50">
      <div className="bg-[--background] rounded-lg p-6 shadow-lg flex flex-col items-center">
        {spinner}
        {text && <span className="mt-3 text-sm">{text}</span>}
      </div>
    </div>
  );
}
