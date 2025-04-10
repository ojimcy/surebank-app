import { Link, useLocation, useNavigate } from 'react-router-dom';
import { safeAreaClasses } from '@/lib/safe-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if current route is a nested route
  const isNestedRoute = location.pathname.split('/').filter(Boolean).length > 1;

  // Get current page title from pathname
  const getPageTitle = () => {
    const path = location.pathname.split('/').filter(Boolean)[0];
    if (!path) return 'Dashboard';

    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Handle back button click
  const handleBack = () => {
    navigate(-1);
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 bg-[#0066A1] text-white py-3 px-4 shadow-md',
        safeAreaClasses.paddingTop
      )}
    >
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {isNestedRoute && (
            <button
              onClick={handleBack}
              className="mr-2 p-2 rounded-full hover:bg-[#007DB8] transition-colors active:scale-95"
              aria-label="Go back"
              title="Go back"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div className="flex flex-col">
            <Link
              to="/"
              className="text-xl font-bold hover:text-opacity-80 transition-all"
              title="Go to Dashboard"
            >
              SureBank
            </Link>
            {isNestedRoute && (
              <span className="text-xs text-white/70">{getPageTitle()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className="p-2 rounded-full hover:bg-[#007DB8] transition-colors relative active:scale-95"
            aria-label="Notifications"
            title="Notifications"
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {/* Notification dot - show when there are unread notifications */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <Link
            to="/settings"
            className="flex items-center space-x-2 px-2 py-1 rounded-full hover:bg-[#007DB8] transition-colors active:scale-95"
            title="Account Settings"
          >
            {user ? (
              <>
                <div className="hidden sm:block text-right">
                  <span className="block text-xs text-white/70">Hello,</span>
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {user.firstName}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#004D7A] flex items-center justify-center text-sm font-medium">
                  {getUserInitials()}
                </div>
              </>
            ) : (
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
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
