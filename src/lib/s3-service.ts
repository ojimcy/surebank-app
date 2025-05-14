import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// Initialize the S3 client
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

// Generate a unique file key
const generateUniqueFileName = (file: File, userId: string, type: string): string => {
  const fileExtension = file.name.split('.').pop();
  const timestamp = new Date().getTime();
  return `${userId}/${type}/${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
};

// Upload a file to S3
export const uploadFileToS3 = async (
  file: File,
  userId: string,
  type: 'id-document' | 'selfie',
  onProgress?: (progress: number) => void
): Promise<{ key: string; url: string }> => {
  try {
    // Generate a unique file key
    const key = generateUniqueFileName(file, userId, type);
    
    // Create the upload parameters
    const params = {
      Bucket: import.meta.env.VITE_AWS_S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: file.type,
      // Set appropriate metadata
      Metadata: {
        'user-id': userId,
        'document-type': type,
        'original-name': encodeURIComponent(file.name),
      },
    };
    
    // Create a multipart upload
    const upload = new Upload({
      client: s3Client,
      params,
    });
    
    // Handle progress if a callback is provided
    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        if (progress.loaded && progress.total) {
          const percentage = Math.round((progress.loaded / progress.total) * 100);
          onProgress(percentage);
        }
      });
    }
    
    // Complete the upload
    await upload.done();
    
    // Construct the URL (this is the S3 URL pattern)
    const url = `https://${import.meta.env.VITE_AWS_S3_BUCKET}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${key}`;
    
    return {
      key,
      url,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Delete a file from S3
export const deleteFileFromS3 = async (key: string): Promise<void> => {
  try {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: import.meta.env.VITE_AWS_S3_BUCKET,
        Key: key,
      })
    );
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};
