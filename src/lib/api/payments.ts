import api from './axios';
import axios from 'axios';

interface WithdrawalRequestParams {
  amount: number;
  bankName: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountName: string;
}

interface BankAccount {
  accountName: string;
  accountNumber: string;
  bankId?: number;
  bankCode?: string;
}

interface Bank {
  name: string;
  code: string;
  active?: boolean;
  country?: string;
  currency?: string;
  type?: string;
  id?: number;
  slug?: string;
  longcode?: string;
}

const paymentsApi = {
  /**
   * Create a withdrawal request
   * @param params Withdrawal request parameters
   * @returns Withdrawal request details
   */
  createWithdrawalRequest: async (params: WithdrawalRequestParams) => {
    const response = await api.post('/payments/withdrawal/request', params);
    return response.data;
  },

  /**
   * Get list of banks directly from Paystack API
   * @returns List of banks
   */
  getBanks: async (): Promise<Bank[]> => {
    try {
      const response = await axios.get('https://api.paystack.co/bank?currency=NGN', {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY || ''}`
        }
      });
      
      // Paystack returns data in format: { status: boolean, message: string, data: Bank[] }
      if (response.data && response.data.status && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching banks from Paystack:', error);
      throw error;
    }
  },

  /**
   * Verify bank account using Paystack API
   * @param bankCode Bank code
   * @param accountNumber Account number
   * @returns Bank account details
   */
  verifyBankAccount: async (bankCode: string, accountNumber: string): Promise<BankAccount> => {
    try {
      const response = await axios.get(
        `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY || ''}`
          }
        }
      );
      
      // Paystack returns data in format: { status: boolean, message: string, data: { account_number, account_name, bank_id } }
      if (response.data && response.data.status && response.data.data) {
        const { account_name, account_number, bank_id } = response.data.data;
        return {
          accountName: account_name,
          accountNumber: account_number,
          bankId: bank_id,
          bankCode
        };
      }
      
      throw new Error('Could not verify bank account');
    } catch (error) {
      console.error('Error verifying bank account with Paystack:', error);
      throw error;
    }
  },
};

export default paymentsApi;
