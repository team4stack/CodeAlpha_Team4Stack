// SuperAdmin API endpoints
import apiClient from './client';

export const superadminApi = {
  // Admin Users
  getAdminUsers: async () => {
    return apiClient.get('/superadmin/admins');
  },

  createAdminUser: async (admin: any) => {
    return apiClient.post('/superadmin/admins', admin);
  },

  deleteAdminUser: async (id: number) => {
    return apiClient.delete(`/superadmin/admins/${id}`);
  },

  // Audit Logs
  getAuditLogs: async (filters?: { user_id?: string; action?: string; table_name?: string }) => {
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.table_name) params.append('table_name', filters.table_name);
    
    const query = params.toString();
    return apiClient.get(`/superadmin/audit${query ? `?${query}` : ''}`);
  },

  createAuditLog: async (log: any) => {
    return apiClient.post('/superadmin/audit', log);
  },

  // Users Management
  getUsers: async (filters?: { is_blocked?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.is_blocked !== undefined) params.append('is_blocked', String(filters.is_blocked));
    
    const query = params.toString();
    return apiClient.get(`/superadmin/users${query ? `?${query}` : ''}`);
  },

  getUserById: async (id: string) => {
    return apiClient.get(`/superadmin/users/${id}`);
  },

  updateUser: async (id: string, user: any) => {
    return apiClient.put(`/superadmin/users/${id}`, user);
  },

  blockUser: async (id: string) => {
    return apiClient.post(`/superadmin/users/${id}/block`);
  },

  unblockUser: async (id: string) => {
    return apiClient.post(`/superadmin/users/${id}/unblock`);
  },

  deleteUser: async (id: string) => {
    return apiClient.delete(`/superadmin/users/${id}`);
  },
};
