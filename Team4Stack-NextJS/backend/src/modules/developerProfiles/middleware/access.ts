import type { Request } from 'express';
import { TEAM_ADMIN_ROLES } from '../../../shared/middleware/authMiddleware';
import { supabaseAdmin } from '../../../config/supabase';
import type { DeveloperProfile } from '../types';

export type ProfileActor =
  | { kind: 'admin'; email: string; role: string }
  | { kind: 'user'; email: string; userId: string };

export function getProfileActor(req: Request): ProfileActor | null {
  if (req.auth?.kind === 'admin') {
    return { kind: 'admin', email: req.auth.email, role: req.auth.role };
  }
  if (req.auth?.kind === 'user') {
    return { kind: 'user', email: req.auth.email, userId: req.auth.sub };
  }
  return null;
}

export function isProfileAdmin(actor: ProfileActor | null): boolean {
  if (!actor || actor.kind !== 'admin') return false;
  return (TEAM_ADMIN_ROLES as readonly string[]).includes(actor.role);
}

export function normalizeEmail(email?: string | null): string {
  return (email || '').toLowerCase().trim();
}

export async function getDeveloperProfileForUser(actor: ProfileActor): Promise<DeveloperProfile | null> {
  if (actor.kind !== 'user') return null;
  const email = normalizeEmail(actor.email);
  const { data, error } = await supabaseAdmin
    .from('developer_profiles')
    .select('*')
    .or(`user_id.eq.${actor.userId},user_email.eq.${email}`)
    .maybeSingle();
  if (error) throw error;
  return data as DeveloperProfile | null;
}
