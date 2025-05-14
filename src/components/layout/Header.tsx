import { Link, useLocation, useNavigate } from 'react-router-dom';
import { safeAreaClasses } from '@/lib/safe-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount, notifications } = useNotifications();

  // Get the most recent unread notification, or most recent notification if none unread
  const latestNotification = notifications.length > 0 
    ? (notifications.find(n => !n.isRead) || notifications[0])
    : null;

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
          <Link
            to="/settings/notifications"
            className="p-2 rounded-full hover:bg-[#007DB8] transition-colors relative active:scale-95 group"
            aria-label="Notifications"
            title={latestNotification ? `New: ${latestNotification.title}` : "Notifications"}
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
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            
            {/* Tooltip for latest notification - only show on hover and if there's a notification */}
            {latestNotification && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white text-gray-800 rounded-md shadow-lg p-3 text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="font-medium text-[#0066A1] mb-1 truncate">
                  {latestNotification.title}
                </div>
                <div className="text-gray-600 text-xs line-clamp-2">
                  {latestNotification.body}
                </div>
              </div>
            )}
          </Link>

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
