import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import packagesApi from '@/lib/api/packages';
import DailySavingsDetail from './DailySavingsDetail';
import SBPackageDetail from './SBPackageDetail';
import IBPackageDetail from './IBPackageDetail';

function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [packageType, setPackageType] = useState<'DS' | 'SB' | 'IB' | null>(null);

  useEffect(() => {
    if (!id || !user?.id) {
      setError('Invalid package or user not authenticated');
      setLoading(false);
      return;
    }

    const determinePackageType = async () => {
      setLoading(true);
      try {
        // Fetch all packages to determine the type
        const { dailySavings, sbPackages, ibPackages } = await packagesApi.getAllPackages(user.id);

        // Check in daily savings
        const dsPackage = dailySavings.find((pkg) => pkg.id === id);
        if (dsPackage) {
          setPackageType('DS');
          setLoading(false);
          return;
        }

        // Check in SB packages
        const sbPackage = sbPackages.find((pkg) => pkg._id === id);
        if (sbPackage) {
          setPackageType('SB');
          setLoading(false);
          return;
        }

        // Check in IB packages
        const ibPackage = ibPackages.find((pkg) => pkg.id === id || pkg._id === id);
        if (ibPackage) {
          setPackageType('IB');
          setLoading(false);
          return;
        }

        // If we get here, package wasn't found
        setError('Package not found');
        setLoading(false);
      } catch (err) {
        console.error('Error determining package type:', err);
        setError('Failed to load package details. Please try again later.');
        setLoading(false);
      }
    };

    determinePackageType();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0066A1]"></div>
      </div>
    );
  }

  if (error || !packageType) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
          <p>{error || 'Package not found'}</p>
          <button
            className="mt-2 text-sm font-medium underline"
            onClick={() => navigate('/packages')}
          >
            Return to packages
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate detail component based on package type
  switch (packageType) {
    case 'DS':
      return <DailySavingsDetail />;
    case 'SB':
      return <SBPackageDetail />;
    case 'IB':
      return <IBPackageDetail />;
    default:
      return (
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
            <p>Unknown package type</p>
            <button
              className="mt-2 text-sm font-medium underline"
              onClick={() => navigate('/packages')}
            >
              Return to packages
            </button>
          </div>
        </div>
      );
  }
}

export default PackageDetail;
