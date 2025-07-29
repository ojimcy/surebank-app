import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeOnboarding } from '@/hooks/useOnboarding';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { 
  Shield, 
  PiggyBank, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft,
  Check
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  features?: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SureBank Stores',
    description: 'Your trusted partner for digital savings and financial growth. Start your journey to financial freedom today.',
    icon: <OptimizedImage src="/favicon.png" alt="SureBank Logo" className="w-20 h-20" />,
    features: [
      'Secure digital banking',
      'High-yield savings packages',
      'Flexible investment options'
    ]
  },
  {
    id: 'savings',
    title: 'Smart Savings Packages',
    description: 'Choose from multiple savings packages designed to grow your money with competitive interest rates.',
    icon: <PiggyBank className="w-16 h-16 text-[#0066A1]" />,
    features: [
      'Daily Savings Plans',
      'Fixed-term Deposits',
      'Flexible Withdrawal Options',
      'Compound Interest Benefits'
    ]
  },
  {
    id: 'growth',
    title: 'Watch Your Money Grow',
    description: 'Track your savings progress with real-time analytics and automated interest calculations.',
    icon: <TrendingUp className="w-16 h-16 text-green-500" />,
    features: [
      'Real-time balance tracking',
      'Interest rate calculator',
      'Growth projections',
      'Performance analytics'
    ]
  },
  {
    id: 'security',
    title: 'Bank-Level Security',
    description: 'Your money and data are protected with industry-standard encryption and multi-factor authentication.',
    icon: <Shield className="w-16 h-16 text-blue-500" />,
    features: [
      'Biometric authentication',
      'End-to-end encryption',
      'Secure transactions'
    ]
  },
];

export function Welcome() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    // Mark onboarding as completed and navigate to dashboard
    completeOnboarding();
    navigate('/');
  };

  const handleCompleteOnboarding = () => {
    // Mark onboarding as completed and navigate to dashboard
    completeOnboarding();
    navigate('/');
  };

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066A1] via-[#004d7a] to-[#003d61] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index <= currentStep
                  ? 'bg-white w-8'
                  : 'bg-white/30 w-2'
              }`}
            />
          ))}
        </div>
        {!isLastStep && (
          <Button
            variant="ghost"
            onClick={skipOnboarding}
            className="text-white hover:bg-white/10"
          >
            Skip
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="bg-white/10 backdrop-blur-sm rounded-full p-6"
              >
                {currentStepData.icon}
              </motion.div>
            </div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-4"
            >
              {currentStepData.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-white/90 mb-8 leading-relaxed"
            >
              {currentStepData.description}
            </motion.p>

            {/* Features */}
            {currentStepData.features && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 mb-8"
              >
                {currentStepData.features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center space-x-3 text-left bg-white/10 backdrop-blur-sm rounded-lg p-3"
                  >
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-white/90">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="text-white hover:bg-white/10 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleCompleteOnboarding}
              className="bg-white text-[#0066A1] hover:bg-white/90 font-semibold px-8"
            >
              Get Started
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-white text-[#0066A1] hover:bg-white/90 font-semibold px-8"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Step Counter */}
      <div className="text-center pb-6">
        <span className="text-white/70 text-sm">
          {currentStep + 1} of {onboardingSteps.length}
        </span>
      </div>
    </div>
  );
}

export default Welcome;