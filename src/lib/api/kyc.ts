import api from './axios';

export interface KycIdVerificationPayload {
  name: string;
  kycType: 'id';
  idType: string;
  idNumber: string;
  idImage: string;
  selfieImage: string;
  expiryDate: string;
  address: string;
  dateOfBirth: string;
  phoneNumber: string;
}

export interface KycResponse {
  success: boolean;
  message: string;
  id?: string;
  status?: string;
}

const kycApi = {
  /**
   * Submit ID verification request
   */
  submitIdVerification: async (data: KycIdVerificationPayload): Promise<KycResponse> => {
    const response = await api.post<KycResponse>('/kyc', data);
    return response.data;
  },
  
  /**
   * Get KYC verification status
   */
  getVerificationStatus: async (): Promise<{
    status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
    message?: string;
    updatedAt?: string;
  }> => {
    const response = await api.get('/kyc/status');
    return response.data;
  }
};

export default kycApi; 