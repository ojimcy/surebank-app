import * as React from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  onChange: (value: string) => void;
  value: string;
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    onChange,
    value,
    disabled,
    max,
    min,
    id,
    ...props 
  }, ref) => {
    // Format date from YYYY-MM-DD to DD/MM/YYYY for display
    const formatDateForDisplay = (dateStr: string): string => {
      if (!dateStr) return '';
      const date = new Date(dateStr + 'T00:00:00'); // Avoid timezone issues
      if (isNaN(date.getTime())) return '';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const isoDate = e.target.value;
      onChange(isoDate);
    };

    const displayValue = value ? formatDateForDisplay(value) : '';
    const hasError = !!error;

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "block text-sm font-medium transition-colors",
              hasError ? "text-red-600" : "text-gray-700",
              disabled && "opacity-50"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Date Input */}
          <input
            ref={ref}
            type="date"
            className={cn(
              "block w-full rounded-md border bg-white text-sm transition-all duration-200",
              "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "px-3 py-2.5 h-12",
              hasError
                ? "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20",
              className
            )}
            value={value || ''}
            onChange={handleDateChange}
            min={min}
            max={max}
            disabled={disabled}
            id={id}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${id}-error` : 
              helperText ? `${id}-helper` : 
              undefined
            }
            {...props}
          />
        </div>
        
        {(error || helperText) && (
          <div className="min-h-5">
            {error ? (
              <p 
                id={`${id}-error`}
                className="text-xs text-red-600 animate-in fade-in-0 slide-in-from-top-1"
              >
                {error}
              </p>
            ) : helperText ? (
              <p 
                id={`${id}-helper`}
                className="text-xs text-gray-500"
              >
                {helperText}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput };