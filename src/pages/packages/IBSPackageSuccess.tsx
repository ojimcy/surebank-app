import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/lib/toast-provider';
import { useLoader } from '@/lib/loader-provider';
import packagesApi, {
  CreateIBSPackageParams,
  IBPackage,
} from '@/lib/api/packages';
import { CheckCircle, AlertCircle } from 'lucide-react';

function IBSPackageSuccess() {
  const navigate = useNavigate();
  const toast = useToast();
  const { showLoader, hideLoader } = useLoader();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [package_, setPackage] = useState<IBPackage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const createPackage = async () => {
      try {
        showLoader();

        // Retrieve package data from localStorage
        const storedData = localStorage.getItem('ibsPackageData');
        if (!storedData) {
          throw new Error('No package data found');
        }

        const packageData = JSON.parse(storedData) as CreateIBSPackageParams;

        // Add the redirect_url to package data during API call
        const apiData = {
          ...packageData,
          // Default values for compounding frequency and early withdrawal penalty
          compoundingFrequency: 'quarterly',
          earlyWithdrawalPenalty: 50,
        };

        // Call API to create the package
        const newPackage = await packagesApi.createIBSPackage(apiData);

        // Clear stored data
        localStorage.removeItem('ibsPackageData');

        // Update state
        setPackage(newPackage);
        setStatus('success');
        toast.success({ title: 'Package created successfully' });
      } catch (error) {
        console.error('Failed to create package:', error);
        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
        toast.error({ title: 'Failed to create package' });
      } finally {
        hideLoader();
      }
    };

    createPackage();
  }, [showLoader, hideLoader, toast, navigate]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 border-4 border-t-blue-500 rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold">Creating your IBS package...</h2>
        <p className="text-gray-500">
          Please wait while we process your payment
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-gray-500">
          {errorMessage || 'Could not create your package'}
        </p>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/packages')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            View My Packages
          </button>
          <button
            onClick={() => navigate('/packages/new/ibs')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h2 className="text-2xl font-bold">Package Created Successfully!</h2>

      {package_ && (
        <div className="bg-gray-50 p-6 rounded-lg w-full max-w-md">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Package Name</p>
              <p className="font-medium">{package_.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Principal Amount</p>
              <p className="font-medium">
                ₦{package_.principalAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Interest Rate</p>
              <p className="font-medium">{package_.interestRate}%</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Lock Period</p>
              <p className="font-medium">{package_.lockPeriod} days</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Maturity Date</p>
              <p className="font-medium">
                {new Date(package_.maturityDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => navigate('/packages')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          View My Packages
        </button>
        <button
          onClick={() => navigate('/packages/new/ibs')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Create Another Package
        </button>
      </div>
    </div>
  );
}

export default IBSPackageSuccess;
