function Deposit() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Deposit Funds</h1>

      {/* Package Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label
          htmlFor="package"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Package
        </label>
        <select
          id="package"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0066A1] focus:ring-[#0066A1] h-12 px-3 border"
        >
          <option>House Fund (Daily Savings)</option>
          <option>Education Fund (Interest-Based)</option>
          <option>New Laptop (SB Package)</option>
        </select>
      </div>

      {/* Amount Input */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Enter Amount
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-lg">₦</span>
          </div>
          <input
            type="number"
            id="amount"
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md bg-white text-2xl font-bold text-right"
            placeholder="0.00"
          />
        </div>
        <div className="mt-4 flex justify-between text-sm text-gray-500">
          <span>Current Balance: ₦400,000</span>
          <span>Target: ₦1,000,000</span>
        </div>
      </div>

      {/* Preset Amounts */}
      <div className="grid grid-cols-3 gap-3">
        <button className="bg-white py-3 rounded-lg border border-gray-300 font-medium">
          ₦5,000
        </button>
        <button className="bg-white py-3 rounded-lg border border-gray-300 font-medium">
          ₦10,000
        </button>
        <button className="bg-white py-3 rounded-lg border border-gray-300 font-medium">
          ₦20,000
        </button>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <input
              id="card"
              name="payment-method"
              type="radio"
              className="h-4 w-4 text-[#0066A1] focus:ring-[#0066A1]"
              defaultChecked
            />
            <label htmlFor="card" className="flex items-center">
              <span className="ml-2 block font-medium text-gray-900">Card</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </label>
          </div>
          <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
            <input
              id="bank-transfer"
              name="payment-method"
              type="radio"
              className="h-4 w-4 text-[#0066A1] focus:ring-[#0066A1]"
            />
            <label htmlFor="bank-transfer" className="flex items-center">
              <span className="ml-2 block font-medium text-gray-900">
                Bank Transfer
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
            </label>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        type="button"
        className="w-full bg-[#0066A1] text-white rounded-md py-4 font-semibold hover:bg-[#007DB8] transition-colors"
      >
        Proceed to Payment
      </button>
    </div>
  );
}

export default Deposit;
