import { UserType } from './types';

interface WelcomeCardProps {
  user: UserType | null;
}

export function WelcomeCard({
  user,
}: WelcomeCardProps) {
  return (
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
  );
}
