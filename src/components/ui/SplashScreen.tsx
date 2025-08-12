import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  isVisible: boolean;
  message?: string;
  className?: string;
  onComplete?: () => void;
}

export function SplashScreen({
  isVisible,
  message = 'Loading...',
  className,
}: SplashScreenProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'bg-gradient-to-br from-[#0066A1] via-[#004d7a] to-[#003d61]',
        className
      )}
    >
      {/* Logo Animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          delay: 0.2 
        }}
        className="mb-8"
      >
        <img 
          src="/logo-vertical.svg" 
          alt="SurebankStores" 
          className="w-48 h-auto max-w-[80vw]"
        />
      </motion.div>

      {/* Loading Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col items-center"
      >
        {/* Animated dots */}
        <div className="flex space-x-2 mb-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Loading message */}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-white/90 text-sm font-medium tracking-wide"
          >
            {message}
          </motion.p>
        )}
      </motion.div>

      {/* Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-16 text-center"
      >
        <p className="text-white/70 text-xs tracking-widest uppercase">
          Smart Savings, Smarter Shopping
        </p>
      </motion.div>
    </div>
  );
}

export default SplashScreen;