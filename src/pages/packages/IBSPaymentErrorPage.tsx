import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NestedHeader from '@/components/layout/NestedHeader';

function IBSPaymentErrorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract error details from URL parameters
  const errorMessage = searchParams.get('message') || 'Unknown error occurred';
  const status = searchParams.get('status');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <NestedHeader title="Payment Failed" />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center space-y-4">
          <div className="mb-6">
            <h2 className="text-lg font-medium">Error Details</h2>
            <p className="text-gray-500">{errorMessage}</p>
            <p className="text-gray-500">{status}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              onClick={() => navigate('/packages/new/ibs')}
              variant="default"
            >
              Try Again
            </Button>
            <Button onClick={() => navigate('/support')} variant="outline">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IBSPaymentErrorPage;
