import { cn } from '@/lib/utils';
import Spinner from './Spinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  spinnerColor?: 'primary' | 'white' | 'gray';
}

export function LoadingOverlay({
  isLoading,
  message = 'Loading...',
  fullScreen = false,
  className,
  spinnerSize = 'md',
  spinnerColor = 'primary',
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0',
        className
      )}
    >
      <div className="flex flex-col items-center p-4 rounded-lg text-center">
        <Spinner size={spinnerSize} color={spinnerColor} />
        {message && (
          <p className="mt-3 text-sm font-medium text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}

export default LoadingOverlay;
