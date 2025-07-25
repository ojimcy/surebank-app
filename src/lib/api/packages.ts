import api from './axios';

// API package types and response interfaces
export interface DailySavingsPackage {
  id: string;
  accountNumber: string;
  amountPerDay: number;
  target: string;
  targetAmount: number;
  totalContribution: number;
  totalCount: number;
  totalCharge?: number;
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

export interface InitializeContributionParams {
  // Package ID is required for daily_savings and savings_buying contributions
  packageId?: string;
  amount: number;
  // Contribution type expected by the backend validation schema
  contributionType: 'daily_savings' | 'savings_buying' | 'interest_package';
  // Optional redirect/callback URLs (snake_case to match backend)
  redirect_url?: string;
  callbackUrl?: string;
  // Additional optional fields for interest_package creation
  name?: string;
  principalAmount?: number;
  lockPeriod?: number;
  earlyWithdrawalPenalty?: number;
  interestRate?: number;
}

export interface InitializeContributionResponse {
  reference: string;
  authorization_url: string;
  // Some older responses may return camelCase – include for TS safety
  authorizationUrl?: string;
  access_code: string;
}

// Generic payment status returned from /payments/status/:reference
export interface PaymentStatus {
  reference: string;
  status: 'pending' | 'success' | 'failed' | 'abandoned' | string;
  amount: number;
  packageId?: string;
  packageType?: string;
  contributionType?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface IBWithdrawalParams {
  packageId: string;
  amount: number;
  accountNumber?: string; // Required for daily savings transfer
  target?: string; // Required for daily savings transfer
}

export interface ChangeProductParams {
  newProductId: string;
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
console.log('all', dsResponse);

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

  // initialize contributions
  initializeContribution: async (
    data: InitializeContributionParams
  ): Promise<InitializeContributionResponse & { [key: string]: unknown }> => {
    const response = await api.post(
      '/payments/init-contribution',
      data
    );

    // Some endpoints may wrap the actual payload inside a `data` field.
    // Normalize so callers always receive the raw initialization object.
    const payload = response.data && typeof response.data === 'object' && 'data' in response.data
      ? (response.data as { data: unknown }).data
      : response.data;

    return payload as InitializeContributionResponse & { [key: string]: unknown };
  },

  // Get payment status by reference
  checkPaymentStatus: async (reference: string): Promise<PaymentStatus> => {
    const response = await api.get<PaymentStatus>(`/payments/status/${reference}`);
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

  // Request withdrawal from an Interest-Based package
  requestIBWithdrawal: async (
    data: IBWithdrawalParams
  ): Promise<{ message: string }> => {
    const { packageId, amount } = data;
    const response = await api.post<{ message: string }>(
      `/interest-savings/package/${packageId}/request-withdrawal`,
      { amount }
    );
    return response.data;
  },

  // Get IB package by payment reference
  getIBPackageByReference: async (reference: string): Promise<IBPackage> => {
    const response = await api.get<IBPackage>(
      `/interest-savings/package/reference?reference=${reference}`
    );
    return response.data;
  },

  // Get SB package by ID
  getSBPackageById: async (packageId: string): Promise<SBPackage> => {
    const response = await api.get<SBPackage>(
      `/daily-savings/sb/package/${packageId}`
    );
    return response.data;
  },

  // Merge packages
  mergePackages: async (fromPackageId: string, toPackageId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      `/daily-savings/sb/package/merge`,
      { fromPackageId, toPackageId }
    );
    return response.data;
  },

  // Withdraw from package (transfer from package to available balance)
  withdrawFromPackage: async (data: IBWithdrawalParams, packageType: string): Promise<{ message: string }> => {
    if (packageType === 'ds') {
      // For daily savings, use the transfer endpoint which moves funds from package to available balance
      if (!data.accountNumber || !data.target) {
        throw new Error('Account number and target are required for daily savings withdrawal');
      }
      const response = await api.post<{ message: string }>(
        `/daily-savings/transfer?packageId=${data.packageId}`,
        { 
          amount: data.amount,
          accountNumber: data.accountNumber,
          target: data.target
        }
      );
      return response.data;
    } else {
      // For Interest-Based packages, use the request withdrawal endpoint
      const response = await api.post<{ message: string }>(
        `/interest-savings/package/${data.packageId}/request-withdrawal`,
        { amount: data.amount }
      );
      return response.data;
    }
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

  // Change product for SB package
  changeProduct: async (packageId: string, data: ChangeProductParams): Promise<{ message: string }> => {
    const response = await api.patch<{ message: string }>(
      `/daily-savings/sb/package/${packageId}`,
      data
    );
    return response.data;
  },

  // Edit daily savings package
  editDailySavingsPackage: async (packageId: string, data: { target: string; amountPerDay: number }): Promise<DailySavingsPackage> => {
    const response = await api.patch<DailySavingsPackage>(
      `/daily-savings/package/${packageId}`,
      data
    );
    return response.data;
  },

};

export default packagesApi;
