import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* User Welcome Card */}
      <div className="bg-[#0066A1] text-white rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold mb-2">
          Welcome, {user ? `${user.firstName} ${user.lastName}` : 'User'}
        </h1>
        <p className="text-sm opacity-90">
          {user?.email
            ? `Email: ${user.email}`
            : user?.phoneNumber
            ? `Phone: ${user.phoneNumber}`
            : 'Manage your savings with SureBank'}
        </p>
        {user?.kycStatus && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={`px-2 py-1 rounded-full ${
                user.kycStatus === 'verified' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            >
              KYC: {user.kycStatus}
            </span>
          </div>
        )}
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
        <h2 className="text-sm font-medium text-[#6c757d] mb-1">
          Available Balance
        </h2>
        <p className="text-3xl font-bold text-[#212529]">₦120,500.00</p>
        <div className="mt-4 flex gap-4">
          <Link
            to="/payments/deposit"
            className="flex-1 bg-[#0066A1] text-white rounded-md py-2 font-medium text-sm hover:bg-[#007DB8] transition-colors"
          >
            Deposit
          </Link>
          <Link
            to="/payments/withdraw"
            className="flex-1 border border-[#0066A1] text-[#0066A1] rounded-md py-2 font-medium text-sm hover:bg-[#0066A1] hover:text-white transition-all"
          >
            Withdraw
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-2">
        <h2 className="text-lg font-bold text-[#212529] mb-4">Quick Actions</h2>
        <div className="flex justify-between">
          <Link to="/packages/new" className="flex flex-col items-center group">
            <div className="w-12 h-12 bg-[#E5E8ED] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#0066A1] group-hover:scale-110 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#0066A1] group-hover:text-white transition-colors"
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
            </div>
            <span className="text-xs text-[#6c757d] group-hover:text-[#0066A1] transition-colors">
              New Package
            </span>
          </Link>
          <Link to="/packages" className="flex flex-col items-center group">
            <div className="w-12 h-12 bg-[#E5E8ED] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#0066A1] group-hover:scale-110 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#0066A1] group-hover:text-white transition-colors"
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
            </div>
            <span className="text-xs text-[#6c757d] group-hover:text-[#0066A1] transition-colors">
              Packages
            </span>
          </Link>
          <Link to="/products" className="flex flex-col items-center group">
            <div className="w-12 h-12 bg-[#E5E8ED] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#0066A1] group-hover:scale-110 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#0066A1] group-hover:text-white transition-colors"
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
            <span className="text-xs text-[#6c757d] group-hover:text-[#0066A1] transition-colors">
              Products
            </span>
          </Link>
          <Link
            to="/payments/history"
            className="flex flex-col items-center group"
          >
            <div className="w-12 h-12 bg-[#E5E8ED] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#0066A1] group-hover:scale-110 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#0066A1] group-hover:text-white transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <span className="text-xs text-[#6c757d] group-hover:text-[#0066A1] transition-colors">
              History
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#212529]">
            Recent Transactions
          </h2>
          <Link
            to="/payments/history"
            className="text-sm text-[#0066A1] hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#E5E8ED] rounded-full flex items-center justify-center mr-3">
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
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Deposit</p>
                <p className="text-xs text-[#6c757d]">Daily Savings</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-[#28A745]">+ ₦5,000</p>
              <p className="text-xs text-[#6c757d]">Today, 10:30 AM</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 flex justify-between items-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-[#E5E8ED] rounded-full flex items-center justify-center mr-3">
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
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium">Withdrawal</p>
                <p className="text-xs text-[#6c757d]">Interest Package</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-[#DC3545]">- ₦15,000</p>
              <p className="text-xs text-[#6c757d]">Yesterday, 2:15 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
