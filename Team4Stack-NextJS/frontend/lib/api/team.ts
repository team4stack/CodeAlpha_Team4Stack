// Team API endpoints
import apiClient from './client';
import { cachedPublicGet, clearCachedPublicGet } from '@/lib/performance/functionalExperienceCache';

const TEAM_MEMBERS_CACHE_KEY = 'team:members:v2';

function invalidateTeamMembersCache() {
  clearCachedPublicGet(TEAM_MEMBERS_CACHE_KEY);
  clearCachedPublicGet('team:members');
}

export const teamApi = {
  // Team Members
  getTeamMembers: async () => {
    return cachedPublicGet(TEAM_MEMBERS_CACHE_KEY, 2.5 * 60 * 1000, () => apiClient.get('/team/members'));
  },

  createTeamMember: async (member: any) => {
    const res = await apiClient.post('/team/members', member);
    invalidateTeamMembersCache();
    return res;
  },

  updateTeamMember: async (id: number, member: any) => {
    const res = await apiClient.put(`/team/members/${id}`, member);
    invalidateTeamMembersCache();
    return res;
  },

  deleteTeamMember: async (id: number) => {
    const res = await apiClient.delete(`/team/members/${id}`);
    invalidateTeamMembersCache();
    return res;
  },

  // Mentor Profiles
  getMentorProfiles: async () => {
    return cachedPublicGet('team:mentors', 2.5 * 60 * 1000, () => apiClient.get('/team/mentors'));
  },

  createMentorProfile: async (mentor: any) => {
    return apiClient.post('/team/mentors', mentor);
  },

  updateMentorProfile: async (id: number, mentor: any) => {
    return apiClient.put(`/team/mentors/${id}`, mentor);
  },

  deleteMentorProfile: async (id: number) => {
    return apiClient.delete(`/team/mentors/${id}`);
  },
};
