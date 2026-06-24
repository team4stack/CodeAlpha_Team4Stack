import { supabaseAdmin } from '../../../config/supabase';
import type { Availability, DeveloperProfile } from '../types';
import { normalizeEmail } from '../middleware/access';
import { isMissingTableError } from '../utils/errors';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && slug.length >= 2 && slug.length <= 60;
}

export async function listPublishedProfiles(): Promise<DeveloperProfile[]> {
  const { data, error } = await supabaseAdmin
    .from('developer_profiles')
    .select('*')
    .eq('is_published', true)
    .order('id', { ascending: true });
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
  return (data || []) as DeveloperProfile[];
}

export async function getPublishedBySlug(slug: string): Promise<DeveloperProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('developer_profiles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data as DeveloperProfile | null;
}

export async function listAllProfiles(): Promise<DeveloperProfile[]> {
  const { data, error } = await supabaseAdmin
    .from('developer_profiles')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return (data || []) as DeveloperProfile[];
}

export async function assignDeveloperProfile(input: {
  slug: string;
  user_email: string;
  user_id?: string | null;
  name: string;
  role?: string;
  assigned_by_admin: string;
}): Promise<DeveloperProfile> {
  const slug = input.slug.toLowerCase().trim();
  const email = normalizeEmail(input.user_email);
  if (!isValidSlug(slug)) throw Object.assign(new Error('Invalid slug'), { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error('Valid user email is required'), { status: 400 });
  }

  const existing = await getPublishedBySlug(slug);
  const row = {
    slug,
    user_email: email,
    user_id: input.user_id || null,
    name: input.name.trim(),
    role: input.role?.trim() || 'Developer',
    assigned_by_admin: input.assigned_by_admin,
    is_published: true,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('developer_profiles')
      .update(row)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data as DeveloperProfile;
  }

  const { data, error } = await supabaseAdmin
    .from('developer_profiles')
    .insert({
      ...row,
      bio: 'Available for client projects via Team4Stack.',
      skills: [],
      availability: 'available' as Availability,
    })
    .select()
    .single();
  if (error) throw error;
  return data as DeveloperProfile;
}

export async function updateOwnProfile(
  profileId: number,
  patch: Partial<DeveloperProfile>
): Promise<DeveloperProfile> {
  const allowed: Record<string, unknown> = {};
  if (patch.role !== undefined) allowed.role = patch.role?.trim() || null;
  if (patch.bio !== undefined) allowed.bio = patch.bio?.trim() || null;
  if (patch.long_bio !== undefined) allowed.long_bio = patch.long_bio?.trim() || null;
  if (patch.skills !== undefined) allowed.skills = patch.skills;
  if (patch.image_url !== undefined) allowed.image_url = patch.image_url?.trim() || null;
  if (patch.portfolio_url !== undefined) allowed.portfolio_url = patch.portfolio_url?.trim() || null;
  if (patch.github_url !== undefined) allowed.github_url = patch.github_url?.trim() || null;
  if (patch.availability !== undefined) allowed.availability = patch.availability;
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('developer_profiles')
    .update(allowed)
    .eq('id', profileId)
    .select()
    .single();
  if (error) throw error;
  return data as DeveloperProfile;
}
