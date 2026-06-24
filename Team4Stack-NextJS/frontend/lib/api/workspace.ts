import apiClient, { type ApiClientRequestInit } from './client';

type AuthMode = NonNullable<ApiClientRequestInit['authMode']>;

function opts(mode: AuthMode = 'default'): ApiClientRequestInit {
  return { authMode: mode };
}

export const workspaceApi = {
  listProjects: (authMode: AuthMode = 'default') =>
    apiClient.get('/workspace/projects', opts(authMode)),

  getProject: (id: number, authMode: AuthMode = 'default') =>
    apiClient.get(`/workspace/projects/${id}`, opts(authMode)),

  createProject: (payload: Record<string, unknown>) =>
    apiClient.post('/workspace/projects', payload),

  updateProject: (id: number, payload: Record<string, unknown>) =>
    apiClient.put(`/workspace/projects/${id}`, payload),

  addStaff: (projectId: number, payload: Record<string, unknown>) =>
    apiClient.post(`/workspace/projects/${projectId}/staff`, payload),

  removeStaff: (projectId: number, staffId: number) =>
    apiClient.delete(`/workspace/projects/${projectId}/staff/${staffId}`),

  listTasks: (projectId: number, authMode: AuthMode = 'default') =>
    apiClient.get(`/workspace/projects/${projectId}/tasks`, opts(authMode)),

  listMyTasks: (authMode: AuthMode = 'user-only') =>
    apiClient.get('/workspace/tasks/mine', opts(authMode)),

  createTask: (projectId: number, payload: Record<string, unknown>) =>
    apiClient.post(`/workspace/projects/${projectId}/tasks`, payload),

  updateTask: (taskId: number, payload: Record<string, unknown>, authMode: AuthMode = 'default') =>
    apiClient.patch(`/workspace/tasks/${taskId}`, payload, opts(authMode)),

  listMessages: (projectId: number, authMode: AuthMode = 'default') =>
    apiClient.get(`/workspace/projects/${projectId}/messages`, opts(authMode)),

  sendMessage: (projectId: number, payload: Record<string, unknown>, authMode: AuthMode = 'default') =>
    apiClient.post(`/workspace/projects/${projectId}/messages`, payload, opts(authMode)),

  listActivity: (projectId: number, authMode: AuthMode = 'default') =>
    apiClient.get(`/workspace/projects/${projectId}/activity`, opts(authMode)),

  listMilestones: (projectId: number, authMode: AuthMode = 'default') =>
    apiClient.get(`/workspace/projects/${projectId}/milestones`, opts(authMode)),

  createMilestone: (projectId: number, payload: Record<string, unknown>) =>
    apiClient.post(`/workspace/projects/${projectId}/milestones`, payload),

  updateMilestone: (milestoneId: number, payload: Record<string, unknown>, authMode: AuthMode = 'default') =>
    apiClient.patch(`/workspace/milestones/${milestoneId}`, payload, opts(authMode)),

  respondMilestone: (milestoneId: number, approved: boolean) =>
    apiClient.post(`/workspace/milestones/${milestoneId}/respond`, { approved }, opts('user-only')),

  listDeliverables: (projectId: number, authMode: AuthMode = 'default') =>
    apiClient.get(`/workspace/projects/${projectId}/deliverables`, opts(authMode)),

  createDeliverable: (projectId: number, payload: Record<string, unknown>) =>
    apiClient.post(`/workspace/projects/${projectId}/deliverables`, payload),

  updateDeliverable: (deliverableId: number, payload: Record<string, unknown>) =>
    apiClient.patch(`/workspace/deliverables/${deliverableId}`, payload),

  listNotifications: () => apiClient.get('/workspace/notifications', opts('user-only')),

  markNotificationRead: (id: number) =>
    apiClient.patch(`/workspace/notifications/${id}/read`, {}, opts('user-only')),
};
