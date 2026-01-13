import { supabaseAdmin } from '../../../../config/supabase';
import { User } from '../types';

export class UserService {
  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async createUser(user: Partial<User>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(user)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ ...user, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async upsertUser(user: Partial<User>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert(user, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return !user;
  }
}

export default new UserService();
