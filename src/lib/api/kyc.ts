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
  message?: string;
  id?: string;
  status?: string;
}

const kycApi = {
  /**
   * Submit ID verification request
   */
  submitIdVerification: async (data: KycIdVerificationPayload): Promise<KycResponse> => {
    const response = await api.post<{ _id?: string; id?: string; status?: string }>(
      '/kyc',
      data
    );
    // Backend returns the created KYC document, not a { success } wrapper
    // Normalize to the shape the UI expects
    const kyc = response.data;
    return {
      success: true,
      id: (kyc.id as string | undefined) || (kyc._id as string | undefined),
      status: kyc.status,
    };
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