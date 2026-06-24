import { supabaseAdmin } from '../../../config/supabase';
import type { ProfileActor } from '../middleware/access';
import { normalizeEmail } from '../middleware/access';
import { assignDeveloperProfile } from './profileService';
import { slugFromName, isMissingTableError } from '../utils/errors';

export type DeveloperApplication = {
  id: number;
  applicant_user_id?: string | null;
  name: string;
  email: string;
  role?: string | null;
  skills: string[];
  portfolio_url?: string | null;
  github_url?: string | null;
  bio: string;
  message?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by_admin?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
};

export async function submitApplication(
  actor: ProfileActor | null,
  body: Record<string, unknown>
): Promise<DeveloperApplication> {
  const name = String(body.name || '').trim();
  const email = normalizeEmail(actor?.kind === 'user' ? actor.email : String(body.email || ''));
  const bio = String(body.bio || '').trim();
  const role = String(body.role || 'Full Stack Developer').trim();
  const message = body.message ? String(body.message).trim() : null;

  if (!name || name.length < 2) {
    throw Object.assign(new Error('Name is required'), { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Object.assign(new Error('Valid email is required'), { status: 400 });
  }
  if (!bio || bio.length < 20) {
    throw Object.assign(new Error('Bio must be at least 20 characters'), { status: 400 });
  }

  const skills = String(body.skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);

  const { data: pending } = await supabaseAdmin
    .from('developer_applications')
    .select('id')
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle();

  if (pending) {
    throw Object.assign(new Error('You already have a pending application'), { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from('developer_applications')
    .insert({
      applicant_user_id: actor?.kind === 'user' ? actor.userId : null,
      name,
      email,
      role,
      skills,
      portfolio_url: body.portfolio_url ? String(body.portfolio_url).trim() : null,
      github_url: body.github_url ? String(body.github_url).trim() : null,
      bio,
      message,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      throw Object.assign(
        new Error('Applications are temporarily unavailable. Please try again later.'),
        { status: 503 }
      );
    }
    throw error;
  }

  return data as DeveloperApplication;
}

export async function listApplications(): Promise<DeveloperApplication[]> {
  const { data, error } = await supabaseAdmin
    .from('developer_applications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
  return (data || []) as DeveloperApplication[];
}

export async function reviewApplication(
  id: number,
  adminEmail: string,
  approved: boolean,
  slug?: string
): Promise<{ application: DeveloperApplication; profile?: unknown }> {
  const status = approved ? 'approved' : 'rejected';

  const { data: app, error: findErr } = await supabaseAdmin
    .from('developer_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (findErr) throw findErr;
  if (!app) throw Object.assign(new Error('Application not found'), { status: 404 });
  if (app.status !== 'pending') {
    throw Object.assign(new Error('Application already reviewed'), { status: 400 });
  }

  const { data: updated, error } = await supabaseAdmin
    .from('developer_applications')
    .update({
      status,
      reviewed_by_admin: adminEmail,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  let profile;
  if (approved) {
    const finalSlug = (slug || slugFromName(app.name)).toLowerCase();
    profile = await assignDeveloperProfile({
      slug: finalSlug,
      user_email: app.email,
      user_id: app.applicant_user_id,
      name: app.name,
      role: app.role || 'Developer',
      assigned_by_admin: adminEmail,
    });

    await supabaseAdmin
      .from('developer_profiles')
      .update({
        bio: app.bio,
        skills: app.skills || [],
        portfolio_url: app.portfolio_url,
        github_url: app.github_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
  }

  return { application: updated as DeveloperApplication, profile };
}
