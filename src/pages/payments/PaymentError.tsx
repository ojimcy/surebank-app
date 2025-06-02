import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

// Create a logger for the payment error page
const errorLogger = logger.create('PaymentError');

function PaymentError() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get error details from URL params
  const reference = searchParams.get('reference');
  const message = searchParams.get('message') || 'Unknown error';
  const errorType = searchParams.get('type') || 'general';
  
  useEffect(() => {
    // Log the error for debugging
    errorLogger.warn('Payment error detected', {
      reference,
      message,
      errorType,
      timestamp: new Date().toISOString()
    });
  }, [reference, message, errorType]);

  const handleTryAgain = () => {
    // Determine where to navigate based on error type
    if (errorType === 'contribution') {
      navigate('/payments/contribution');
    } else if (errorType === 'ibs') {
      navigate('/packages/new-ibs');
    } else {
      navigate('/dashboard');
    }
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

        <p className="text-gray-600 mb-6">
          Your payment could not be processed. Please try again or contact support.
        </p>

        <div className="bg-white rounded-xl shadow-sm p-6 w-full mb-6">
          <div className="space-y-4">
            {reference && (
              <div className="flex justify-between">
                <span className="text-gray-500">Reference</span>
                <span className="font-medium text-gray-900">
                  {reference.length > 12
                    ? `${reference.substring(0, 12)}...`
                    : reference}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-500">Error</span>
              <span className="font-medium text-red-600">
                {message}
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

        <div className="grid grid-cols-2 gap-3 w-full">
          <Button
            onClick={handleTryAgain}
            className="flex items-center justify-center bg-[#0066A1]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Try Again
          </Button>

          <Button
            onClick={handleBackToHome}
            variant="outline"
            className="flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentError;
