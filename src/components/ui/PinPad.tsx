import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  onSubmit?: () => void;
  showForgot?: boolean;
  onForgot?: () => void;
}

export function PinPad({
  value,
  onChange,
  maxLength = 6,
  onSubmit,
  showForgot = false,
  onForgot,
}: PinPadProps) {
  const [pin, setPin] = useState(value);

  // Sync pin with parent's value
  useEffect(() => {
    setPin(value);
  }, [value]);

  // Handle number press
  const handleNumberPress = (num: number) => {
    if (pin.length < maxLength) {
      const newPin = pin + num;
      setPin(newPin);
      onChange(newPin);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (pin.length > 0) {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      onChange(newPin);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (onSubmit && pin.length >= 4) {
      onSubmit();
    }
  };

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="flex flex-col items-center">
      {/* PIN pad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleNumberPress(num)}
            className="bg-white h-12 w-full rounded-lg text-lg font-semibold text-gray-800 border border-gray-200 hover:bg-blue-50 hover:border-[#0066A1] active:bg-blue-100 transition-all duration-150 shadow-sm"
          >
            {num}
          </button>
        ))}

        {/* Bottom row */}
        <div className="flex items-center justify-center">
          {showForgot && (
            <button
              onClick={onForgot}
              className="text-[#0066A1] text-sm font-medium hover:text-[#004d7a] transition-colors"
            >
              Forgot?
            </button>
          )}
        </div>

        <button
          onClick={() => handleNumberPress(0)}
          className="bg-white h-12 w-full rounded-lg text-lg font-semibold text-gray-800 border border-gray-200 hover:bg-blue-50 hover:border-[#0066A1] active:bg-blue-100 transition-all duration-150 shadow-sm"
        >
          0
        </button>

        <button
          onClick={handleDelete}
          className="bg-white h-12 w-full rounded-lg flex items-center justify-center border border-gray-200 hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-all duration-150 shadow-sm group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Submit button */}
      {onSubmit && (
        <div className="mt-6 w-full">
          <Button
            onClick={handleSubmit}
            className="w-full h-12 bg-gradient-to-r from-[#0066A1] to-[#004d7a] hover:from-[#004d7a] hover:to-[#003d5c] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
            disabled={pin.length < 4}
          >
            {pin.length < 4 ? 'Enter PIN' : 'Confirm PIN'}
          </Button>
        </div>
      )}
    </div>
  );
}
