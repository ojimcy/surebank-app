import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { User, Bell } from 'lucide-react';

function Header() {
  const { user } = useAuth();
  const { unreadCount, notifications } = useNotifications();

  // Get the most recent unread notification, or most recent notification if none unread
  const latestNotification = notifications.length > 0 
    ? (notifications.find(n => !n.isRead) || notifications[0])
    : null;

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!user) return '';
    
    const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0) : '';
    
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <header
      className="sticky top-0 z-40 bg-white border-b border-gray-200"
      style={{
        paddingTop: `calc(1rem + env(safe-area-inset-top, 0px))`,
        paddingLeft: `calc(1.5rem + env(safe-area-inset-left, 0px))`,
        paddingRight: `calc(1.5rem + env(safe-area-inset-right, 0px))`,
        paddingBottom: '1rem'
      }}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Left side - Profile icon and welcome message */}
        <div className="flex items-center space-x-4">
          <Link
            to="/settings"
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            title="Account Settings"
          >
            {user ? (
              <div className="w-8 h-8 rounded-full bg-[#0066A1] flex items-center justify-center text-white text-sm font-medium">
                {getUserInitials()}
              </div>
            ) : (
              <User className="h-8 w-8 text-gray-600" />
            )}
          </Link>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 font-normal">
              Welcome to
            </span>
            <Link
              to="/"
              className="text-xl font-bold text-gray-900 hover:text-[#0066A1] transition-colors"
              title="Go to Dashboard"
            >
              SureBank
            </Link>
          </div>
        </div>

        {/* Right side - Notification icon */}
        <div className="flex items-center">
          <Link
            to="/settings/notifications"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative active:scale-95 group"
            aria-label="Notifications"
            title={latestNotification ? `New: ${latestNotification.title}` : "Notifications"}
          >
            <Bell className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            
            {/* Tooltip for latest notification */}
            {latestNotification && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white text-gray-800 rounded-md shadow-lg border p-3 text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="font-medium text-[#0066A1] mb-1 truncate">
                  {latestNotification.title}
                </div>
                <div className="text-gray-600 text-xs line-clamp-2">
                  {latestNotification.body}
                </div>
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
