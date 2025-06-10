import { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@/lib/api/auth';
import { AnnouncementCard } from './AnnouncementCard';
import {  MailWarning, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toast-provider';
import { useNavigate } from 'react-router-dom';

type Announcement = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  cta?: {
    text: string;
    onClick: () => void;
  };
  link?: string;
  condition: (user: User) => boolean;
};

type AnnouncementsProps = {
  user: User | null;
};

export function Announcements({ user }: AnnouncementsProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const { resendVerificationCode } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleDismiss = (id: string) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('announcements_dismissed', JSON.stringify(newDismissed));
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    try {
      await resendVerificationCode(user.email);
      toast.success({
        title: 'Verification email sent!',
      });
    } catch {
      toast.error({
        title: 'Failed to send verification email.',
      });
    }
  };

  const getKycStatusText = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Your KYC verification is pending approval.';
      case 'rejected':
        return 'Your KYC verification was rejected. Please complete the process again.';
      default:
        return 'Complete your KYC verification to unlock all features.';
    }
  };

  const announcements: Announcement[] = [
    {
      id: 'verify-kyc',
      title: 'Complete Your KYC Verification',
      description: 'Please complete your KYC verification to unlock all features.',
      icon: <MailWarning className="text-yellow-600" size={24} />,
      condition: (user: User) => !user.isEmailVerified,
      cta: {
        text: 'Resend Verification Email',
        onClick: handleResendVerification,
      },
    },
    {
      id: 'complete-kyc',
      title: 'Complete Your KYC Verification',
      description: user ? getKycStatusText(user.kycStatus) : '',
      icon: <ShieldAlert className="text-red-600" size={24} />,
      condition: (user: User) => user.kycStatus !== 'verified',
      link: '/settings/kyc',
      cta: {
        text: 'Complete KYC Now',
        onClick: () => {
          navigate('/settings/kyc');
        }, 
      },
    },
    // {
    //   id: 'promo-offer',
    //   title: 'Special Offer Available',
    //   description: 'Limited time offer: Get 5% bonus on new savings packages.',
    //   icon: <Gift className="text-green-600" size={24} />,
    //   condition: () => true, // Always show this announcement
    //   cta: {
    //     text: 'View Offer',
    //     onClick: () => {
    //       navigate('/promotions');
    //     },
    //   },
    //   link: '/promotions',
    // },
  ];

  const activeAnnouncements = user 
    ? announcements.filter((ann) => !dismissed.includes(ann.id) && ann.condition(user))
    : [];

  // Handle slide change
  const handleSlideChange = useCallback(
    (index: number) => {
      setActiveSlide(index);
      if (sliderRef.current) {
        const slideWidth = sliderRef.current.scrollWidth / activeAnnouncements.length;
        sliderRef.current.scrollTo({
          left: slideWidth * index,
          behavior: 'smooth',
        });
      }
    },
    [activeAnnouncements.length]
  );

  useEffect(() => {
    const storedDismissed = localStorage.getItem('announcements_dismissed');
    if (storedDismissed) {
      setDismissed(JSON.parse(storedDismissed));
    }
  }, []);

  // Setup and cleanup auto slide timer
  useEffect(() => {
    // Clear any existing interval when dependencies change
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only set up the interval if we have announcements and autoplay is enabled
    if (activeAnnouncements.length > 0 && autoplayEnabled) {
      intervalRef.current = setInterval(() => {
        const nextSlide = (activeSlide + 1) % activeAnnouncements.length;
        handleSlideChange(nextSlide);
      }, 5000);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeSlide, activeAnnouncements.length, handleSlideChange, autoplayEnabled]);

  // Pause autoplay on hover
  const handleMouseEnter = () => setAutoplayEnabled(false);
  const handleMouseLeave = () => setAutoplayEnabled(true);

  if (!user || activeAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="py-2" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-[#212529]">Announcements</h2>
      </div>

      {/* Slider container */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {activeAnnouncements.map((ann) => (
          <div 
            key={ann.id}
            className="min-w-[100%] md:min-w-[90%] lg:min-w-[80%] flex-shrink-0 snap-center"
          >
            <AnnouncementCard
              id={ann.id}
              title={ann.title}
              description={ann.description}
              icon={ann.icon}
              cta={ann.cta}
              link={ann.link}
              onDismiss={handleDismiss}
            />
          </div>
        ))}
      </div>

      {/* Slider pagination dots */}
      {activeAnnouncements.length > 1 && (
        <div className="flex justify-center mt-3 gap-2">
          {activeAnnouncements.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                activeSlide === index ? 'bg-blue-600 w-6' : 'bg-gray-300'
              }`}
              onClick={() => handleSlideChange(index)}
              aria-label={`Go to announcement ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 