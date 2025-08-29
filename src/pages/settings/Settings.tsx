import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePin } from '@/lib/pin-provider';
import { Edit2, CheckCircle, AlertCircle } from 'lucide-react';

function Settings() {
  const { user, logout } = useAuth();
  const { isPinSet, lockApp } = usePin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleLockApp = () => {
    lockApp();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <div className="h-10 w-10 bg-[#0066A1] rounded-full flex items-center justify-center shadow-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      </div>

      {/* Enhanced Profile Section */}
      <div className="bg-gradient-to-r from-[#0066A1] to-[#0056A1] rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <div className="flex items-start sm:items-center flex-col sm:flex-row gap-4">
          <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 sm:h-10 sm:w-10 text-white"
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
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-lg sm:text-xl text-white mb-1 truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/90 text-sm sm:text-base truncate">
                {user?.email || 'No email'}
              </span>
              {user?.email && (
                user?.isEmailVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-300 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-300 shrink-0" />
                )
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                <div className="h-2 w-2 bg-green-300 rounded-full"></div>
                <span className="text-xs text-white/90">Active</span>
              </div>
              {user?.isVerified ? (
                <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-sm rounded-full px-2 py-1">
                  <CheckCircle className="h-3 w-3 text-green-300" />
                  <span className="text-xs text-white/90">Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm rounded-full px-2 py-1">
                  <AlertCircle className="h-3 w-3 text-yellow-300" />
                  <span className="text-xs text-white/90">Pending Verification</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => navigate('/settings/personal-information')}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 text-white rounded-lg p-3 transition-all duration-200 border border-white/30 shrink-0 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Edit Profile"
          >
            <Edit2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="p-4 sm:p-5 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-[#0066A1]/10 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-[#0066A1]"
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
              </div>
              <h3 className="font-bold text-lg text-gray-900">Account Management</h3>
            </div>
            <ul className="space-y-3 px-4 pb-4">
              <li>
                <button
                  onClick={() => navigate('/settings/personal-information')}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">Personal Information</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        View and update your personal information
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/settings/kyc')}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">KYC & Verification</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        Complete identity verification
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="p-4 sm:p-5 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900">Security & Privacy</h3>
            </div>
            <ul className="space-y-3 px-4 pb-4">
              <li>
                <button
                  onClick={() => navigate('/settings/setup-pin')}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">Security PIN</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        {isPinSet ? 'PIN is configured' : 'Set up a PIN for app security'}
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>

              {isPinSet && (
                <li>
                  <button
                    onClick={handleLockApp}
                    className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                  >
                    <div className="flex items-center text-left flex-1 min-w-0">
                      <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="block font-medium">Lock App Now</span>
                        <span className="text-sm text-gray-500 line-clamp-2">
                          Immediately lock the app with your PIN
                        </span>
                      </div>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </li>
              )}

              <li>
                <button
                  onClick={() => navigate('/auth/forgot-password')}
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">Password</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        Change your account password
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>

              <li>
                <button className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">Two-Factor Authentication</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        Add an extra layer of security
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Financial Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="p-4 sm:p-5 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900">Financial Management</h3>
            </div>
            <ul className="space-y-3 px-4 pb-4">
              <li>
                <button 
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]" 
                  onClick={() => navigate('/transactions')}
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">Transaction History</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        View all your transactions and payments
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
              <li>
                <button 
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]" 
                  onClick={() => navigate('/settings/payment-methods')}
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">Payment Methods</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        Manage cards and payment options
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
              <li>
                <button 
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]" 
                  onClick={() => navigate('/settings/statements')}
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">Statements & Reports</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        Download account statements
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Order Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="p-4 sm:p-5 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900">Order Management</h3>
            </div>
            <ul className="space-y-3 px-4 pb-4">
              <li>
                <button 
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]" 
                  onClick={() => navigate('/orders')}
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">Order Management</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        View and manage your orders
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* App Preferences */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="p-4 sm:p-5 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900">App Preferences</h3>
            </div>
            <ul className="space-y-3 px-4 pb-4">
              <li>
                <Link 
                  to="/settings/notifications" 
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">Notifications</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        Manage notification preferences
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Support & About */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-fit">
          <div className="p-4 sm:p-5 pb-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-gray-900">Support & About</h3>
            </div>
            <ul className="space-y-3 px-4 pb-4">
              <li>
                <a 
                  href="https://surebankstores.ng/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">Help & Support</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        Get help with your account
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a 
                  href="https://surebankstores.ng/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between py-3 px-3 hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                >
                  <div className="flex items-center text-left flex-1 min-w-0">
                    <div className="h-10 w-10 bg-[#0066A1]/10 rounded-lg flex items-center justify-center mr-3">
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
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="block font-medium text-gray-900">About SureBank</span>
                      <span className="text-sm text-gray-500 line-clamp-2">
                        Learn more about our company
                      </span>
                    </div>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-50 border border-red-200 text-red-600 rounded-xl py-4 font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
      >
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
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Sign Out
      </button>
    </div>
  );
}

export default Settings;