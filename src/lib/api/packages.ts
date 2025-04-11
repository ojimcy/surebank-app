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
  id: string;
  accountNumber: string;
  targetAmount: number;
  totalContribution: number;
  status: string;
  startDate: string;
  endDate?: string;
  interestRate: number;
  maturityDate: string;
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

  // TODO: Implement Interest-Based packages
  // Get Interest-Based packages for a user
  //   getIBPackages: async (userId: string): Promise<IBPackage[]> => {
  //     const response = await api.get<IBPackage[]>(
  //       `/daily-savings/ib/package?userId=${userId}`
  //     );
  //     return response.data;
  //   },

  // Get all package types for a user
  getAllPackages: async (
    userId: string
  ): Promise<{
    dailySavings: DailySavingsPackage[];
    sbPackages: SBPackage[];
    ibPackages: IBPackage[];
  }> => {
    const [dsResponse, sbResponse] = await Promise.all([
      packagesApi.getDailySavings(userId),
      packagesApi.getSBPackages(userId),
    ]);

    return {
      dailySavings: dsResponse,
      sbPackages: sbResponse,
      ibPackages: [],
    };
  },
};

export default packagesApi;
