import { apiClient } from './client';

export const developerProfilesApi = {
  listPublic: async () => apiClient.get('/developer-profiles/public'),

  getBySlug: async (slug: string) => apiClient.get(`/developer-profiles/public/${slug}`),

  startConversation: async (
    slug: string,
    body: { email?: string; name?: string; message: string; subject?: string }
  ) => apiClient.post(`/developer-profiles/public/${slug}/conversations`, body, { authMode: 'user-only' }),

  listConversations: async () =>
    apiClient.get('/developer-profiles/conversations', { authMode: 'user-only' }),

  listMessages: async (conversationId: number) =>
    apiClient.get(`/developer-profiles/conversations/${conversationId}/messages`, { authMode: 'user-only' }),

  reply: async (conversationId: number, message: string) =>
    apiClient.post(
      `/developer-profiles/conversations/${conversationId}/messages`,
      { message },
      { authMode: 'user-only' }
    ),

  getMyProfile: async () => apiClient.get('/developer-profiles/me', { authMode: 'user-only' }),

  updateMyProfile: async (patch: Record<string, unknown>) =>
    apiClient.put('/developer-profiles/me', patch, { authMode: 'user-only' }),

  adminList: async () => apiClient.get('/developer-profiles/admin/all'),

  adminAssign: async (body: {
    slug: string;
    user_email: string;
    user_id?: string;
    name: string;
    role?: string;
  }) => apiClient.post('/developer-profiles/admin/assign', body),

  submitApplication: async (body: Record<string, unknown>) =>
    apiClient.post('/developer-profiles/applications', body, { authMode: 'user-only' }),

  adminListApplications: async () => apiClient.get('/developer-profiles/admin/applications'),

  adminReviewApplication: async (id: number, approved: boolean, slug?: string) =>
    apiClient.post(`/developer-profiles/admin/applications/${id}/review`, { approved, slug }),
};
