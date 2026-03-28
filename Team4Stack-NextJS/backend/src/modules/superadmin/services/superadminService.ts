import { supabaseAdmin } from '../../../config/supabase';
import {
  pickAllowedKeys,
  updateByIdWithTimestampRetry,
  notFoundError,
  shouldRetryUpdateWithoutUpdatedAt
} from '../../../shared/utils/supabaseAdminWrite';
import { sanitizeUserUpdateBody } from '../../../shared/utils/sanitizeUserPatch';
import { AdminUser, AuditLog, User } from '../types';

const ADMIN_USER_WRITE_KEYS = ['email', 'role', 'password_hash'] as const;
const AUDIT_LOG_WRITE_KEYS = ['user_id', 'action', 'table_name', 'record_id', 'details'] as const;

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
    const insert = pickAllowedKeys(admin as Record<string, unknown>, ADMIN_USER_WRITE_KEYS);
    const { data, error } = await supabaseAdmin.from('admin_users').insert(insert).select().single();
    if (error) throw error;
    return data;
  }

  async updateAdminUser(id: number, admin: Partial<AdminUser>): Promise<AdminUser> {
    const patch = pickAllowedKeys(admin as Record<string, unknown>, ADMIN_USER_WRITE_KEYS);
    const row = await updateByIdWithTimestampRetry('admin_users', id, patch, {
      notFoundMessage: 'Admin user not found'
    });
    return row as unknown as AdminUser;
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

  async verifyAdminPassword(email: string, password: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Use Supabase RPC function to verify password (uses pgcrypto for secure comparison)
      const { data, error } = await supabaseAdmin.rpc('verify_admin_password', {
        p_email: email.toLowerCase().trim(),
        p_password: password
      });

      if (error) {
        return { valid: false, error: error.message || 'Failed to verify password' };
      }

      // RPC function returns { valid: true/false, error?: string }
      if (data && typeof data === 'object' && data.valid === true) {
        return { valid: true };
      }

      return { valid: false, error: (data as any)?.error || 'Invalid password' };
    } catch (error: any) {
      return { valid: false, error: error.message || 'Failed to verify password' };
    }
  }

  async updateAdminPasswordByEmail(email: string, passwordHash: string): Promise<AdminUser> {
    const normalized = email.toLowerCase().trim();
    const stamp = new Date().toISOString();
    let { data, error } = await supabaseAdmin
      .from('admin_users')
      .update({ password_hash: passwordHash, updated_at: stamp })
      .eq('email', normalized)
      .select()
      .maybeSingle();

    if (error && shouldRetryUpdateWithoutUpdatedAt(error)) {
      ({ data, error } = await supabaseAdmin
        .from('admin_users')
        .update({ password_hash: passwordHash })
        .eq('email', normalized)
        .select()
        .maybeSingle());
    }

    if (error) throw error;
    if (!data) throw notFoundError('Admin user not found');
    return data as AdminUser;
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
    const insert = pickAllowedKeys(log as Record<string, unknown>, AUDIT_LOG_WRITE_KEYS);
    const { data, error } = await supabaseAdmin.from('audit_logs').insert(insert).select().single();
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
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateUser(id: string, user: Partial<User> | Record<string, unknown>): Promise<User> {
    const patch = sanitizeUserUpdateBody(user);
    if (Object.keys(patch).length === 0) {
      const existing = await this.getUserById(id);
      if (!existing) {
        const err: Error & { status?: number } = new Error('User not found');
        err.status = 404;
        throw err;
      }
      return existing;
    }
    const stamp = new Date().toISOString();
    let { data, error } = await supabaseAdmin
      .from('users')
      .update({ ...patch, updated_at: stamp })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error && shouldRetryUpdateWithoutUpdatedAt(error)) {
      ({ data, error } = await supabaseAdmin
        .from('users')
        .update(patch)
        .eq('id', id)
        .select()
        .maybeSingle());
    }
    if (error) throw error;
    if (!data) throw notFoundError('User not found');
    return data as User;
  }

  async blockUser(id: string): Promise<User> {
    return this.updateUser(id, { is_blocked: true });
  }

  async unblockUser(id: string): Promise<User> {
    return this.updateUser(id, { is_blocked: false });
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    if (user?.email) {
      const { error: archiveError } = await supabaseAdmin.from('deleted_accounts').insert({
        user_id: id,
        email: user.email
      });
      if (archiveError && process.env.NODE_ENV === 'development') {
        console.warn('[superadmin] deleted_accounts insert skipped:', archiveError.message);
      }
    }

    const { error } = await supabaseAdmin.from('users').delete().eq('id', id);
    if (error) throw error;
  }
}

export default new SuperAdminService();
