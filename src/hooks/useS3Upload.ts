import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { uploadFileToS3 } from '@/lib/s3-service';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: Error | null;
  url: string | null;
  key: string | null;
}

type UploadDocumentType = 'id-document' | 'selfie';

export function useS3Upload() {
  const { user } = useAuth();
  const [uploadState, setUploadState] = useState<Record<string, UploadState>>({});

  const uploadFile = async (
    file: File,
    documentType: UploadDocumentType,
    uploadId: string = 'default'
  ): Promise<{ url: string; key: string } | null> => {
    if (!user?.id) {
      const error = new Error('User not authenticated');
      setUploadState(prev => ({
        ...prev,
        [uploadId]: {
          isUploading: false,
          progress: 0,
          error,
          url: null,
          key: null,
        },
      }));
      throw error;
    }

    // Initialize upload state
    setUploadState(prev => ({
      ...prev,
      [uploadId]: {
        isUploading: true,
        progress: 0,
        error: null,
        url: null,
        key: null,
      },
    }));

    try {
      // Handle progress updates
      const onProgress = (progress: number) => {
        setUploadState(prev => ({
          ...prev,
          [uploadId]: {
            ...prev[uploadId],
            progress,
          },
        }));
      };

      // Upload the file
      const result = await uploadFileToS3(file, documentType, onProgress);

      // Update state with success
      setUploadState(prev => ({
        ...prev,
        [uploadId]: {
          isUploading: false,
          progress: 100,
          error: null,
          url: result.url,
          key: result.key,
        },
      }));

      return result;
    } catch (error) {
      // Update state with error
      setUploadState(prev => ({
        ...prev,
        [uploadId]: {
          ...prev[uploadId],
          isUploading: false,
          error: error instanceof Error ? error : new Error('Unknown error occurred'),
        },
      }));
      
      // Re-throw the error so callers can handle it
      throw error;
    }
  };

  const resetUploadState = (uploadId: string = 'default') => {
    setUploadState(prev => {
      const newState = { ...prev };
      delete newState[uploadId];
      return newState;
    });
  };

  return {
    uploadFile,
    resetUploadState,
    uploadState,
  };
}
