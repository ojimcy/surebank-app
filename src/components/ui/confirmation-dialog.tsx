import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-slate-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="pt-2 text-slate-600">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 pt-6 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            {cancelText}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            className={destructive ? 
              "bg-red-600 hover:bg-red-700 transition-colors" : 
              "bg-primary hover:bg-primary/90 transition-colors shadow-sm"}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
