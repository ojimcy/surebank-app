import { useNavigate } from 'react-router-dom';

function KycSuccess() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Verification Submitted</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">Verification Successfully Submitted</h2>
        <p className="text-gray-600 mb-6">
          Your verification information has been submitted successfully. Our team will review your information shortly.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
          <div className="flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0"
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
            <div>
              <p className="text-sm text-blue-800">
                <span className="font-medium">What happens next?</span>
              </p>
              <ul className="text-sm text-blue-800 list-disc list-inside mt-1">
                <li>Our team will review your verification documents</li>
                <li>This process typically takes 24-48 hours</li>
                <li>You'll receive a notification once your verification is complete</li>
                <li>You can check your verification status in the settings menu</li>
              </ul>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/settings')}
          className="px-6 py-2 rounded-md font-medium bg-[#0066A1] text-white hover:bg-[#005085]"
        >
          Back to Settings
        </button>
      </div>
    </div>
  );
}

export default KycSuccess;
