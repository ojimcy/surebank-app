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
  id?: string; // Alternative ID field for compatibility
  name: string;
  userId: string;
  principalAmount: number;
  interestRate: number;
  lockPeriod: number;
  compoundingFrequency: string;
  status: string;
  maturityDate: string;
  interestAccrued: number;
  createdAt: string;
  updatedAt: string;
  // Additional properties needed for UI compatibility
  accountNumber?: string;
  targetAmount?: number;
  totalContribution?: number;
  startDate?: string;
  endDate?: string;
  currentBalance?: number;
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

export interface InitiateIBPackageParams {
  name: string;
  principalAmount: number;
  interestRate: number;
  lockPeriod: number;
  compoundingFrequency?: string;
}

export interface CreateIBPackageParams extends InitiateIBPackageParams {
  paymentReference: string;
}

export interface InitiateIBPackageResponse {
  reference: string;
  authorization_url: string;
  access_code: string;
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
    const response = await api.get<IBPackage[]>(
      `/interest-savings/package`
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

  // Initiate payment for Interest-Based package
  initiateIBPackagePayment: async (
    data: InitiateIBPackageParams
  ): Promise<InitiateIBPackageResponse> => {
    const response = await api.post<InitiateIBPackageResponse>(
      '/interest-package/package/initiate-payment',
      data
    );
    return response.data;
  },

  // Create a new Interest-Based package
  createIBPackage: async (data: CreateIBPackageParams): Promise<IBPackage> => {
    const response = await api.post<IBPackage>(
      '/interest-package/package',
      data
    );
    return response.data;
  },

  // Check if user has required account type
  checkAccountType: async (accountType: 'ds' | 'sb'): Promise<boolean> => {
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
};

export default packagesApi;
