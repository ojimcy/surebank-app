import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/lib/toast-provider';
import packagesApi, { SBPackage } from '@/lib/api/packages';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PackageOption {
  id: string;
  name: string;
  balance: number;
  accountNumber: string;
  productName?: string;
}

function MergePackage() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: showError, success: showSuccess } = useToast();

  const [sourcePackage, setSourcePackage] = useState<SBPackage | null>(null);
  const [availablePackages, setAvailablePackages] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingPackages, setFetchingPackages] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);

  // Fetch compatible packages for merging (only SB packages)
  const fetchCompatiblePackages = async () => {
    if (!user?.id || !packageId) return;
    
    setFetchingPackages(true);
    try {
      // Get all SB packages for the user
      const sbPackages = await packagesApi.getSBPackages(user.id);
      
      // Filter out the current package and closed packages
      const compatiblePackages = sbPackages
        .filter((pkg) => pkg._id !== packageId && pkg.status !== 'CLOSED')
        .map((pkg) => ({
          id: pkg._id,
          name: pkg.accountNumber,
          balance: pkg.totalContribution,
          accountNumber: pkg.accountNumber,
          productName: pkg.product?.name || 'SB Package',
        }));
      
      setAvailablePackages(compatiblePackages);
    } catch (err) {
      console.error('Error fetching compatible packages:', err);
      showError({
        title: "Error",
        description: "Failed to fetch compatible packages. Please try again."
      });
    } finally {
      setFetchingPackages(false);
    }
  };

  // Fetch source package details (only SB package)
  useEffect(() => {
    const fetchSourcePackage = async () => {
      if (!packageId || !user?.id) return;
      
      setLoading(true);
      try {
        // Get all SB packages for the user
        const sbPackages = await packagesApi.getSBPackages(user.id);
        
        // Find the specific package by ID
        const sbPackage = sbPackages.find(pkg => pkg._id === packageId);
        if (sbPackage) {
          setSourcePackage(sbPackage);
          // Fetch compatible packages for merging
          await fetchCompatiblePackages();
          return;
        }
        
        // If we get here, the package wasn't found
        showError({
          title: "Error",
          description: "Could not find the specified package."
        });
        navigate('/packages');
      } catch (err) {
        console.error('Error fetching package details:', err);
        showError({
          title: "Error",
          description: "Failed to fetch package details. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSourcePackage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId, user?.id, navigate, showError]);

  // Handle package selection
  const handlePackageSelect = (value: string) => {
    setSelectedPackage(value);
  };

  // Handle merge confirmation
  const handleMergePackage = async () => {
    if (!sourcePackage || !selectedPackage) return;
    
    setLoading(true);
    try {
      // Call API to merge packages
      await packagesApi.mergePackages(sourcePackage._id, selectedPackage);
      
      showSuccess({
        title: "Success",
        description: "Products merged successfully."
      });
      
      // Navigate back to packages list
      navigate('/packages');
    } catch (err) {
      console.error('Error merging packages:', err);
      showError({
        title: "Error",
        description: "Failed to merge products. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle merge button click
  const handleMergeClick = () => {
    if (selectedPackage) {
      setShowMergeDialog(true);
    } else {
      showError({
        title: "Error",
        description: "Please select a product package to merge with."
      });
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate(`/packages/${packageId}`);
  };

  if (loading && !sourcePackage) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
        onClick={handleBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-3">Merge Packages</h1>
        <p className="text-gray-500 max-w-sm mx-auto">
          Combine two packages by merging them together. The source package will be closed and its balance transferred to the destination package.
        </p>
      </div>

      {loading && !sourcePackage ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sourcePackage && (
        <Card className="mb-8 shadow-md border-slate-200 bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-lg text-slate-900">Source Package (Will be closed)</h3>
            <p className="text-sm text-slate-600">This package will be closed after merging</p>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Product</span>
                <span className="font-semibold text-slate-900">{sourcePackage.product?.name || 'SB Package'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Account Number</span>
                <span className="font-semibold text-slate-900">{sourcePackage.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-200">
                <span className="text-slate-500 font-medium">Balance</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(sourcePackage.totalContribution || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">Target Amount</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(sourcePackage.targetAmount || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8 shadow-md border-slate-200 bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-lg text-slate-900">Target Package</h3>
          <p className="text-sm text-slate-600">Select another package to merge with</p>
        </div>
        <CardContent className="p-6">
          {fetchingPackages ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : availablePackages.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <p className="text-slate-500">No other packages available for merging</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-500 mb-2">Choose a destination package:</p>
              <Select value={selectedPackage} onValueChange={handlePackageSelect}>
                <SelectTrigger className="bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {availablePackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.productName} ({pkg.accountNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedPackage && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-500 mb-2">Selected package:</p>
                  <p className="font-medium text-slate-900">
                    {availablePackages.find(pkg => pkg.id === selectedPackage)?.productName} 
                    ({availablePackages.find(pkg => pkg.id === selectedPackage)?.accountNumber})
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Balance: {formatCurrency(availablePackages.find(pkg => pkg.id === selectedPackage)?.balance || 0)}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors py-6"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Package Details
        </Button>
        
        <Button
          className="w-full bg-primary hover:bg-primary/90 transition-colors shadow-md py-6 font-medium"
          disabled={!selectedPackage || loading}
          onClick={handleMergeClick}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Merge Packages"
          )}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showMergeDialog}
        onOpenChange={setShowMergeDialog}
        title="Merge Product Packages"
        description="Merge these two product packages. This will combine your contributions toward both products."
        confirmText="Merge Products"
        onConfirm={handleMergePackage}
      />
    </div>
  );
}

export default MergePackage;
