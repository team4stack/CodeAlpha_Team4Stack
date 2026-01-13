import { supabaseAdmin } from '../../../config/supabase';
import { AdminUser, AuditLog, User } from '../types';

export class SuperAdminService {
  // Admin Users
  async getAdminUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createAdminUser(admin: Partial<AdminUser>): Promise<AdminUser> {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .insert(admin)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateAdminUser(id: number, admin: Partial<AdminUser>): Promise<AdminUser> {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .update({ ...admin, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteAdminUser(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('admin_users').delete().eq('id', id);
    if (error) throw error;
  }

  async checkAdminByEmail(email: string): Promise<AdminUser | null> {
    const { data, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  // Audit Logs
  async getAuditLogs(filters?: {
    user_id?: string;
    action?: string;
    table_name?: string;
  }): Promise<AuditLog[]> {
    let query = supabaseAdmin.from('audit_logs').select('*');
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.action) query = query.eq('action', filters.action);
    if (filters?.table_name) query = query.eq('table_name', filters.table_name);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createAuditLog(log: Partial<AuditLog>): Promise<AuditLog> {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .insert(log)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Users Management
  async getUsers(filters?: { is_blocked?: boolean }): Promise<User[]> {
    let query = supabaseAdmin.from('users').select('*');
    if (filters?.is_blocked !== undefined) {
      query = query.eq('is_blocked', filters.is_blocked);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
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

  async blockUser(id: string): Promise<User> {
    return this.updateUser(id, { is_blocked: true });
  }

  async unblockUser(id: string): Promise<User> {
    return this.updateUser(id, { is_blocked: false });
  }

  async deleteUser(id: string): Promise<void> {
    // Store user info before deletion
    const user = await this.getUserById(id);
    if (user) {
      await supabaseAdmin.from('deleted_accounts').insert({
        user_id: id,
        email: user.email
      });
    }

    const { error } = await supabaseAdmin.from('users').delete().eq('id', id);
    if (error) throw error;
  }
}

export default new SuperAdminService();
