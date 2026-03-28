// SuperAdmin API endpoints
import apiClient from './client';

type ApiResponse<T = unknown> = { success: boolean; data?: T; error?: string };
type AdminPayload = Record<string, unknown>;
type AuditLogPayload = Record<string, unknown>;
type UserUpdatePayload = Record<string, unknown>;

const ADMIN_CHECK_TTL_MS = 30_000;
const adminCheckCache = new Map<string, { ts: number; promise: Promise<ApiResponse> }>();

export const superadminApi = {
  // Admin Users
  getAdminUsers: async () => {
    return apiClient.get('/superadmin/admins');
  },

  checkAdminByEmail: async (email: string) => {
    const key = String(email || '').trim().toLowerCase();
    const now = Date.now();
    const cached = adminCheckCache.get(key);
    if (cached && now - cached.ts < ADMIN_CHECK_TTL_MS) {
      return cached.promise;
    }
    const promise = apiClient.get(`/superadmin/admins/check/${encodeURIComponent(key)}`);
    adminCheckCache.set(key, { ts: now, promise });
    try {
      return await promise;
    } catch (err) {
      adminCheckCache.delete(key);
      throw err;
    }
  },

  createAdminUser: async (admin: AdminPayload) => {
    return apiClient.post('/superadmin/admins', admin);
  },

  updateAdminUser: async (id: number, admin: AdminPayload) => {
    return apiClient.put(`/superadmin/admins/${id}`, admin);
  },

  deleteAdminUser: async (id: number) => {
    return apiClient.delete(`/superadmin/admins/${id}`);
  },

  verifyAdminPassword: async (email: string, password: string) => {
    return apiClient.post('/superadmin/admins/verify-password', { email, password });
  },

  changeAdminPassword: async (currentPassword: string, newPassword: string) => {
    return apiClient.post('/superadmin/admins/change-password', { currentPassword, newPassword });
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

  createAuditLog: async (log: AuditLogPayload) => {
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

  updateUser: async (id: string, user: UserUpdatePayload) => {
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
