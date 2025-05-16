import api from './axios';

// Interface for branch data
export interface Branch {
  _id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  phoneNumber?: string;
  email?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface for paginated branch API response
interface PaginatedBranchResponse {
  results: Branch[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const branchesApi = {
  // Get all branches
  getBranches: async (): Promise<Branch[]> => {
    try {
      const response = await api.get<PaginatedBranchResponse>('/branch');
      // Check if the response has the results array
      if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      // If the response doesn't match the expected structure, log and return empty array
      console.warn('Unexpected branch API response structure:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching branches:', error);
      return [];
    }
  },

  // Get a specific branch by ID
  getBranch: async (branchId: string): Promise<Branch | null> => {
    try {
      const response = await api.get<Branch>(`/branch/${branchId}`);
      if (response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching branch ${branchId}:`, error);
      return null;
    }
  }
};

export default branchesApi;
