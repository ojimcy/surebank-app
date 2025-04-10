import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageType } from './types';

interface PackageTypesProps {
  packageTypes: PackageType[];
}

export function PackageTypes({ packageTypes }: PackageTypesProps) {
  const [activeTypeSlide, setActiveTypeSlide] = useState(0);
  const typeSliderRef = useRef<HTMLDivElement>(null);

  // Handle slide change for package types
  const handleTypeSlideChange = (index: number) => {
    setActiveTypeSlide(index);
    if (typeSliderRef.current) {
      const slideWidth =
        typeSliderRef.current.scrollWidth / packageTypes.length;
      typeSliderRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth',
      });
    }
  };

  // Auto slide every 5 seconds for package types
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (activeTypeSlide + 1) % packageTypes.length;
      handleTypeSlideChange(nextSlide);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTypeSlide, packageTypes.length]);

  return (
    <div className="py-2">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#212529]">Start Saving</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose a savings plan that best suits your goals
        </p>
      </div>

      {/* Package Types Slider */}
      <div
        ref={typeSliderRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {packageTypes.map((type) => (
          <div
            key={type.id}
            className="min-w-[300px] max-w-[300px] flex-shrink-0 snap-center"
          >
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all h-full">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${type.color}20` }}
                  >
                    {type.icon === 'calendar' && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        style={{ color: type.color }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    )}

                    {type.icon === 'trending-up' && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        style={{ color: type.color }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    )}

                    {type.icon === 'target' && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        style={{ color: type.color }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    )}
                  </div>
                  <h3
                    className="font-bold text-lg"
                    style={{ color: type.color }}
                  >
                    {type.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {type.description}
                  </p>
                </div>

                <div className="mt-auto">
                  {type.id === 'ds' && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Minimum</span>
                        <span className="font-medium">₦1,000</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Frequency</span>
                        <span className="font-medium">
                          Daily/Weekly/Monthly
                        </span>
                      </div>
                    </div>
                  )}

                  {type.id === 'is' && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Interest Rate</span>
                        <span className="font-medium text-green-600">
                          8-12% p.a.
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Lock Period</span>
                        <span className="font-medium">3-12 months</span>
                      </div>
                    </div>
                  )}

                  {type.id === 'sb' && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Products</span>
                        <span className="font-medium">
                          Electronics, Appliances
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Payment Plan</span>
                        <span className="font-medium">Flexible</span>
                      </div>
                    </div>
                  )}

                  <Link
                    to={type.path}
                    className="w-full py-3 font-medium text-sm rounded-md text-white flex items-center justify-center gap-2"
                    style={{ backgroundColor: type.color }}
                  >
                    {type.id === 'ds' && (
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}

                    {type.id === 'is' && (
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    )}

                    {type.id === 'sb' && (
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
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    )}

                    {type.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slider pagination dots */}
      <div className="flex justify-center mt-4 gap-2">
        {packageTypes.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${
              activeTypeSlide === index ? 'bg-[#0066A1] w-6' : 'bg-gray-300'
            }`}
            onClick={() => handleTypeSlideChange(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* View All Packages Button */}
      <div className="mt-4 flex justify-center">
        <Link
          to="/packages"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View All Savings Plans
        </Link>
      </div>
    </div>
  );
}
