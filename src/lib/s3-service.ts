import api from './api/axios';

interface PresignedUrlResponse {
  url: string;
  key: string;
}

// Upload a file to S3 using a presigned URL from the backend
export const uploadFileToS3 = async (
  file: File,
  type: 'id-document' | 'selfie',
  onProgress?: (progress: number) => void,
  userId?: string
): Promise<{ key: string; url: string }> => {
  try {
    // Get a presigned URL from the backend
    const response = await api.post<PresignedUrlResponse>('/s3/presigned-url', {
      contentType: file.type,
      fileName: file.name,
      documentType: type
    });
    
    const { url: uploadUrl, key } = response.data;
    
    // Use XMLHttpRequest to track upload progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress(percentage);
          }
        };
      }
      
      // Handle completion
      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // Get the URL of the uploaded file from the backend
          const fileResponse = await api.get(`/s3/files/${encodeURIComponent(key)}`);
          
          resolve({
            key,
            url: fileResponse.data.url
          });
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };
      
      // Handle errors
      xhr.onerror = () => reject(new Error('Network error during file upload'));
      xhr.onabort = () => reject(new Error('File upload was aborted'));
      
      // Start the upload - for presigned PUT URLs
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      
      // Add required metadata headers
      if (userId) {
        xhr.setRequestHeader('x-amz-meta-user-id', userId);
      }
      xhr.setRequestHeader('x-amz-meta-document-type', type);
      xhr.setRequestHeader('x-amz-meta-original-name', encodeURIComponent(file.name));
      
      xhr.send(file);
    });
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Delete a file from S3 via the backend
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  try {
    await api.delete(`/s3/files/${encodeURIComponent(key)}`);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};
