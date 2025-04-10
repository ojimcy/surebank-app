import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define a type for API errors
interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

// Extract error message from API error responses
export function extractErrorMessage(error: unknown): string {
  const apiError = error as ApiError;

  if (apiError.response?.data?.message) {
    return apiError.response.data.message;
  } else if (apiError.response?.data?.error) {
    return apiError.response.data.error;
  } else if (apiError.message) {
    return apiError.message;
  }
  return 'An unexpected error occurred';
}
