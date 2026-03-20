// Auth API endpoints
import { parseStoredClientAuthSession } from '@/lib/security/clientAuthSession';
import apiClient from './client';

export const authApi = {
  signIn: async (email: string, password: string) => {
    return apiClient.post('/auth/signin', { email, password });
  },

  signUp: async (email: string, password: string, username?: string, name?: string) => {
    return apiClient.post('/auth/signup', { email, password, username, name });
  },

  resetPassword: async (email: string, redirectUrl?: string, pathname?: string) => {
    return apiClient.post('/auth/reset-password', { email, redirectUrl, pathname });
  },

  updatePassword: async (newPassword: string, accessToken?: string, refreshToken?: string) => {
    return apiClient.post('/auth/update-password', { newPassword, accessToken, refreshToken });
  },

  signOut: async () => {
    return apiClient.post('/auth/signout', {});
  },

  getSession: async (accessToken?: string, refreshToken?: string) => {
    return apiClient.post('/auth/session', { accessToken, refreshToken });
  },

  verifySession: async () => {
    const sessionStr = localStorage.getItem('auth_session');
    if (!sessionStr) {
      return { success: false, error: 'No session found' };
    }
    const session = parseStoredClientAuthSession(sessionStr);
    if (!session) {
      return { success: false, error: 'Invalid session' };
    }

    return apiClient.post('/auth/session', {
      accessToken: session.access_token,
      refreshToken: session.refresh_token
    });
  },

  initiateOAuth: async (provider: 'google' | 'github', redirectTo: string) => {
    return apiClient.post('/auth/oauth/initiate', { provider, redirectTo });
  },
};
