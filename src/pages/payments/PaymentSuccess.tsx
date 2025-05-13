import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/toast-provider';
import { useLoader } from '@/lib/loader-provider';
import packagesApi, { IBPackage } from '@/lib/api/packages';
import { formatDateTime } from '@/lib/utils';

// Generic payment success data interface
interface PaymentData {
  type: 'ibs' | 'contribution' | 'other';
  packageId?: string;
  packageName?: string;
  amount?: number;
  reference?: string;
  packageDetails?: IBPackage;
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | IBPackage
    | undefined
    | 'ibs'
    | 'contribution'
    | 'other';
}

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { showLoader, hideLoader } = useLoader();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        showLoader();

        // Get reference from URL params
        const reference = searchParams.get('reference');

        // Determine payment type from reference prefix if available
        let paymentType: 'ibs' | 'contribution' | 'other' = 'other';
        if (reference) {
          if (reference.startsWith('ds_')) paymentType = 'contribution';
          else if (reference.startsWith('sb_')) paymentType = 'contribution';
          else if (reference.startsWith('ibs_')) paymentType = 'ibs';
        }

        // Check localStorage for data first (for direct redirects from payment gateways)
        const contributionData = localStorage.getItem('contributionData');
        const ibsPackageData = localStorage.getItem('ibsPackageData');

        if (contributionData) {
          // Handle contribution payment
          const parsedData = JSON.parse(contributionData);
          setPaymentData({
            type: 'contribution',
            ...parsedData,
          });
          localStorage.removeItem('contributionData');
        } else if (ibsPackageData) {
          // Handle IBS package data
          const parsedData = JSON.parse(ibsPackageData);
          setPaymentData({
            type: 'ibs',
            ...parsedData,
          });
          localStorage.removeItem('ibsPackageData');
        } else if (reference && paymentType === 'ibs') {
          // Fetch IBS package by reference if no local data
          const packageDetails = await packagesApi.getIBPackageByReference(
            reference
          );
          setPaymentData({
            type: 'ibs',
            reference,
            packageDetails,
          });
          toast.success({ title: 'Package fetched successfully' });
        } else if (reference && paymentType === 'contribution') {
          // Handle contribution reference
          // We might need to fetch contribution details from API
          setPaymentData({
            type: 'contribution',
            reference,
            date: new Date(),
          });
        } else if (reference) {
          // Generic reference handling for other payment types
          setPaymentData({
            type: 'other',
            reference,
            date: new Date(),
          });
        } else {
          // Fallback if no identifiable information
          toast.error({ title: 'Missing payment information' });
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
        toast.error({ title: 'Failed to fetch payment details' });
      } finally {
        setLoading(false);
        hideLoader();
      }
    };

    fetchPaymentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewPackage = () => {
    if (paymentData?.type === 'contribution' && paymentData.packageId) {
      navigate(`/packages/${paymentData.packageId}`);
    } else if (paymentData?.type === 'ibs') {
      navigate('/packages');
    } else {
      navigate('/packages');
    }
  };

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 flex items-center justify-center mb-6">
            <div className="h-10 w-10 border-4 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Your Payment
          </h1>
          <p className="text-gray-600 mb-6">
            Please wait while we confirm your transaction...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {paymentData?.type === 'ibs'
            ? 'Package Created Successfully!'
            : paymentData?.type === 'contribution'
            ? 'Contribution Successful!'
            : 'Payment Successful!'}
        </h1>

        <p className="text-gray-600 mb-6">
          {paymentData?.type === 'ibs'
            ? 'Your investment package has been created successfully.'
            : paymentData?.type === 'contribution'
            ? 'Your contribution has been processed successfully.'
            : 'Your transaction has been processed successfully.'}
        </p>

        <div className="bg-white rounded-xl shadow-sm p-6 w-full mb-6">
          <div className="space-y-4">
            {/* IBS Package Details */}
            {paymentData?.type === 'ibs' && paymentData.packageDetails && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Package Name</span>
                  <span className="font-medium text-gray-900">
                    {paymentData.packageDetails.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Principal Amount</span>
                  <span className="font-medium text-gray-900">
                    ₦
                    {paymentData.packageDetails.principalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Interest Rate</span>
                  <span className="font-medium text-gray-900">
                    {paymentData.packageDetails.interestRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lock Period</span>
                  <span className="font-medium text-gray-900">
                    {paymentData.packageDetails.lockPeriod} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Maturity Date</span>
                  <span className="font-medium text-gray-900">
                    {formatDateTime(paymentData.packageDetails.maturityDate)}
                  </span>
                </div>
              </>
            )}

            {/* Common Details */}
            {paymentData?.reference && (
              <div className="flex justify-between">
                <span className="text-gray-500">Reference</span>
                <span className="font-medium text-gray-900">
                  {paymentData.reference.length > 12
                    ? `${paymentData.reference.substring(0, 12)}...`
                    : paymentData.reference}
                </span>
              </div>
            )}

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
            onClick={handleViewPackage}
            className="flex items-center justify-center bg-[#0066A1]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {paymentData?.type === 'ibs' ? 'View Packages' : 'View Package'}
          </Button>

          <Button
            onClick={handleBackToHome}
            variant="outline"
            className="flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
