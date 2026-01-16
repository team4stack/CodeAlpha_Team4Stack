import { supabaseAdmin } from '../../../config/supabase';
import { Review, Project, Service, SiteSetting, SupportRequest } from '../types';

export class LandingService {
  // Reviews
  async getReviews(status?: string): Promise<Review[]> {
    let query = supabaseAdmin.from('reviews').select('*');
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createReview(review: Partial<Review>): Promise<Review> {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert(review)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateReview(id: number, review: Partial<Review>): Promise<Review> {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update(review)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteReview(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('reviews').delete().eq('id', id);
    if (error) throw error;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })
      .order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(project)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ ...project, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteProject(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('projects').delete().eq('id', id);
    if (error) throw error;
  }

  // Services
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async createService(service: Partial<Service>): Promise<Service> {
    const { data, error } = await supabaseAdmin
      .from('services')
      .insert(service)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service> {
    const { data, error } = await supabaseAdmin
      .from('services')
      .update({ ...service, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteService(id: number): Promise<void> {
    const { error } = await supabaseAdmin.from('services').delete().eq('id', id);
    if (error) throw error;
  }

  // Site Settings
  async getSiteSettings(keys?: string[]): Promise<SiteSetting[]> {
    let query = supabaseAdmin.from('site_settings').select('*');
    if (keys && keys.length > 0) {
      query = query.in('key', keys);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getSiteSetting(key: string): Promise<SiteSetting | null> {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .select('*')
      .eq('key', key)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async upsertSiteSetting(key: string, value: string): Promise<SiteSetting> {
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async upsertSiteSettings(entries: Array<{ key: string; value: string }>): Promise<SiteSetting[]> {
    const settings = entries.map(entry => ({
      key: entry.key,
      value: entry.value,
      updated_at: new Date().toISOString()
    }));
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert(settings, { onConflict: 'key' })
      .select();
    if (error) throw error;
    return data || [];
  }

  async deleteSiteSettings(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    const { error } = await supabaseAdmin
      .from('site_settings')
      .delete()
      .in('key', keys);
    if (error) throw error;
  }

  // Support Requests
  async getSupportRequests(filters?: {
    user_id?: string;
    status?: string;
    viewed?: boolean;
  }): Promise<SupportRequest[]> {
    let query = supabaseAdmin.from('support_requests').select('*');
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.viewed !== undefined) query = query.eq('viewed', filters.viewed);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createSupportRequest(request: Partial<SupportRequest>): Promise<SupportRequest> {
    const { data, error } = await supabaseAdmin
      .from('support_requests')
      .insert(request)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateSupportRequest(id: number, request: Partial<SupportRequest>): Promise<SupportRequest> {
    const { data, error } = await supabaseAdmin
      .from('support_requests')
      .update({ ...request, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export default new LandingService();
