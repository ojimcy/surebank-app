import { Button as BaseButton } from '@/components/ui/button';
import {
  primaryButtonStyles,
  secondaryButtonStyles,
  outlineButtonStyles,
  destructiveButtonStyles,
  disabledButtonStyles,
} from '@/lib/button-styles';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive';

interface StyledButtonProps {
  text: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function StyledButton({
  text,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  icon,
  fullWidth = true,
  className = '',
}: StyledButtonProps) {
  // Choose the appropriate style based on variant
  let buttonStyle = '';

  if (disabled) {
    buttonStyle = disabledButtonStyles;
  } else {
    switch (variant) {
      case 'primary':
        buttonStyle = primaryButtonStyles;
        break;
      case 'secondary':
        buttonStyle = secondaryButtonStyles;
        break;
      case 'outline':
        buttonStyle = outlineButtonStyles;
        break;
      case 'destructive':
        buttonStyle = destructiveButtonStyles;
        break;
      default:
        buttonStyle = primaryButtonStyles;
    }
  }

  // Handle width override
  if (!fullWidth) {
    buttonStyle = buttonStyle.replace('w-full', 'w-auto');
  }

  return (
    <BaseButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${buttonStyle} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </BaseButton>
  );
}
