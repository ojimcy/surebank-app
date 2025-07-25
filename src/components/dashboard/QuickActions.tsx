import { Link } from 'react-router-dom';

export function QuickActions() {
  return (
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
        <Link to="/payments/deposit" className="flex flex-col items-center group">
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
                d="M7 10l5 5 5-5M12 15V3"
              />
            </svg>
          </div>
          <span className="text-xs text-[#6c757d] group-hover:text-[#0066A1] transition-colors">
            Deposit
          </span>
        </Link>
        <Link to="/payments/withdraw" className="flex flex-col items-center group">
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
                d="M7 14l5-5 5 5M12 9v12"
              />
            </svg>
          </div>
          <span className="text-xs text-[#6c757d] group-hover:text-[#0066A1] transition-colors">
            Withdraw
          </span>
        </Link>
        <Link to="/cards" className="flex flex-col items-center group">
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
            My Cards
          </span>
        </Link>
        <Link to="/schedules" className="flex flex-col items-center group">
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-xs text-[#6c757d] group-hover:text-[#0066A1] transition-colors">
            Schedules
          </span>
        </Link>
      </div>
    </div>
  );
}
