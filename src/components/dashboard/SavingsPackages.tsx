import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { SavingsPackage } from './types';

interface SavingsPackagesProps {
  packages: SavingsPackage[];
  formatCurrency: (amount: number) => string;
}

export const SavingsPackages = memo(function SavingsPackages({
  packages,
  formatCurrency,
}: SavingsPackagesProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Handle slide change for savings packages with useCallback
  const handleSlideChange = useCallback(
    (index: number) => {
      setActiveSlide(index);
      if (sliderRef.current) {
        const slideWidth = sliderRef.current.scrollWidth / packages.length;
        sliderRef.current.scrollTo({
          left: slideWidth * index,
          behavior: 'smooth',
        });
      }
    },
    [packages.length]
  );

  // Setup and cleanup auto slide timer
  useEffect(() => {
    // Clear any existing interval when dependencies change
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only set up the interval if we have packages
    if (packages.length > 0) {
      intervalRef.current = setInterval(() => {
        const nextSlide = (activeSlide + 1) % packages.length;
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
  }, [activeSlide, packages.length, handleSlideChange]);

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#212529]">My Savings</h2>
        <Link
          to="/packages"
          className="text-sm text-[#0066A1] hover:underline flex items-center gap-1"
        >
          View All
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Slider container */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {packages.map((pkg) => (
          <Link
            to={`/packages/${pkg.id}`}
            key={pkg.title}
            className="min-w-[300px] max-w-[300px] flex-shrink-0 snap-center"
          >
            <div className="bg-white rounded-xl shadow-sm p-4 h-full border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${pkg.color}20`,
                      color: pkg.color,
                    }}
                  >
                    {pkg.type}
                  </span>
                  <h3 className="font-bold text-lg mt-2">{pkg.title}</h3>
                </div>
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${pkg.color}20` }}
                >
                  {pkg.icon === 'home' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      style={{ color: pkg.color }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                  )}
                  {pkg.icon === 'book-open' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      style={{ color: pkg.color }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  )}
                  {pkg.icon === 'laptop' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      style={{ color: pkg.color }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{pkg.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${pkg.progress}%`,
                      backgroundColor: pkg.color,
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-500">Current Balance</p>
                  <p className="font-bold">{formatCurrency(pkg.current)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {pkg.type === 'Daily Savings'
                      ? 'Amount Per Day'
                      : 'Target '}
                  </p>
                  <p className="font-bold">
                    {pkg.type === 'Daily Savings'
                      ? formatCurrency(pkg.amountPerDay)
                      : formatCurrency(pkg.target)}
                  </p>
                </div>
              </div>
              <button
                className="w-full py-2 font-medium text-sm rounded-md text-white"
                style={{ backgroundColor: pkg.color }}
              >
                Deposit
              </button>
            </div>
          </Link>
        ))}
      </div>

      {/* Slider pagination dots */}
      <div className="flex justify-center mt-4 gap-2">
        {packages.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              activeSlide === index ? 'bg-[#0066A1] w-6' : 'bg-gray-300'
            }`}
            onClick={() => handleSlideChange(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Quick CTA Button */}
      <div className="mt-4 flex justify-center">
        <Link
          to="/packages/new"
          className="bg-[#0066A1]/10 text-[#0066A1] rounded-lg px-4 py-3 font-medium text-sm hover:bg-[#0066A1]/20 transition-colors flex items-center gap-2"
        >
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Create New Package
        </Link>
      </div>
    </div>
  );
});
