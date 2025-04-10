import React from 'react';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
};

const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
}: SpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  };

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
  };

  return (
    <div
      className={`inline-block rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
