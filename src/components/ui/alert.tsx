import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
    "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground transition-all duration-300 ease-in-out",
    {
        variants: {
            variant: {
                default: "bg-background text-foreground",
                destructive:
                    "border-red-200 text-red-800 bg-red-50 dark:border-red-800 dark:bg-red-950 dark:text-red-300 [&>svg]:text-red-600",
                warning:
                    "border-yellow-200 text-yellow-800 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 [&>svg]:text-yellow-600",
                success:
                    "border-green-200 text-green-800 bg-green-50 dark:border-green-800 dark:bg-green-950 dark:text-green-300 [&>svg]:text-green-600",
                info:
                    "border-blue-200 text-blue-800 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 [&>svg]:text-blue-600",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
  autoCloseTime?: number;
  showCountdown?: boolean;
  showIcon?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant, 
    dismissible = false,
    onDismiss,
    autoCloseTime,
    showCountdown = false,
    showIcon = true,
    children,
    ...props 
  }, ref) => {
    const [timeLeft, setTimeLeft] = React.useState(autoCloseTime);
    const [isVisible, setIsVisible] = React.useState(true);

    const handleDismiss = React.useCallback(() => {
      setIsVisible(false);
      setTimeout(() => {
        onDismiss?.();
      }, 300);
    }, [onDismiss]);

    React.useEffect(() => {
      if (autoCloseTime && autoCloseTime > 0) {
        const interval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev && prev <= 1) {
              handleDismiss();
              return 0;
            }
            return prev ? prev - 1 : 0;
          });
        }, 1000);

        return () => clearInterval(interval);
      }
    }, [autoCloseTime, handleDismiss]);

    const getIcon = () => {
      switch (variant) {
        case "destructive":
          return <AlertCircle className="h-4 w-4" />;
        case "success":
          return <CheckCircle className="h-4 w-4" />;
        case "warning":
          return <AlertTriangle className="h-4 w-4" />;
        case "info":
          return <Info className="h-4 w-4" />;
        default:
          return <Info className="h-4 w-4" />;
      }
    };

    if (!isVisible) {
      return null;
    }

    return (
      <div
        ref={ref}
        role={variant === "destructive" ? "alert" : "status"}
        aria-live="polite"
        className={cn(
          alertVariants({ variant }),
          isVisible ? "animate-in fade-in-0 slide-in-from-top-1" : "animate-out fade-out-0 slide-out-to-top-1",
          className
        )}
        {...props}
      >
        {showIcon && getIcon()}
        <div className="w-full">
          {children}
          {showCountdown && timeLeft && timeLeft > 0 && (
            <div className="text-xs opacity-70 mt-1">
              Auto-closing in {timeLeft}s
            </div>
          )}
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-2 rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h5
        ref={ref}
        className={cn("mb-1 font-medium leading-none tracking-tight", className)}
        {...props}
    />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm [&_p]:leading-relaxed", className)}
        {...props}
    />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription } 