// Users API endpoints
import apiClient from './client';

export const usersApi = {
  getUserById: async (id: string) => {
    return apiClient.get(`/users/${id}`);
  },

  getUserByEmail: async (email: string) => {
    return apiClient.get(`/users/email/${email}`);
  },

  updateUser: async (id: string, user: any) => {
    return apiClient.put(`/users/${id}`, user);
  },

  upsertUser: async (user: any) => {
    return apiClient.post('/users/upsert', user);
  },

  checkUsernameAvailability: async (username: string) => {
    return apiClient.get(`/users/check-username?username=${username}`);
  },
};
