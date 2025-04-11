import React from 'react';

interface PackageOverviewProps {
  current: number;
  target: number;
  progress: number;
  color: string;
  startDate: string;
  endDate?: string;
  interestRate?: string;
  maturityDate?: string;
  nextContribution?: string;
  productImage?: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export function PackageOverview({
  current,
  target,
  progress,
  color,
  startDate,
  endDate,
  interestRate,
  maturityDate,
  nextContribution,
  productImage,
  formatCurrency,
  formatDate,
}: PackageOverviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="md:flex">
        <div className="md:w-1/3 h-48 bg-gray-200 overflow-hidden">
          <img
            src={productImage}
            alt="Package"
            className="w-full h-full object-cover"
            onError={(e) => {
              const imgEl = e.target as HTMLImageElement;
              imgEl.onerror = null;
              imgEl.src =
                'https://images.unsplash.com/photo-1579621970590-9d624316904b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
            }}
          />
        </div>
        <div className="md:w-2/3 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Package Progress</h2>
              <div className="flex items-center">
                <div className="w-20 h-20 relative mr-4">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="10"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={color}
                      strokeWidth="10"
                      strokeDasharray={`${progress * 2.83} 283`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="55"
                      fontSize="20"
                      textAnchor="middle"
                      fill={color}
                      fontWeight="bold"
                    >
                      {progress}%
                    </text>
                  </svg>
                </div>
                <div>
                  <div className="mb-2">
                    <div className="text-sm text-gray-500">Current Balance</div>
                    <div className="font-bold text-xl">
                      {formatCurrency(current)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Target Amount</div>
                    <div className="font-bold text-xl">
                      {formatCurrency(target)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <div className="text-sm text-gray-500">Start Date</div>
              <div className="font-medium">{formatDate(startDate)}</div>
            </div>
            {endDate && (
              <div>
                <div className="text-sm text-gray-500">End Date</div>
                <div className="font-medium">{formatDate(endDate)}</div>
              </div>
            )}
            {interestRate && (
              <div>
                <div className="text-sm text-gray-500">Interest Rate</div>
                <div className="font-medium">{interestRate}</div>
              </div>
            )}
            {maturityDate && (
              <div>
                <div className="text-sm text-gray-500">Maturity Date</div>
                <div className="font-medium">{formatDate(maturityDate)}</div>
              </div>
            )}
            {nextContribution && nextContribution !== 'Not available' && (
              <div>
                <div className="text-sm text-gray-500">Next Contribution</div>
                <div className="font-medium">{nextContribution}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
