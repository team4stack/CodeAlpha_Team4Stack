import { supabaseAdmin } from '../../../config/supabase';
import { pickAllowedKeys, updateByIdWithTimestampRetry } from '../../../shared/utils/supabaseAdminWrite';
import { TeamMember, MentorProfile } from '../types';

const TEAM_MEMBER_KEYS = [
  'name',
  'role_text',
  'image_url',
  'is_head',
  'profile_image_url',
  'banner_image_url',
  'portfolio_url',
  'github_url',
  'primary_tag',
  'order_index',
  'active'
] as const;

const MENTOR_KEYS = [
  'name',
  'role_text',
  'image_url',
  'profile_image_url',
  'banner_image_url',
  'portfolio_url',
  'github_url',
  'primary_tag',
  'order_index',
  'active'
] as const;

export class TeamService {
  async getTeamMembers(): Promise<TeamMember[]> {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })
      .order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createTeamMember(member: Partial<TeamMember>): Promise<TeamMember> {
    const insert = pickAllowedKeys(member, TEAM_MEMBER_KEYS);
    const { data, error } = await supabaseAdmin.from('team_members').insert(insert).select().single();
    if (error) throw error;
    return data;
  }

  async updateTeamMember(id: number, member: Partial<TeamMember>): Promise<TeamMember> {
    const patch = pickAllowedKeys(member, TEAM_MEMBER_KEYS);
    const row = await updateByIdWithTimestampRetry('team_members', id, patch, {
      notFoundMessage: 'Team member not found'
    });
    return row as unknown as TeamMember;
  }

  async deleteTeamMember(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('team_members').delete().eq('id', id);
    if (error) throw error;
  }

  async getMentorProfiles(): Promise<MentorProfile[]> {
    const { data, error } = await supabaseAdmin
      .from('mentor_profiles')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })
      .order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createMentorProfile(mentor: Partial<MentorProfile>): Promise<MentorProfile> {
    const insert = pickAllowedKeys(mentor, MENTOR_KEYS);
    const { data, error } = await supabaseAdmin.from('mentor_profiles').insert(insert).select().single();
    if (error) throw error;
    return data;
  }

  async updateMentorProfile(id: number, mentor: Partial<MentorProfile>): Promise<MentorProfile> {
    const patch = pickAllowedKeys(mentor, MENTOR_KEYS);
    const row = await updateByIdWithTimestampRetry('mentor_profiles', id, patch, {
      notFoundMessage: 'Mentor profile not found'
    });
    return row as unknown as MentorProfile;
  }

  async deleteMentorProfile(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('mentor_profiles').delete().eq('id', id);
    if (error) throw error;
  }
}

export default new TeamService();
