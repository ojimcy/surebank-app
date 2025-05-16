import * as React from "react";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

interface RadioGroupItemElement extends React.ReactElement {
  props: {
    value: string;
    checked?: boolean;
    onChange?: () => void;
  };
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, children, value, onValueChange, ...props }, ref) => {
    const handleChange = React.useCallback(
      (newValue: string) => {
        if (onValueChange) {
          onValueChange(newValue);
        }
      },
      [onValueChange]
    );

    // Clone children and pass the necessary props
    const enhancedChildren = React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        // Type assertion to access props safely
        const childElement = child as RadioGroupItemElement;
        return React.cloneElement(childElement, {
          checked: childElement.props.value === value,
          onChange: () => handleChange(childElement.props.value),
        });
      }
      return child;
    });

    return (
      <div className={cn("grid gap-2", className)} ref={ref} {...props}>
        {enhancedChildren}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: React.ReactNode;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, id, checked, onChange, label, ...props }, ref) => {
     return (
      <div className="flex items-center space-x-2">
         <input
           type="radio"
           id={id}
           ref={ref}
           checked={checked}
           onChange={onChange}
           className="sr-only"
           {...props}
         />
         <label
           htmlFor={id}
           className={cn(
             "relative flex h-4 w-4 cursor-pointer rounded-full border border-gray-300",
             checked && "border-primary",
             className
           )}
         >
           {checked && (
             <div className="absolute inset-0 flex items-center justify-center">
               <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
             </div>
           )}
         </label>
        {label && (
          <label htmlFor={id} className="cursor-pointer text-sm">
            {label}
          </label>
        )}
       </div>
     );
   }
 );
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
