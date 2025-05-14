import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface ContributionData {
  packageId: string;
  packageName: string;
  amount: number;
  packageType: 'ds' | 'sb';
}

function ContributionSuccess() {
  const [contributionData, setContributionData] =
    useState<ContributionData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve stored contribution data from localStorage
    try {
      const storedData = localStorage.getItem('contributionData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setContributionData(parsedData);
        // Clear the data after retrieval
        localStorage.removeItem('contributionData');
      }
    } catch (error) {
      console.error('Error retrieving contribution data:', error);
      toast.error('Failed to retrieve transaction details');
    }
  }, []);

  const handleViewPackage = () => {
    if (contributionData?.packageId) {
      navigate(`/packages/${contributionData.packageId}`);
    } else {
      navigate('/packages');
    }
  };

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Contribution Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Your contribution has been processed successfully.
        </p>

        <div className="grid grid-cols-2 gap-3 w-full mt-6">
          <Button
            onClick={handleViewPackage}
            className="flex items-center justify-center bg-[#0066A1]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            View Package
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

export default ContributionSuccess;
