function PackageList() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Packages</h1>
        <button className="bg-[#0066A1] text-white rounded-full p-3">
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
        </button>
      </div>

      {/* Package Cards */}
      <div className="space-y-4">
        {/* Daily Savings Package */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="bg-blue-100 text-[#0066A1] text-xs px-2 py-1 rounded-full">
                Daily Savings
              </span>
              <h3 className="font-bold text-lg mt-2">House Fund</h3>
            </div>
            <div className="h-10 w-10 bg-[#E5E8ED] rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#0066A1]"
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
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">40%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#0066A1] h-2 rounded-full"
                style={{ width: '40%' }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-gray-500">Current</p>
              <p className="font-bold">₦400,000</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Target</p>
              <p className="font-bold">₦1,000,000</p>
            </div>
          </div>
          <button className="w-full bg-[#0066A1] text-white rounded-md py-2 font-medium text-sm">
            Deposit
          </button>
        </div>

        {/* Interest-Based Package */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                Interest-Based
              </span>
              <h3 className="font-bold text-lg mt-2">Education Fund</h3>
            </div>
            <div className="h-10 w-10 bg-[#E5E8ED] rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#0066A1]"
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
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: '75%' }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-gray-500">Current</p>
              <p className="font-bold">₦750,000</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Target</p>
              <p className="font-bold">₦1,000,000</p>
            </div>
          </div>
          <div className="flex justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">Interest Rate</p>
              <p className="font-medium text-green-600">8% p.a.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Maturity</p>
              <p className="font-medium">Dec 15, 2024</p>
            </div>
          </div>
          <button className="w-full bg-[#0066A1] text-white rounded-md py-2 font-medium text-sm">
            Deposit
          </button>
        </div>

        {/* SB Package */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                SB Package
              </span>
              <h3 className="font-bold text-lg mt-2">New Laptop</h3>
            </div>
            <div className="h-10 w-10 bg-[#E5E8ED] rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#0066A1]"
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
            </div>
          </div>
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: '25%' }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-gray-500">Current</p>
              <p className="font-bold">₦150,000</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Product Price</p>
              <p className="font-bold">₦600,000</p>
            </div>
          </div>
          <button className="w-full bg-[#0066A1] text-white rounded-md py-2 font-medium text-sm">
            Deposit
          </button>
        </div>
      </div>
    </div>
  );
}

export default PackageList;
