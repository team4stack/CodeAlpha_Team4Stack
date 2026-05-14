// Landing API endpoints
import apiClient from './client';
import {
  cachedPublicGet,
  clearCachedPublicGet,
} from '@/lib/performance/functionalExperienceCache';

export const landingApi = {
  // Reviews
  getReviews: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    // Cache approved reviews to prevent repeated network work on navigation/remount.
    const cacheKey = `landing:reviews:${status ?? 'all'}`;
    return cachedPublicGet(cacheKey, 60 * 1000, () => apiClient.get(`/landing/reviews${query}`));
  },

  createReview: async (review: any) => {
    // Public form: `/api/public/landing/reviews` — no landing-admin gate; do not send admin_session.
    const res = await apiClient.post('/public/landing/reviews', review, { authMode: 'user-only' });
    // New reviews may change the approved list after moderation; keep UI responsive by invalidating.
    clearCachedPublicGet('landing:reviews:approved');
    clearCachedPublicGet('landing:reviews:all');
    return res;
  },

  updateReview: async (id: number, review: any) => {
    const res = await apiClient.put(`/landing/reviews/${id}`, review);
    clearCachedPublicGet('landing:reviews:approved');
    clearCachedPublicGet('landing:reviews:all');
    return res;
  },

  deleteReview: async (id: number) => {
    const res = await apiClient.delete(`/landing/reviews/${id}`);
    clearCachedPublicGet('landing:reviews:approved');
    clearCachedPublicGet('landing:reviews:all');
    return res;
  },

  // Projects
  getProjects: async () => {
    return cachedPublicGet('landing:projects', 2.5 * 60 * 1000, () => apiClient.get('/landing/projects'));
  },

  getProject: async (id: number) => {
    return apiClient.get(`/landing/projects/${id}`);
  },

  createProject: async (project: any) => {
    const res = await apiClient.post('/landing/projects', project);
    clearCachedPublicGet('landing:projects');
    return res;
  },

  updateProject: async (id: number, project: any) => {
    const res = await apiClient.put(`/landing/projects/${id}`, project);
    clearCachedPublicGet('landing:projects');
    return res;
  },

  deleteProject: async (id: number) => {
    const res = await apiClient.delete(`/landing/projects/${id}`);
    clearCachedPublicGet('landing:projects');
    return res;
  },

  // Services
  getServices: async () => {
    return cachedPublicGet('landing:services', 2.5 * 60 * 1000, () => apiClient.get('/landing/services'));
  },

  createService: async (service: any) => {
    const res = await apiClient.post('/landing/services', service);
    clearCachedPublicGet('landing:services');
    return res;
  },

  updateService: async (id: number, service: any) => {
    const res = await apiClient.put(`/landing/services/${id}`, service);
    clearCachedPublicGet('landing:services');
    return res;
  },

  deleteService: async (id: number) => {
    const res = await apiClient.delete(`/landing/services/${id}`);
    clearCachedPublicGet('landing:services');
    return res;
  },

  // Site Settings
  getSiteSettings: async (keys?: string[]) => {
    const query = keys && keys.length > 0 ? `?keys=${keys.join(',')}` : '';
    const sorted = keys?.length ? [...keys].sort().join(',') : 'all';
    return cachedPublicGet(`landing:settings:${sorted}`, 3 * 60 * 1000, () =>
      apiClient.get(`/landing/settings${query}`)
    );
  },

  upsertSiteSetting: async (key: string, value: string) => {
    const res = await apiClient.post('/landing/settings', { key, value });
    clearCachedPublicGet('landing:settings:all');
    clearCachedPublicGet(`landing:settings:${key}`);
    return res;
  },

  upsertSiteSettings: async (entries: Array<{ key: string; value: string }>) => {
    const res = await apiClient.post('/landing/settings/bulk', { entries });
    clearCachedPublicGet('landing:settings:all');
    return res;
  },

  deleteSiteSettings: async (keys: string[]) => {
    const res = await apiClient.delete(`/landing/settings?keys=${keys.join(',')}`);
    clearCachedPublicGet('landing:settings:all');
    keys.forEach((k) => clearCachedPublicGet(`landing:settings:${k}`));
    return res;
  },

  // Support Requests
  getSupportRequests: async (filters?: { user_id?: string; status?: string; viewed?: boolean; target_area?: 'site' | 'course' }) => {
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.viewed !== undefined) params.append('viewed', String(filters.viewed));
    if (filters?.target_area) params.append('target_area', filters.target_area);
    
    const query = params.toString();
    return apiClient.get(`/landing/support${query ? `?${query}` : ''}`);
  },

  createSupportRequest: async (request: any) => {
    return apiClient.post('/landing/support', request);
  },

  uploadSupportScreenshot: async (fileDataUrl: string) => {
    return apiClient.post('/public/uploads/cloudinary', {
      fileDataUrl,
      folder: 'team4stack/support-screenshots'
    });
  },

  updateSupportRequest: async (id: number, request: any) => {
    return apiClient.put(`/landing/support/${id}`, request);
  },
};
