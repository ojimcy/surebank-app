import { useState } from 'react';
import { toast } from 'react-hot-toast';
import packagesApi from '@/lib/api/packages';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/ui/Spinner';

interface EditDailySavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: {
    id: string;
    target: string;
    amountPerDay: number;
  };
  onSuccess: () => void;
}

export function EditDailySavingsModal({ isOpen, onClose, packageData, onSuccess }: EditDailySavingsModalProps) {
  const [target, setTarget] = useState(packageData.target);
  const [amountPerDay, setAmountPerDay] = useState(packageData.amountPerDay.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!target.trim()) {
      toast.error('Please enter a target');
      return;
    }

    const amountPerDayNum = parseFloat(amountPerDay);
    if (isNaN(amountPerDayNum) || amountPerDayNum <= 0) {
      toast.error('Please enter a valid amount per day');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await packagesApi.editDailySavingsPackage(packageData.id, {
        target: target.trim(),
        amountPerDay: amountPerDayNum
      });

      toast.success('Package updated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating package:', error);
      
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data
      ) {
        const errorMessage = error.response.data.message as string;
        toast.error(errorMessage);
      } else {
        toast.error('Failed to update package. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Daily Savings Package</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="target">Target</Label>
            <Input
              id="target"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., School Fees, House Rent"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="amountPerDay">Amount per Day (₦)</Label>
            <Input
              id="amountPerDay"
              type="number"
              value={amountPerDay}
              onChange={(e) => setAmountPerDay(e.target.value)}
              placeholder="Enter daily amount"
              min="1"
              step="0.01"
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}