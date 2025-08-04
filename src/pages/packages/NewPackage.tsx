import { Link } from 'react-router-dom';
import NestedHeader from '@/components/layout/NestedHeader';

function NewPackage() {
  return (
    <div className="space-y-6">
      <NestedHeader title="New Package" />

      {/* Package Type Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-[#212529] mb-2">
          Select Package Type
        </h2>

        <Link
          to="/packages/new/daily"
          className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-start">
            <div className="h-12 w-12 bg-[#E5E8ED] rounded-full flex items-center justify-center mr-4 text-[#0066A1]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-[#212529]">
                Daily Savings
              </h3>
              <p className="text-sm text-[#6c757d]">
                Save daily towards your financial goals with flexible
                withdrawals.
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/packages/new/ibs"
          className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-start">
            <div className="h-12 w-12 bg-[#E5E8ED] rounded-full flex items-center justify-center mr-4 text-[#0066A1]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-[#212529]">
                Interest-Based
              </h3>
              <p className="text-sm text-[#6c757d]">
                Grow your savings with competitive interest rates for fixed
                periods.
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/packages/new/sb"
          className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-start">
            <div className="h-12 w-12 bg-[#E5E8ED] rounded-full flex items-center justify-center mr-4 text-[#0066A1]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-[#212529]">
                SB Package
              </h3>
              <p className="text-sm text-[#6c757d]">
                Save towards purchasing specific products from our catalog.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default NewPackage;
