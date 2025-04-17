import api from './axios';
import { AxiosError } from 'axios';

export interface AccountType {
  ds: 'Daily savings account';
  sb: 'Surebank account';
  ibs: 'Investment banking services account';
}

export interface Account {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  accountNumber: string;
  availableBalance: number;
  ledgerBalance: number;
  accountType: 'ds' | 'sb' | 'ibs';
  createdBy: string;
  branchId: {
    _id: string;
    name: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  paystackCustomerId: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all accounts for the authenticated user
 */
export const getUserAccounts = async (): Promise<Account[]> => {
  try {
    // The API should extract userId from the JWT token
    const response = await api.get('/self-accounts/all');
    // If response is a single account, wrap it in an array
    return Array.isArray(response.data) ? response.data : [response.data];
  } catch (error) {
    // Return empty array if 404 (user has no accounts)
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return [];
    }
    throw error;
  }
};

/**
 * Get a specific account by type for the authenticated user
 */
export const getUserAccountByType = async (
  accountType: 'ds' | 'sb' | 'ibs',
  abortSignal?: AbortSignal
): Promise<Account | null> => {
  try {
    // The API should extract userId from the JWT token
    const response = await api.get(
      `/self-accounts?accountType=${accountType}`,
      {
        signal: abortSignal,
      }
    );
    return response.data;
  } catch (error) {
    // If the request was aborted, handle it quietly
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }

    // Return null if 404 (user has no account of this type)
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Create a new account for the authenticated user
 */
export const createAccount = async (
  accountType: 'ds' | 'sb' | 'ibs'
): Promise<Account> => {
  // The API should extract userId from the JWT token
  const response = await api.post('/self-accounts', { accountType });
  return response.data;
};

export const ACCOUNT_TYPE_DISPLAY: Record<string, string> = {
  ds: 'DS',
  sb: 'SB',
  ibs: 'IBS',
};
