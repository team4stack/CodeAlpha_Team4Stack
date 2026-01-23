// Auth API endpoints
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
    // Get session from localStorage
    const sessionStr = localStorage.getItem('auth_session');
    if (!sessionStr) {
      return { success: false, error: 'No session found' };
    }
    
    try {
      const session = JSON.parse(sessionStr);
      if (!session.access_token || !session.refresh_token) {
        return { success: false, error: 'Invalid session' };
      }
      
      // Verify session with backend
      return apiClient.post('/auth/session', { 
        accessToken: session.access_token, 
        refreshToken: session.refresh_token 
      });
    } catch (error) {
      return { success: false, error: 'Failed to parse session' };
    }
  },

  initiateOAuth: async (provider: 'google' | 'github', redirectTo: string) => {
    return apiClient.post('/auth/oauth/initiate', { provider, redirectTo });
  },
};
