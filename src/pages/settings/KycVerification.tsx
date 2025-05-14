import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function KycVerification() {
  const navigate = useNavigate();
  const [verificationMethod, setVerificationMethod] = useState<'bvn' | 'id' | null>(null);

  const handleMethodSelect = (method: 'bvn' | 'id') => {
    setVerificationMethod(method);
  };

  const handleContinue = () => {
    if (verificationMethod === 'bvn') {
      navigate('/settings/kyc/bvn');
    } else if (verificationMethod === 'id') {
      navigate('/settings/kyc/id');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">KYC & Verification</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Verify Your Identity</h2>
          <p className="text-gray-600 mt-2">
            Complete your KYC verification to unlock all features and higher transaction limits.
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="font-medium">Select a verification method:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BVN Verification Option */}
            <div 
              onClick={() => handleMethodSelect('bvn')}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                verificationMethod === 'bvn' 
                  ? 'border-[#0066A1] bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div className="h-10 w-10 bg-[#E5E8ED] rounded-full flex items-center justify-center mr-3">
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
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">BVN Verification</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Verify using your Bank Verification Number (BVN)
                  </p>
                  <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                    <li>Quick and easy verification</li>
                    <li>Requires your 11-digit BVN</li>
                    <li>Instant verification in most cases</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* ID Verification Option */}
            <div 
              onClick={() => handleMethodSelect('id')}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                verificationMethod === 'id' 
                  ? 'border-[#0066A1] bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start">
                <div className="h-10 w-10 bg-[#E5E8ED] rounded-full flex items-center justify-center mr-3">
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
                      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">ID Verification</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Verify using a government-issued ID
                  </p>
                  <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                    <li>Multiple ID types accepted</li>
                    <li>Step-by-step guided process</li>
                    <li>May take 24-48 hours for verification</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!verificationMethod}
              className={`px-6 py-2 rounded-md font-medium ${
                verificationMethod
                  ? 'bg-[#0066A1] text-white hover:bg-[#005085]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KycVerification;
