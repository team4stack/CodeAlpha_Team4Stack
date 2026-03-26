// Landing API endpoints
import apiClient from './client';
import { cachedPublicGet } from '@/lib/performance/functionalExperienceCache';

export const landingApi = {
  // Reviews
  getReviews: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiClient.get(`/landing/reviews${query}`);
  },

  createReview: async (review: any) => {
    return apiClient.post('/landing/reviews', review);
  },

  updateReview: async (id: number, review: any) => {
    return apiClient.put(`/landing/reviews/${id}`, review);
  },

  deleteReview: async (id: number) => {
    return apiClient.delete(`/landing/reviews/${id}`);
  },

  // Projects
  getProjects: async () => {
    return cachedPublicGet('landing:projects', 2.5 * 60 * 1000, () => apiClient.get('/landing/projects'));
  },

  getProject: async (id: number) => {
    return apiClient.get(`/landing/projects/${id}`);
  },

  createProject: async (project: any) => {
    return apiClient.post('/landing/projects', project);
  },

  updateProject: async (id: number, project: any) => {
    return apiClient.put(`/landing/projects/${id}`, project);
  },

  deleteProject: async (id: number) => {
    return apiClient.delete(`/landing/projects/${id}`);
  },

  // Services
  getServices: async () => {
    return cachedPublicGet('landing:services', 2.5 * 60 * 1000, () => apiClient.get('/landing/services'));
  },

  createService: async (service: any) => {
    return apiClient.post('/landing/services', service);
  },

  updateService: async (id: number, service: any) => {
    return apiClient.put(`/landing/services/${id}`, service);
  },

  deleteService: async (id: number) => {
    return apiClient.delete(`/landing/services/${id}`);
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
    return apiClient.post('/landing/settings', { key, value });
  },

  upsertSiteSettings: async (entries: Array<{ key: string; value: string }>) => {
    return apiClient.post('/landing/settings/bulk', { entries });
  },

  deleteSiteSettings: async (keys: string[]) => {
    return apiClient.delete(`/landing/settings?keys=${keys.join(',')}`);
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
