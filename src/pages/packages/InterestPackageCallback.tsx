import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import packagesApi, {
  CreateIBPackageParams,
  IBPackage,
} from '../../lib/api/packages';
import { toast } from 'react-hot-toast';

// Error type for API errors
interface ApiError {
  response?: {
    data?: {
      message?: string;
      code?: number;
    };
  };
  message: string;
}

function InterestPackageCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reference = searchParams.get('reference');
  const status = searchParams.get('status');
  const trxref = searchParams.get('trxref'); // Alternative reference

  const createPackageMutation = useMutation<
    IBPackage,
    ApiError,
    CreateIBPackageParams
  >({
    mutationFn: (data: CreateIBPackageParams) =>
      packagesApi.createIBPackage(data),
    onSuccess: (response) => {
      // Clear session storage
      sessionStorage.removeItem('interestPackagePayment');

      // Navigate to success page
      navigate('/packages/new/success', {
        state: {
          packageType: 'interest',
          target: response.name,
          amount: response.principalAmount,
          interestRate: response.interestRate,
          lockPeriod: response.lockPeriod,
          compoundingFrequency: response.compoundingFrequency || null,
        },
      });
    },
    onError: (error: ApiError) => {
      setIsProcessing(false);
      const errorMessage =
        error.response?.data?.message || 'Failed to create package';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  useEffect(() => {
    const processPayment = async () => {
      try {
        // If the payment was successful
        if (status === 'success' && (reference || trxref)) {
          const paymentRef = reference || trxref;

          // Get the stored package details
          const storedPackage = sessionStorage.getItem(
            'interestPackagePayment'
          );

          if (!storedPackage) {
            setIsProcessing(false);
            setError('Payment information not found. Please try again.');
            return;
          }

          try {
            const { data } = JSON.parse(storedPackage);

            // Create API request data
            const apiData: CreateIBPackageParams = {
              name: data.name,
              principalAmount: data.principalAmount,
              interestRate: data.interestRate,
              lockPeriod: data.lockPeriod,
              paymentReference: paymentRef as string,
            };

            // Only add compounding frequency if it exists in the saved data
            if (data.compoundingFrequency) {
              apiData.compoundingFrequency = data.compoundingFrequency;
            }

            // Create the package with the reference
            createPackageMutation.mutate(apiData);
          } catch (parseError) {
            setIsProcessing(false);
            setError('Invalid payment data. Please try again.');
            console.error('Error parsing stored payment data:', parseError);
          }
        } else {
          // Payment was not successful
          setIsProcessing(false);
          setError(
            status === 'cancelled'
              ? 'Payment was cancelled. Please try again.'
              : 'Payment was not successful. Please try again.'
          );
        }
      } catch (error) {
        setIsProcessing(false);
        setError(
          'An error occurred while processing your payment. Please try again.'
        );
        console.error('Payment processing error:', error);
      }
    };

    processPayment();
  }, [reference, trxref, status]);

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-lg text-[#495057]">Processing your payment...</p>
        <p className="text-sm text-[#6c757d] mt-2">
          Please do not close this window.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-medium text-[#212529] mb-4">
            Payment Error
          </h2>
          <p className="text-[#6c757d] mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/packages/new/interest')}
              className="block w-full bg-[#0066A1] text-white py-3 px-4 rounded-lg hover:bg-[#005085] transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/packages')}
              className="block w-full bg-white border border-[#CED4DA] text-[#495057] py-3 px-4 rounded-lg hover:bg-[#F6F8FA] transition-colors"
            >
              View All Packages
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default InterestPackageCallback;
