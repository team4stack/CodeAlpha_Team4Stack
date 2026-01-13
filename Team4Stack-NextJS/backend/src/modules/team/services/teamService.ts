import { supabaseAdmin } from '../../../config/supabase';
import { TeamMember, MentorProfile } from '../types';

export class TeamService {
  // Team Members
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
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .insert(member)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateTeamMember(id: number, member: Partial<TeamMember>): Promise<TeamMember> {
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({ ...member, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteTeamMember(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('team_members').delete().eq('id', id);
    if (error) throw error;
  }

  // Mentor Profiles
  async getMentorProfiles(): Promise<MentorProfile[]> {
    const { data, error } = await supabaseAdmin
      .from('mentor_profile')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })
      .order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createMentorProfile(mentor: Partial<MentorProfile>): Promise<MentorProfile> {
    const { data, error } = await supabaseAdmin
      .from('mentor_profile')
      .insert(mentor)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateMentorProfile(id: number, mentor: Partial<MentorProfile>): Promise<MentorProfile> {
    const { data, error } = await supabaseAdmin
      .from('mentor_profile')
      .update({ ...mentor, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteMentorProfile(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('mentor_profile').delete().eq('id', id);
    if (error) throw error;
  }
}

export default new TeamService();
