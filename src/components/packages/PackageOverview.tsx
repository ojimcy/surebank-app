import { formatDateTime } from '@/lib/utils';

interface PackageOverviewProps {
  current: number;
  totalContribution: number;
  amountPerDay: number;
  target: number;
  principalAmount: number;
  progress: number;
  color: string;
  startDate: string;
  endDate?: string;
  interestRate?: string;
  maturityDate?: string;
  nextContribution?: string;
  productImage?: string;
  type: string;
  formatCurrency: (amount: number) => string;
  compoundingFrequency?: string;
  lockPeriod?: number;
  interestAccrued?: number;
  earlyWithdrawalPenalty?: number;
  estimatedEarnings?: number;
}

export function PackageOverview({
  current,
  amountPerDay,
  target,
  progress,
  color,
  startDate,
  endDate,
  interestRate,
  maturityDate,
  nextContribution,
  productImage,
  type,
  formatCurrency,
  lockPeriod,
  interestAccrued,
  estimatedEarnings,
}: PackageOverviewProps) {
  const isInterestBased = type === 'Interest-Based';
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
              <h2 className="text-lg font-semibold mb-2">
                {isInterestBased ? 'Investment Progress' : 'Package Progress'}
              </h2>
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
                    <div className="text-sm text-gray-500">
                      {isInterestBased
                        ? 'Current Balance'
                        : 'Total Contribution'}
                    </div>
                    <div className="font-bold text-xl">
                      {formatCurrency(current)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">
                      {isInterestBased
                        ? 'Maturity Progress'
                        : type === 'Daily Savings'
                        ? 'Amount Per Day'
                        : 'Target Balance'}
                    </div>
                    <div className="font-bold text-xl">
                      {isInterestBased
                        ? `${progress}% complete`
                        : type === 'Daily Savings'
                        ? formatCurrency(amountPerDay)
                        : formatCurrency(target)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interest-Based specific display */}
          {isInterestBased && (
            <div className="mb-4 border-t pt-4">
              <h3 className="text-md font-semibold mb-2">Investment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {interestRate && (
                  <div>
                    <div className="text-sm text-gray-500">Interest Rate</div>
                    <div className="font-medium">{interestRate}</div>
                  </div>
                )}
                {lockPeriod && (
                  <div>
                    <div className="text-sm text-gray-500">Lock Period</div>
                    <div className="font-medium">
                      {lockPeriod} {lockPeriod === 1 ? 'month' : 'months'}
                    </div>
                  </div>
                )}
                {estimatedEarnings !== undefined &&
                  estimatedEarnings > 0 &&
                  interestAccrued === 0 && (
                    <div>
                      <div className="text-sm text-gray-500">
                        Est. Earnings at Maturity
                      </div>
                      <div className="font-medium text-green-600">
                        {formatCurrency(estimatedEarnings)}
                      </div>
                    </div>
                  )}
                {maturityDate && (
                  <div>
                    <div className="text-sm text-gray-500">Maturity Date</div>
                    <div className="font-medium">
                      {formatDateTime(maturityDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Standard package details */}
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <div className="text-sm text-gray-500">Start Date</div>
              <div className="font-medium">{formatDateTime(startDate)}</div>
            </div>
            {endDate && !isInterestBased && (
              <div>
                <div className="text-sm text-gray-500">End Date</div>
                <div className="font-medium">{formatDateTime(endDate)}</div>
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
