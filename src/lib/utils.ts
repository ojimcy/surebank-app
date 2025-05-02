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

// Format timestamp to date with ordinal suffix (e.g., "30th Apr, 2025")
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);

  // Get day with ordinal suffix
  const day = date.getDate();
  const ordinalSuffix = getOrdinalSuffix(day);

  // Format the date
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day}${ordinalSuffix} ${month}, ${year}`;
}

// Helper function to get ordinal suffix for a number
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

// Format datetime
export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return 'N/A';
  try {
    let date: Date;

    // If it's a numeric string (timestamp), convert to number first
    if (!isNaN(Number(dateString))) {
      date = new Date(Number(dateString));
    } else {
      date = new Date(dateString);
    }

    // Validate if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const formatted = date.toLocaleString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return formatted;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid date';
  }
}
