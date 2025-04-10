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
  );
}
