import api from './axios';

// API package types and response interfaces
export interface DailySavingsPackage {
  id: string;
  accountNumber: string;
  amountPerDay: number;
  target: string;
  targetAmount: number;
  totalContribution: number;
  totalCount?: number;
  status: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
  endDate?: string;
}

export interface SBPackage {
  _id: string;
  id: string;
  accountNumber: string;
  targetAmount: number;
  totalContribution: number;
  status: string;
  startDate: string;
  endDate?: string;
  product?: {
    id: string;
    name: string;
    description?: string;
    costPrice?: number;
    sellingPrice?: number;
    discount?: number;
    quantity?: number;
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
  redirectUrl?: string;
  callbackUrl?: string;
}

export interface CreateIBSPackageParams extends InitiateIBSPackageParams {
  paymentReference: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  paymentData?: Record<string, unknown>;
  principalAmount?: number;
  interestRate?: number;
  lockPeriod?: number;
}

// Interface for initializing a contribution through Paystack (updated for unified API)
export interface InitiateContributionParams {
  packageId: string;
  amount: number;
  packageType: 'ds' | 'sb';
  redirect_url?: string;
}

// New unified payment request interface
export interface UnifiedPaymentRequest {
  contributionType: 'daily_savings' | 'savings_buying' | 'interest_package';
  packageId?: string;
  amount: number;
  // Interest package specific fields
  name?: string;
  principalAmount?: number;
  lockPeriod?: number;
  earlyWithdrawalPenalty?: number;
  interestRate?: number;
  // Optional fields for all contribution types
  callbackUrl?: string;
  redirect_url?: string;
}

// Interface for withdrawal request
export interface WithdrawalParams {
  packageId: string;
  amount: number;
  target?: string;
  accountNumber?: string;
  product?: string;
}

// Interface for package contributions
export interface PackageContribution {
  paymentMethod: string;
  amount: number;
  accountNumber: string;
  packageId: string;
  count: number;
  totalCount: number;
  date: number;
  narration: string;
  paystackReference: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}

// Package change product interface
export interface ChangeProductParams {
  newProductId: string;
}

// Add payment status interface
export interface PaymentStatus {
  reference: string;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  amount: number;
  packageId?: string;
  packageType?: 'ds' | 'sb' | 'ibs';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
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

  // Get SureBank package by ID
  getSBPackageById: async (id: string): Promise<SBPackage> => {
    const response = await api.get<SBPackage>(
      `/daily-savings/sb/package/${id}`
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

  // Initiate payment for an Interest-Based Savings package (updated for unified API)
  initiateIBSPackagePayment: async (
    data: InitiateIBSPackageParams
  ): Promise<InitiatePaymentResponse> => {
    const unifiedPayload: UnifiedPaymentRequest = {
      contributionType: 'interest_package',
      amount: data.principalAmount,
      name: data.name,
      principalAmount: data.principalAmount,
      lockPeriod: data.lockPeriod,
      earlyWithdrawalPenalty: data.earlyWithdrawalPenalty,
      // Include optional fields if provided
      ...(data.interestRate && { interestRate: data.interestRate }),
      ...(data.callbackUrl && { callbackUrl: data.callbackUrl }),
      ...(data.redirectUrl && { redirect_url: data.redirectUrl }),
    };

    const response = await api.post<InitiatePaymentResponse>(
      '/payments/init-contribution',
      unifiedPayload
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

  // Initialize a contribution payment (updated for unified API)
  initializeContribution: async (
    data: InitiateContributionParams
  ): Promise<InitiatePaymentResponse> => {
    // Map package type to contribution type
    const contributionType = data.packageType === 'ds' ? 'daily_savings' : 'savings_buying';

    const unifiedPayload: UnifiedPaymentRequest = {
      contributionType,
      packageId: data.packageId,
      amount: data.amount,
      // Include redirect_url if provided
      ...(data.redirect_url && { redirect_url: data.redirect_url }),
    };

    const response = await api.post<InitiatePaymentResponse>(
      '/payments/init-contribution',
      unifiedPayload
    );
    return response.data;
  },

  // Process a withdrawal from a package
  withdrawFromPackage: async (data: WithdrawalParams, packageType: 'ds' | 'sb'): Promise<{ success: boolean; message: string }> => {
    let endpoint = '';
    let payload = {};
    
    if (packageType === 'ds') {
      // Daily Savings withdrawal
      endpoint = `/daily-savings/withdraw/?packageId=${data.packageId}`;
      payload = {
        target: data.target,
        accountNumber: data.accountNumber,
        amount: data.amount
      };
    } else {
      // SB Package withdrawal
      endpoint = `/daily-savings/sb/withdraw/?packageId=${data.packageId}`;
      payload = {
        product: data.target, // Using target as product ID
        accountNumber: data.accountNumber,
        amount: data.amount
      };
    }
    console.log('payload', payload);
    const response = await api.post(endpoint, payload);
    return response.data;
  },

  // Get contributions for a package
  getPackageContributions: async (packageId: string, limit?: number): Promise<PackageContribution[]> => {
    const endpoint = `/payments/packages/${packageId}/contributions`;
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get<PackageContribution[]>(`${endpoint}${params}`);
    return response.data;
  },
  
  // Change product for an SB package
  changeProduct: async (packageId: string, data: ChangeProductParams): Promise<SBPackage> => {
    const response = await api.patch<SBPackage>(
      `/daily-savings/sb/package/${packageId}`,
      data
    );
    return response.data;
  },

  // Merge SB packages
  mergePackages: async (packageFromId: string, packageToId: string): Promise<SBPackage> => {
    const response = await api.post('/daily-savings/sb/package/merge', {
      packageFromId,
      packageToId,
    });
    return response.data;
  },

  // Check payment status by reference
  checkPaymentStatus: async (reference: string): Promise<PaymentStatus> => {
    const response = await api.get<PaymentStatus>(`/payments/status/${reference}`);
    return response.data;
  },
};

export default packagesApi;
