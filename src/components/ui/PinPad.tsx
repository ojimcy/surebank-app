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
      {/* PIN display */}
      <div className="w-full mb-6 flex justify-center">
        <div className="flex gap-2">
          {Array.from({ length: maxLength }).map((_, index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 ${
                index < pin.length
                  ? 'bg-[#0066A1] border-[#0066A1]'
                  : 'bg-transparent border-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* PIN pad */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleNumberPress(num)}
            className="bg-white h-14 w-full rounded-xl text-xl font-semibold text-gray-800 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            {num}
          </button>
        ))}

        {/* Bottom row */}
        <div className="flex items-center justify-center">
          {showForgot && (
            <button
              onClick={onForgot}
              className="text-[#0066A1] text-sm font-medium"
            >
              Forgot
            </button>
          )}
        </div>

        <button
          onClick={() => handleNumberPress(0)}
          className="bg-white h-14 w-full rounded-xl text-xl font-semibold text-gray-800 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          0
        </button>

        <button
          onClick={handleDelete}
          className="bg-white h-14 w-full rounded-xl flex items-center justify-center shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 012.828 0L21 12m-3 5H7a2 2 0 01-2-2V7"
            />
          </svg>
        </button>
      </div>

      {/* Submit button */}
      {onSubmit && (
        <div className="mt-6 w-full">
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#0066A1] text-white"
            disabled={pin.length < 6}
          >
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
}
