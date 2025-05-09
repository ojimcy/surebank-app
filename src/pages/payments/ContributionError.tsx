import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ContributionError() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get error information from URL parameters
  const errorMessage =
    searchParams.get('message') || 'Your payment could not be processed.';
  const transactionReference = searchParams.get('reference') || '';

  const handleTryAgain = () => {
    navigate('/payments/contribution');
  };

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Failed
        </h1>

        <p className="text-gray-600 mb-6">{errorMessage}</p>

        {transactionReference && (
          <div className="bg-white rounded-xl shadow-sm p-6 w-full mb-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Reference</span>
                <span className="font-medium text-gray-900">
                  {transactionReference.substring(0, 12)}...
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-NG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            onClick={handleTryAgain}
            className="flex items-center justify-center bg-[#0066A1]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <Button
            onClick={handleBackToHome}
            variant="outline"
            className="flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ContributionError;
