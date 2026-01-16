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
    // Ensure email is lowercase and trimmed
    if (user.email) {
      user.email = user.email.toLowerCase().trim();
    }
    
    // Check if user exists by email first
    let existingUser: User | null = null;
    if (user.email) {
      existingUser = await this.getUserByEmail(user.email);
    }
    
    if (existingUser) {
      // Update existing user
      return await this.updateUser(existingUser.id, user);
    } else {
      // Create new user
      return await this.createUser(user);
    }
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    return !user;
  }
}

export default new UserService();
