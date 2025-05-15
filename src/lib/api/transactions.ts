import api from './axios';

export interface TransactionResponse {
  transactions: Transaction[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface Transaction {
  id: string;
  userId: string;
  accountNumber: string;
  amount: number;
  bankAccountNumber?: number;
  bankName?: string;
  bankCode?: string;
  status?: string;
  isEarlyWithdrawal?: boolean;
  narration: string;
  branchId: string;
  direction: 'inflow' | 'outflow';
  date: number;
  penaltyAmount: number;
  packageId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  startDate?: number;
  endDate?: number;
  direction?: 'inflow' | 'outflow';
  page?: number;
  limit?: number;
}

const transactionsApi = {
  /**
   * Get user transactions
   * @param filters Optional filters for transactions (page, limit, date range, direction)
   * @returns Transactions response
   */
  getUserTransactions: async (filters: TransactionFilters = {}): Promise<TransactionResponse> => {
    const { page = 1, limit = 20, startDate, endDate, direction } = filters;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (startDate) params.append('startDate', startDate.toString());
    if (endDate) params.append('endDate', endDate.toString());
    if (direction) params.append('direction', direction);
    
    const response = await api.get(`/transactions/self?${params.toString()}`);
    return response.data;
  },
};

export default transactionsApi;
