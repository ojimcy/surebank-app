import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import packagesApi, { SBPackage } from '@/lib/api/packages';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/lib/toast-provider';

// Package type for the UI
interface UIPackage {
  id: string;
  name: string;
  type: string;
  balance: number;
  target: number;
}

function MergePackages() {
  const [packages, setPackages] = useState<UIPackage[]>([]);
  const [fromPackage, setFromPackage] = useState<string>('');
  const [toPackage, setToPackage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingPackages, setIsFetchingPackages] = useState<boolean>(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();
  
  // Fetch user's packages when component mounts
  useEffect(() => {
    fetchUserPackages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
  
  // Fetch user's packages
  const fetchUserPackages = async () => {
    if (!user?.id) return;
    
    setIsFetchingPackages(true);
    try {
      const sbPackages = await packagesApi.getSBPackages(user.id);
      
      // Filter out closed packages and format for UI
      const activeSBPackages = sbPackages
        .filter(pkg => pkg.status !== 'closed')
        .map((pkg: SBPackage) => ({
          id: pkg._id,
          name: pkg.product?.name || 'SureBank Package',
          type: 'SB Package',
          balance: pkg.totalContribution,
          target: pkg.targetAmount
        }));
      
      setPackages(activeSBPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      showError({
        title: "Error",
        description: "Failed to fetch packages. Please try again."
      });
    } finally {
      setIsFetchingPackages(false);
    }
  };
  
  // Handle merge packages
  const handleMergePackages = async () => {
    if (!fromPackage || !toPackage) {
      showError({
        title: "Error",
        description: "Please select both packages to merge"
      });
      return;
    }
    
    if (fromPackage === toPackage) {
      showError({
        title: "Error",
        description: "You cannot merge a package with itself"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Call the merge endpoint
      await packagesApi.mergePackages(fromPackage, toPackage);
      
      showSuccess({
        title: "Success",
        description: "Packages merged successfully"
      });
      
      // Navigate back to packages list
      navigate('/packages');
    } catch (error) {
      console.error('Error merging packages:', error);
      showError({
        title: "Error",
        description: "Failed to merge packages. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Merge Packages</CardTitle>
          <CardDescription>
            Combine two packages by merging them together. The source package will be closed and its balance transferred to the destination package.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromPackage">Source Package (Will be closed)</Label>
            <Select
              disabled={isFetchingPackages || isLoading}
              value={fromPackage}
              onValueChange={setFromPackage}
            >
              <SelectTrigger id="fromPackage">
                <SelectValue placeholder="Select source package" />
              </SelectTrigger>
<SelectContent>
  {packages
   .filter(pkg => pkg.id !== fromPackage) // Remove already selected source package
   .map((pkg) => (
    <SelectItem key={pkg.id} value={pkg.id}>
      {pkg.name} ({formatCurrency(pkg.balance)})
    </SelectItem>
  ))}
</SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="toPackage">Destination Package</Label>
            <Select
              disabled={isFetchingPackages || isLoading}
              value={toPackage}
              onValueChange={setToPackage}
            >
              <SelectTrigger id="toPackage">
                <SelectValue placeholder="Select destination package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name} ({formatCurrency(pkg.balance)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            className="w-full" 
            disabled={isFetchingPackages || isLoading || !fromPackage || !toPackage} 
            onClick={handleMergePackages}
          >
            {isLoading ? 'Merging...' : 'Merge Packages'}
          </Button>
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default MergePackages; 