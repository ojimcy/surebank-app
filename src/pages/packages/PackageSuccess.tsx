import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function PackageSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { packageType, target, product, amount } = location.state || {};

  useEffect(() => {
    // If there's no state, redirect to packages page
    if (!location.state) {
      navigate('/packages');
    }
  }, [location.state, navigate]);

  if (!location.state) {
    return null;
  }

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
          Package Created Successfully!
        </h1>

        <p className="text-[#6c757d] mb-6">
          Your{' '}
          {packageType === 'daily'
            ? 'Daily Savings'
            : packageType === 'sb'
            ? 'SB'
            : 'Interest-Based'}{' '}
          package has been created and is now active.
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
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/deposit"
            className="block w-full bg-[#0066A1] text-white py-3 px-4 rounded-lg hover:bg-[#005085] transition-colors"
          >
            Make First Contribution
          </Link>
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
