// Team API endpoints
import apiClient from './client';
import { cachedPublicGet } from '@/lib/performance/functionalExperienceCache';

export const teamApi = {
  // Team Members
  getTeamMembers: async () => {
    return cachedPublicGet('team:members', 2.5 * 60 * 1000, () => apiClient.get('/team/members'));
  },

  createTeamMember: async (member: any) => {
    return apiClient.post('/team/members', member);
  },

  updateTeamMember: async (id: number, member: any) => {
    return apiClient.put(`/team/members/${id}`, member);
  },

  deleteTeamMember: async (id: number) => {
    return apiClient.delete(`/team/members/${id}`);
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
