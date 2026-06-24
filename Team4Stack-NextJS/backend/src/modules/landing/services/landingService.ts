import { supabaseAdmin } from '../../../config/supabase';
import {
  updateByIdWithTimestampRetry,
  shouldRetryUpdateWithoutUpdatedAt,
  pickAllowedKeys
} from '../../../shared/utils/supabaseAdminWrite';
import { Review, Project, Service, SiteSetting, SupportRequest } from '../types';
import { validateProjectWrite } from '../utils/projectValidation';

const PROJECT_WRITE_KEYS = ['title', 'description', 'video_id', 'github_url', 'image_url', 'order_index'] as const;
const REVIEW_WRITE_KEYS = ['name', 'address', 'rating', 'comment', 'status', 'order_index'] as const;
const SERVICE_WRITE_KEYS = [
  'title',
  'description',
  'image_url',
  'emoji',
  'gradient_color',
  'contact',
  'order_index',
  'active'
] as const;
const SUPPORT_WRITE_KEYS = [
  'reason',
  'target_area',
  'email',
  'subject',
  'message',
  'screenshot_url',
  'user_id',
  'status',
  'viewed'
] as const;

function pickProjectPatch(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  const raw = body as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const k of PROJECT_WRITE_KEYS) {
    if (raw[k] !== undefined) patch[k] = raw[k];
  }
  return patch;
}


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
    const insert = pickAllowedKeys(review, REVIEW_WRITE_KEYS);
    const { data, error } = await supabaseAdmin.from('reviews').insert(insert).select().single();
    if (error) throw error;
    return data;
  }

  async updateReview(id: number, review: Partial<Review>): Promise<Review> {
    const patch = pickAllowedKeys(review, REVIEW_WRITE_KEYS);
    const row = await updateByIdWithTimestampRetry('reviews', id, patch, { notFoundMessage: 'Review not found' });
    return row as unknown as Review;
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
    const validated = validateProjectWrite(project, 'create');
    if (!validated.ok) {
      const err = new Error(validated.error) as Error & { status?: number };
      err.status = validated.statusCode;
      throw err;
    }
    const insert = pickProjectPatch({ ...project, ...validated.patch })
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(insert)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getProjectById(id: number): Promise<Project | null> {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateProject(id: number, project: Partial<Project> | Record<string, unknown>): Promise<Project> {
    const validated = validateProjectWrite(project, 'update');
    if (!validated.ok) {
      const err = new Error(validated.error) as Error & { status?: number };
      err.status = validated.statusCode;
      throw err;
    }
    const patch = pickProjectPatch({ ...project, ...validated.patch });
    const row = await updateByIdWithTimestampRetry('projects', id, patch, { notFoundMessage: 'Project not found' });
    return row as unknown as Project;
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
    const insert = pickAllowedKeys(service, SERVICE_WRITE_KEYS);
    const { data, error } = await supabaseAdmin.from('services').insert(insert).select().single();
    if (error) throw error;
    return data;
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service> {
    const patch = pickAllowedKeys(service, SERVICE_WRITE_KEYS);
    const row = await updateByIdWithTimestampRetry('services', id, patch, { notFoundMessage: 'Service not found' });
    return row as unknown as Service;
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
    const { data, error } = await supabaseAdmin.from('site_settings').select('*').eq('key', key).maybeSingle();
    if (error) throw error;
    return data;
  }

  async upsertSiteSetting(key: string, value: string): Promise<SiteSetting> {
    const stamp = new Date().toISOString();
    let { data, error } = await supabaseAdmin
      .from('site_settings')
      .upsert({ key, value, updated_at: stamp }, { onConflict: 'key' })
      .select()
      .single();
    if (error && shouldRetryUpdateWithoutUpdatedAt(error)) {
      ({ data, error } = await supabaseAdmin
        .from('site_settings')
        .upsert({ key, value }, { onConflict: 'key' })
        .select()
        .single());
    }
    if (error) throw error;
    return data;
  }

  async upsertSiteSettings(entries: Array<{ key: string; value: string }>): Promise<SiteSetting[]> {
    const stamp = new Date().toISOString();
    const settings = entries.map(entry => ({
      key: entry.key,
      value: entry.value,
      updated_at: stamp
    }));
    let { data, error } = await supabaseAdmin.from('site_settings').upsert(settings, { onConflict: 'key' }).select();
    if (error && shouldRetryUpdateWithoutUpdatedAt(error)) {
      const plain = entries.map(entry => ({ key: entry.key, value: entry.value }));
      ({ data, error } = await supabaseAdmin.from('site_settings').upsert(plain, { onConflict: 'key' }).select());
    }
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
    target_area?: 'site' | 'course';
  }): Promise<SupportRequest[]> {
    let query = supabaseAdmin.from('support_requests').select('*');
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.viewed !== undefined) query = query.eq('viewed', filters.viewed);
    if (filters?.target_area) query = query.eq('target_area', filters.target_area);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createSupportRequest(request: Partial<SupportRequest>): Promise<SupportRequest> {
    const insert = pickAllowedKeys(request, SUPPORT_WRITE_KEYS);
    let { data, error } = await supabaseAdmin.from('support_requests').insert(insert).select().single();

    // Backward compatibility: if DB columns are not migrated yet, retry without new optional fields.
    if (
      error &&
      typeof error.message === 'string' &&
      (error.message.toLowerCase().includes('screenshot_url') || error.message.toLowerCase().includes('target_area'))
    ) {
      const { screenshot_url, target_area, ...fallbackInsert } = insert;
      ({ data, error } = await supabaseAdmin.from('support_requests').insert(fallbackInsert).select().single());
    }

    if (error) throw error;
    return data;
  }

  async updateSupportRequest(id: number, request: Partial<SupportRequest>): Promise<SupportRequest> {
    const patch = pickAllowedKeys(request, SUPPORT_WRITE_KEYS);
    const row = await updateByIdWithTimestampRetry('support_requests', id, patch, {
      notFoundMessage: 'Support request not found'
    });
    return row as unknown as SupportRequest;
  }

  async getSupportRequestById(id: number): Promise<SupportRequest | null> {
    const { data, error } = await supabaseAdmin.from('support_requests').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data as SupportRequest | null;
  }
}

export default new LandingService();
