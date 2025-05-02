import api from './axios';

// API package types and response interfaces
export interface DailySavingsPackage {
  id: string;
  accountNumber: string;
  amountPerDay: number;
  target: string;
  targetAmount: number;
  totalContribution: number;
  status: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  endDate?: string;
}

export interface SBPackage {
  _id: string;
  accountNumber: string;
  targetAmount: number;
  totalContribution: number;
  status: string;
  startDate: string;
  endDate?: string;
  product?: {
    name: string;
    images?: string[];
  };
}

export interface IBPackage {
  _id: string;
  name: string;
  userId: string;
  accountNumber: string;
  principalAmount: number;
  interestRate: number;
  lockPeriod: number;
  compoundingFrequency: string;
  earlyWithdrawalPenalty: number;
  status: string;
  maturityDate: string;
  accruedInterest: number;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  totalContribution: number;
  currentBalance: number;
}

export interface InterestRateOption {
  id: string;
  rate: number;
  minLockPeriod: number;
  maxLockPeriod: number;
  description?: string;
}

// Package creation interfaces
export interface CreateDailySavingsPackageParams {
  amountPerDay: number;
  target: string;
}

export interface CreateSBPackageParams {
  product: string;
  targetAmount?: number;
}

export interface InitiateIBSPackageParams {
  name: string;
  principalAmount: number;
  interestRate?: number;
  lockPeriod: number;
  earlyWithdrawalPenalty?: number;
  redirect_url?: string;
  callbackUrl?: string;
}

export interface CreateIBSPackageParams extends InitiateIBSPackageParams {
  paymentReference: string;
}

export interface InitiatePaymentResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  principalAmount: number;
  interestRate: number;
  lockPeriod: number;
}

// Packages API functions
const packagesApi = {
  // Get daily savings packages for a user
  getDailySavings: async (userId: string): Promise<DailySavingsPackage[]> => {
    const response = await api.get<DailySavingsPackage[]>(
      `/daily-savings/package?userId=${userId}`
    );
    return response.data;
  },

  // Get SureBank packages for a user
  getSBPackages: async (userId: string): Promise<SBPackage[]> => {
    const response = await api.get<SBPackage[]>(
      `/daily-savings/sb/package?userId=${userId}`
    );
    return response.data;
  },

  // Get Interest-Based packages for a user
  getIBPackages: async (): Promise<IBPackage[]> => {
    const response = await api.get<IBPackage[]>(`/interest-savings/package`);
    return response.data;
  },

  // Get Interest-Based package by ID
  getIBPackageById: async (id: string): Promise<IBPackage> => {
    const response = await api.get<IBPackage>(
      `/interest-savings/package/${id}`
    );
    return response.data;
  },

  // Get Interest-Based package by payment reference
  getIBPackageByReference: async (reference: string): Promise<IBPackage> => {
    const response = await api.get<IBPackage>(
      `/interest-savings/package/reference?reference=${reference}`
    );
    return response.data;
  },

  // Get all package types for a user
  getAllPackages: async (
    userId: string
  ): Promise<{
    dailySavings: DailySavingsPackage[];
    sbPackages: SBPackage[];
    ibPackages: IBPackage[];
  }> => {
    const [dsResponse, sbResponse, ibResponse] = await Promise.all([
      packagesApi.getDailySavings(userId),
      packagesApi.getSBPackages(userId),
      packagesApi.getIBPackages(),
    ]);

    return {
      dailySavings: dsResponse,
      sbPackages: sbResponse,
      ibPackages: ibResponse,
    };
  },

  // Create a new daily savings package
  createDailySavingsPackage: async (
    data: CreateDailySavingsPackageParams
  ): Promise<DailySavingsPackage> => {
    const response = await api.post<DailySavingsPackage>(
      '/daily-savings/self-package',
      data
    );
    return response.data;
  },

  // Create a new Savings-Buying (SB) package
  createSBPackage: async (data: CreateSBPackageParams): Promise<SBPackage> => {
    const response = await api.post<SBPackage>(
      '/daily-savings/sb/self-package',
      data
    );
    return response.data;
  },

  // Initiate payment for an Interest-Based Savings package
  initiateIBSPackagePayment: async (
    data: InitiateIBSPackageParams
  ): Promise<InitiatePaymentResponse> => {
    const response = await api.post<InitiatePaymentResponse>(
      '/interest-savings/package/init-payment',
      data
    );
    return response.data;
  },

  // Create a new Interest-Based Savings package after payment
  createIBSPackage: async (
    data: CreateIBSPackageParams
  ): Promise<IBPackage> => {
    const response = await api.post<IBPackage>(
      '/interest-savings/package',
      data
    );
    return response.data;
  },

  // Check if user has required account type
  checkAccountType: async (
    accountType: 'ds' | 'sb' | 'ibs'
  ): Promise<boolean> => {
    try {
      const response = await api.get(
        `/self-accounts?accountType=${accountType}`
      );
      return response.status === 200;
    } catch (error) {
      console.error('Error checking account type:', error);
      return false;
    }
  },

  // Get available interest rates
  getInterestRateOptions: async (): Promise<InterestRateOption[]> => {
    const response = await api.get<InterestRateOption[]>(
      '/interest-savings/rate-options'
    );
    return response.data;
  },
};

export default packagesApi;
