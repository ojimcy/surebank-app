import { Link } from 'react-router-dom';
import { UserType } from './types';
import { User, Mail, Phone, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface WelcomeCardProps {
  user: UserType | null;
}

export function WelcomeCard({
  user,
}: WelcomeCardProps) {
  return (
    <div className="bg-gradient-to-br from-[#0066A1] to-[#004d7a] text-white rounded-xl shadow-lg p-6 border border-[#0077b6]/20">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-3 flex items-center gap-2">
            <User className="text-blue-200 h-5 w-5" />
            Welcome, {user ? `${user.firstName}` : 'User'}
          </h1>
          <p className="text-sm opacity-90 flex items-center gap-2 mb-2">
            {user?.email ? (
              <>
                <Mail className="text-blue-200 h-4 w-4" />
                {user.email}
              </>
            ) : user?.phoneNumber ? (
              <>
                <Phone className="text-blue-200 h-4 w-4" />
                {user.phoneNumber}
              </>
            ) : (
              'Manage your savings with SureBank'
            )}
          </p>
        </div>
      </div>
      
      {user?.kycStatus && (
        <div className="mt-4 pt-3 border-t border-white/20">
          {user.kycStatus === 'verified' ? (
            <div className="flex items-center gap-2 text-sm bg-green-500/20 p-2 rounded-lg">
              <CheckCircle className="text-green-400 h-4 w-4" />
              <span className="font-medium">KYC Verified</span>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 text-sm bg-yellow-500/20 p-2 rounded-lg">
                <AlertTriangle className="text-yellow-400 h-4 w-4" />
                <span className="font-medium">KYC Status: {user.kycStatus}</span>
              </div>
              <Link 
                to="/settings/kyc" 
                className="mt-2 group flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Complete Your KYC Verification
                <ArrowRight className="group-hover:translate-x-1 transition-transform duration-200 h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
