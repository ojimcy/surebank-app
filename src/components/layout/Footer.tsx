import { NavLink, Link } from 'react-router-dom';
import { safeAreaClasses } from '@/lib/safe-area';
import { cn } from '@/lib/utils';

function Footer() {
  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e8ed] py-2 z-30 shadow-sm',
        safeAreaClasses.paddingBottom
      )}
    >
      <nav className="container mx-auto">
        <ul className="flex justify-around items-center">
          <li className="flex flex-col items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `p-2 flex flex-col items-center transition-all duration-200 ${
                  isActive
                    ? 'text-[#0066A1]'
                    : 'text-[#6c757d] hover:text-[#0066A1] hover:scale-110'
                }`
              }
            >
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </NavLink>
          </li>
          <li className="flex flex-col items-center">
            <NavLink
              to="/packages"
              className={({ isActive }) =>
                `p-2 flex flex-col items-center transition-all duration-200 ${
                  isActive
                    ? 'text-[#0066A1]'
                    : 'text-[#6c757d] hover:text-[#0066A1] hover:scale-110'
                }`
              }
            >
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
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span className="text-xs mt-1">Packages</span>
            </NavLink>
          </li>
          <li className="flex flex-col items-center">
            <Link
              to="/payments/deposit"
              className="p-2 bg-[#0066A1] rounded-full flex flex-col items-center -mt-5 hover:bg-[#007DB8] transition-colors shadow-md hover:shadow-lg active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
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
            </Link>
          </li>
          <li className="flex flex-col items-center">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `p-2 flex flex-col items-center transition-all duration-200 ${
                  isActive
                    ? 'text-[#0066A1]'
                    : 'text-[#6c757d] hover:text-[#0066A1] hover:scale-110'
                }`
              }
            >
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
              <span className="text-xs mt-1">Products</span>
            </NavLink>
          </li>
          <li className="flex flex-col items-center">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `p-2 flex flex-col items-center transition-all duration-200 ${
                  isActive
                    ? 'text-[#0066A1]'
                    : 'text-[#6c757d] hover:text-[#0066A1] hover:scale-110'
                }`
              }
            >
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-xs mt-1">Account</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default Footer;
