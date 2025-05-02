import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/lib/toast-provider';
import { useLoader } from '@/lib/loader-provider';
import packagesApi, { IBPackage } from '@/lib/api/packages';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

function IBSPackageSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { showLoader, hideLoader } = useLoader();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [package_, setPackage] = useState<IBPackage | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        showLoader();

        // Get the reference from URL query params
        const searchParams = new URLSearchParams(location.search);
        const reference = searchParams.get('reference');

        if (reference) {
          // Fetch package by reference if we have a reference
          const packageData = await packagesApi.getIBPackageByReference(
            reference
          );
          setPackage(packageData);
          setStatus('success');
          toast.success({ title: 'Package fetched successfully' });
        } else {
          // Fallback to most recent package if no reference found
          const packages = await packagesApi.getIBPackages();

          if (packages.length === 0) {
            throw new Error('No packages found');
          }

          // Sort packages by creation date (newest first)
          const sortedPackages = packages.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // Get the most recently created package
          setPackage(sortedPackages[0]);
          setStatus('success');
          toast.success({ title: 'Package fetched successfully' });
        }

        // Clean up any leftover data
        localStorage.removeItem('ibsPackageData');
      } catch (error) {
        console.error('Failed to fetch package:', error);
        setStatus('error');
        toast.error({ title: 'Failed to fetch package details' });
      } finally {
        hideLoader();
      }
    };

    fetchPackage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 border-4 border-t-blue-500 rounded-full animate-spin"></div>
        <h2 className="text-xl font-semibold">Loading your IBS package...</h2>
        <p className="text-gray-500">
          Please wait while we fetch your package details
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-gray-500 text-center max-w-md">
          {'Could not fetch your package details'}. Click the button below to
          try again.
        </p>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-medium"
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/packages')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            View My Packages
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          If the issue persists after retrying, please{' '}
          <button
            onClick={() => navigate('/settings/support')}
            className="text-blue-500 underline hover:text-blue-700"
          >
            contact support
          </button>
        </p>
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
                {formatDateTime(package_.maturityDate)}
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
