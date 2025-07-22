import { useState } from 'react';
import { PinVerificationModal, PinVerificationModalProps } from '@/components/auth/PinVerificationModal';

// Utility hook for PIN verification
export function usePinVerification() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<Partial<PinVerificationModalProps>>({});
  const [verificationPromise, setVerificationPromise] = useState<{
    resolve: (value: boolean) => void;
    reject: (reason?: unknown) => void;
  } | null>(null);

  const verifyPin = (options?: {
    title?: string;
    description?: string;
    bypassSession?: boolean;
  }): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      setVerificationPromise({ resolve, reject });
      setModalOptions(options || {});
      setIsModalOpen(true);
    });
  };

  const handleSuccess = () => {
    verificationPromise?.resolve(true);
    setVerificationPromise(null);
    setIsModalOpen(false);
  };

  const handleClose = () => {
    verificationPromise?.resolve(false);
    setVerificationPromise(null);
    setIsModalOpen(false);
  };

  return {
    verifyPin,
    PinVerificationModal: () => (
      <PinVerificationModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        {...modalOptions}
      />
    ),
  };
}