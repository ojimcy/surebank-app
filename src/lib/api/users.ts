import api from './axios';
import { User } from './auth';

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  address?: string;
}

const usersApi = {
  // Update user profile
  updateUser: async (userId: string, data: UpdateUserPayload): Promise<User> => {
    const response = await api.patch<User>(`/users/${userId}`, data);
    return response.data;
  }
};

export default usersApi; 