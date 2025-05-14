import { ReactNode } from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="relative flex items-center">
              {/* Line before */}
              {index > 0 && (
                <div 
                  className={`h-0.5 w-10 md:w-20 -ml-5 md:-ml-10 ${
                    index <= currentStep ? 'bg-[#0066A1]' : 'bg-gray-300'
                  }`} 
                />
              )}
              
              {/* Step circle */}
              <button
                onClick={() => onStepClick && index < currentStep && onStepClick(index)}
                disabled={!onStepClick || index > currentStep}
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  index < currentStep
                    ? 'bg-[#0066A1] text-white cursor-pointer'
                    : index === currentStep
                    ? 'bg-[#0066A1] text-white'
                    : 'bg-gray-200 text-gray-500'
                } ${onStepClick && index < currentStep ? 'hover:bg-[#005085]' : ''}`}
              >
                {index < currentStep ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
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
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>
              
              {/* Line after */}
              {index < steps.length - 1 && (
                <div 
                  className={`h-0.5 w-10 md:w-20 -mr-5 md:-mr-10 ${
                    index < currentStep ? 'bg-[#0066A1]' : 'bg-gray-300'
                  }`} 
                />
              )}
            </div>
            
            {/* Step label */}
            <span 
              className={`mt-2 text-xs md:text-sm text-center ${
                index <= currentStep ? 'text-[#0066A1] font-medium' : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StepContentProps {
  children: ReactNode;
  isActive: boolean;
}

export function StepContent({ children, isActive }: StepContentProps) {
  if (!isActive) return null;
  return <div className="mt-6">{children}</div>;
}
