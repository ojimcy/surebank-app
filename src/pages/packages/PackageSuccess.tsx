import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function PackageSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    packageType,
    target,
    product,
    amount,
    interestRate,
    lockPeriod,
    compoundingFrequency,
  } = location.state || {};

  useEffect(() => {
    // If there's no state, redirect to packages page
    if (!location.state) {
      navigate('/packages');
    }
  }, [location.state, navigate]);

  if (!location.state) {
    return null;
  }

  // Calculate the maturity date for interest packages
  const getMaturityDate = () => {
    if (packageType !== 'interest' || !lockPeriod) return '';

    const today = new Date();
    const maturityDate = new Date(today);
    maturityDate.setDate(today.getDate() + lockPeriod);

    return maturityDate.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Calculate estimated returns for interest packages
  const calculateReturns = () => {
    if (packageType !== 'interest' || !amount || !interestRate || !lockPeriod) {
      return 0;
    }

    const principal = Number(amount);
    const rate = Number(interestRate) / 100;
    const period = Number(lockPeriod) / 365; // Convert days to years

    if (!compoundingFrequency) {
      // Simple interest calculation
      return principal * rate * period;
    } else {
      // Compound interest calculation
      const compoundFrequency = compoundingFrequency === 'quarterly' ? 4 : 1;
      const compoundPeriods = period * compoundFrequency;
      return (
        principal * Math.pow(1 + rate / compoundFrequency, compoundPeriods) -
        principal
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto h-full py-8">
      <div className="bg-white rounded-xl shadow-sm p-8 w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center text-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
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
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#212529] mb-2">
          {packageType === 'interest'
            ? 'Investment Created Successfully!'
            : 'Package Created Successfully!'}
        </h1>

        <p className="text-[#6c757d] mb-6">
          Your{' '}
          {packageType === 'daily'
            ? 'Daily Savings'
            : packageType === 'sb'
            ? 'SB'
            : 'Interest-Based Investment'}{' '}
          {packageType === 'interest'
            ? 'has been created and your funds are now securely locked.'
            : 'has been created and is now active.'}
        </p>

        <div className="bg-[#F6F8FA] rounded-lg p-4 mb-6">
          <div className="space-y-3">
            {packageType === 'daily' && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Target:</span>
                  <span className="font-medium text-[#212529]">{target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Amount Per Day:</span>
                  <span className="font-medium text-[#212529]">
                    ₦{Number(amount).toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {packageType === 'sb' && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Product:</span>
                  <span className="font-medium text-[#212529]">{product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Target Amount:</span>
                  <span className="font-medium text-[#212529]">
                    ₦{Number(amount).toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {packageType === 'interest' && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Investment Name:</span>
                  <span className="font-medium text-[#212529]">{target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Principal Amount:</span>
                  <span className="font-medium text-[#212529]">
                    ₦{Number(amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Interest Rate:</span>
                  <span className="font-medium text-[#212529]">
                    {interestRate}% p.a.
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Interest Type:</span>
                  <span className="font-medium text-[#212529]">
                    {compoundingFrequency
                      ? `Compound (${
                          compoundingFrequency === 'quarterly'
                            ? 'Quarterly'
                            : 'Annually'
                        })`
                      : 'Simple Interest'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Lock Period:</span>
                  <span className="font-medium text-[#212529]">
                    {lockPeriod === 30
                      ? '1 Month'
                      : lockPeriod === 90
                      ? '3 Months'
                      : lockPeriod === 180
                      ? '6 Months'
                      : lockPeriod === 365
                      ? '1 Year'
                      : '2 Years'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Maturity Date:</span>
                  <span className="font-medium text-[#212529]">
                    {getMaturityDate()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Estimated Returns:</span>
                  <span className="font-medium text-[#212529]">
                    ₦
                    {calculateReturns().toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6c757d]">Total at Maturity:</span>
                  <span className="font-medium text-[#212529]">
                    ₦
                    {(Number(amount) + calculateReturns()).toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 }
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {packageType !== 'interest' && (
            <Link
              to="/deposit"
              className="block w-full bg-[#0066A1] text-white py-3 px-4 rounded-lg hover:bg-[#005085] transition-colors"
            >
              Make First Contribution
            </Link>
          )}
          <Link
            to="/packages"
            className="block w-full bg-white border border-[#CED4DA] text-[#495057] py-3 px-4 rounded-lg hover:bg-[#F6F8FA] transition-colors"
          >
            View All Packages
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PackageSuccess;
