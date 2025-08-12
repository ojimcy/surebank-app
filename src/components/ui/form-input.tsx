import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    helperText, 
    showPasswordToggle = false,
    leftIcon,
    rightIcon,
    disabled,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const inputType = showPasswordToggle 
      ? (showPassword ? "text" : "password") 
      : type;

    const hasError = !!error;
    const hasLeftIcon = !!leftIcon;
    const hasRightContent = !!(rightIcon || showPasswordToggle);

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={props.id}
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
          {hasLeftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <div className={cn(
                "transition-colors",
                hasError 
                  ? "text-red-500" 
                  : isFocused 
                    ? "text-blue-600" 
                    : "text-gray-400"
              )}>
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            type={inputType}
            className={cn(
              "block w-full rounded-md border bg-white text-sm transition-all duration-200",
              "placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hasLeftIcon ? "pl-10" : "pl-3",
              hasRightContent ? "pr-10" : "pr-3",
              "py-2.5 h-12",
              hasError
                ? "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500/20",
              isFocused && !hasError && "border-blue-500",
              className
            )}
            ref={ref}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${props.id}-error` : 
              helperText ? `${props.id}-helper` : 
              undefined
            }
            {...props}
          />
          
          {hasRightContent && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={disabled}
                  className={cn(
                    "transition-colors hover:text-gray-700 focus:outline-none",
                    hasError ? "text-red-500" : "text-gray-400",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <div className={cn(
                  "transition-colors",
                  hasError 
                    ? "text-red-500" 
                    : isFocused 
                      ? "text-blue-600" 
                      : "text-gray-400"
                )}>
                  {rightIcon}
                </div>
              )}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="min-h-5">
            {error ? (
              <p 
                id={`${props.id}-error`}
                className="text-xs text-red-600 animate-in fade-in-0 slide-in-from-top-1"
              >
                {error}
              </p>
            ) : helperText ? (
              <p 
                id={`${props.id}-helper`}
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
FormInput.displayName = "FormInput";

export { FormInput };