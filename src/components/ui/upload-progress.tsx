import React from 'react';

interface UploadProgressProps {
  progress: number;
  isUploading: boolean;
  error: Error | null;
  fileName: string;
  onRetry?: () => void;
}

export function UploadProgress({ 
  progress, 
  isUploading, 
  error, 
  fileName, 
  onRetry 
}: UploadProgressProps) {
  // Truncate long file names
  const truncatedFileName = fileName.length > 20 
    ? `${fileName.substring(0, 10)}...${fileName.substring(fileName.length - 7)}` 
    : fileName;

  if (error) {
    return (
      <div className="mt-2 bg-red-50 border border-red-200 rounded-md p-2">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-red-500 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span className="text-sm text-red-700 mr-2">Upload failed: {error.message}</span>
          {onRetry && (
            <button 
              onClick={onRetry} 
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div className="mt-2 bg-blue-50 border border-blue-200 rounded-md p-2">
        <div className="flex items-center mb-1">
          <svg 
            className="animate-spin h-4 w-4 text-blue-600 mr-2" 
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
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-blue-700">Uploading {truncatedFileName}</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-blue-700 text-right mt-1">{progress}%</div>
      </div>
    );
  }

  if (progress === 100) {
    return (
      <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-2">
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 text-green-500 mr-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <span className="text-sm text-green-700">Upload complete: {truncatedFileName}</span>
        </div>
      </div>
    );
  }

  return null;
}
