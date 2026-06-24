import { supabaseAdmin } from '../../../config/supabase';
import { normalizePlatform } from '../constants/platforms';
import type { SellerApplication } from '../types';
import { isMissingTableError } from '../utils/errors';

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function submitSellerApplication(
  userId: string | null,
  email: string,
  body: Record<string, unknown>
): Promise<SellerApplication> {
  const name = String(body.name || '').trim();
  const storeName = String(body.store_name || '').trim();
  const bio = String(body.bio || '').trim();
  const primaryPlatform = normalizePlatform(body.primary_platform);
  const normalizedEmail = normalizeEmail(email || String(body.email || ''));

  if (!name || name.length < 2) {
    throw Object.assign(new Error('Name is required'), { status: 400 });
  }
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw Object.assign(new Error('Valid email is required'), { status: 400 });
  }
  if (!storeName || storeName.length < 3) {
    throw Object.assign(new Error('Store name must be at least 3 characters'), { status: 400 });
  }
  if (!bio || bio.length < 30) {
    throw Object.assign(new Error('Tell us about your experience (at least 30 characters)'), { status: 400 });
  }

  if (userId) {
    const { data: existingSeller } = await supabaseAdmin
      .from('sellers')
      .select('id, active')
      .eq('user_id', userId)
      .maybeSingle();
    if (existingSeller?.active) {
      throw Object.assign(new Error('You are already an approved seller'), { status: 409 });
    }
  }

  const { data: pending } = await supabaseAdmin
    .from('seller_applications')
    .select('id')
    .eq('email', normalizedEmail)
    .eq('status', 'pending')
    .maybeSingle();

  if (pending) {
    throw Object.assign(new Error('You already have a pending seller application'), { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from('seller_applications')
    .insert({
      applicant_user_id: userId,
      name,
      email: normalizedEmail,
      store_name: storeName,
      primary_platform: primaryPlatform,
      portfolio_url: body.portfolio_url ? String(body.portfolio_url).trim() : null,
      github_url: body.github_url ? String(body.github_url).trim() : null,
      bio,
      message: body.message ? String(body.message).trim() : null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      throw Object.assign(
        new Error('Seller applications are temporarily unavailable. Please try again later.'),
        { status: 503 }
      );
    }
    throw error;
  }

  return data as SellerApplication;
}

export async function getMySellerApplication(email: string): Promise<SellerApplication | null> {
  const { data, error } = await supabaseAdmin
    .from('seller_applications')
    .select('*')
    .eq('email', normalizeEmail(email))
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
  return data as SellerApplication | null;
}

export async function listSellerApplications(status?: string): Promise<SellerApplication[]> {
  let query = supabaseAdmin.from('seller_applications').select('*');
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) {
    if (isMissingTableError(error)) return [];
    throw error;
  }
  return (data || []) as SellerApplication[];
}

export async function reviewSellerApplication(
  id: number,
  decision: 'approved' | 'rejected',
  adminEmail: string
): Promise<SellerApplication> {
  const { data: app, error: fetchError } = await supabaseAdmin
    .from('seller_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!app) throw Object.assign(new Error('Application not found'), { status: 404 });
  if (app.status !== 'pending') {
    throw Object.assign(new Error('Application was already reviewed'), { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('seller_applications')
    .update({
      status: decision,
      reviewed_by_admin: adminEmail,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (decision === 'approved') {
    const userId = app.applicant_user_id;
    if (!userId) {
      throw Object.assign(new Error('Applicant must sign in before approval'), { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from('sellers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing?.id) {
      await supabaseAdmin
        .from('sellers')
        .update({
          store_name: app.store_name,
          description: app.bio,
          active: true,
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('sellers').insert({
        user_id: userId,
        store_name: app.store_name,
        description: app.bio,
        active: true,
        status: 'approved',
      });
    }
  }

  return data as SellerApplication;
}

export async function getSellerByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('sellers')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}
