import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { supabase } from '../../config/supabase';

/** Roles that can mutate landing CMS + reviews + support admin actions */
export const LANDING_ADMIN_ROLES = ['super_admin', 'landing_admin', 'admin'] as const;

/** Courses panel + course notifications + admissions admin */
export const COURSES_ADMIN_ROLES = ['super_admin', 'courses_admin'] as const;

export const STACKSTORE_ADMIN_ROLES = ['super_admin', 'stackstore_admin'] as const;

export const TEAM_ADMIN_ROLES = ['super_admin', 'team_admin'] as const;

export const SUPERADMIN_ONLY_ROLES = ['super_admin'] as const;

function getAdminTokenSecret(): string {
  const s = process.env.ADMIN_API_TOKEN_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-only-insecure-admin-api-token-secret-min-16-chars';
  }
  return '';
}

const ADMIN_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function issueAdminApiToken(email: string, role: string): string {
  const secret = getAdminTokenSecret();
  if (!secret) {
    throw new Error('ADMIN_API_TOKEN_SECRET must be set (min 16 chars) in production');
  }
  const exp = Date.now() + ADMIN_TOKEN_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({
      email: email.toLowerCase().trim(),
      role,
      exp
    }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAdminApiToken(token: string): { email: string; role: string; exp: number } | null {
  const secret = getAdminTokenSecret();
  if (!secret) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (!timingSafeEqualUtf8(expected, sig)) return null;
  try {
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      email?: string;
      role?: string;
      exp?: number;
    };
    if (!json.email || !json.role || typeof json.exp !== 'number') return null;
    if (Date.now() > json.exp) return null;
    return { email: json.email, role: json.role, exp: json.exp };
  } catch {
    return null;
  }
}

function timingSafeEqualUtf8(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'utf8');
    const bb = Buffer.from(b, 'utf8');
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

async function verifyUserJwt(token: string): Promise<{ sub: string; email: string } | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id) return null;
  const email = (data.user.email || '').toLowerCase().trim();
  return { sub: data.user.id, email };
}

/**
 * Optional: parses `Authorization: Bearer` and sets `req.auth` when valid.
 * Invalid / missing tokens are ignored (no error).
 */
export async function attachAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) {
      next();
      return;
    }
    const token = h.slice(7).trim();
    if (!token) {
      next();
      return;
    }

    const parts = token.split('.');
    if (parts.length === 2) {
      const adm = verifyAdminApiToken(token);
      if (adm) {
        req.auth = { kind: 'admin', email: adm.email, role: adm.role };
      }
      next();
      return;
    }

    if (parts.length === 3) {
      const u = await verifyUserJwt(token);
      if (u) {
        req.auth = { kind: 'user', sub: u.sub, email: u.email };
      }
      next();
      return;
    }

    next();
  } catch (err) {
    next(err as Error);
  }
}

export function wrapAttachAuth(req: Request, res: Response, next: NextFunction): void {
  void attachAuth(req, res, next);
}

export function requireUserJwt(req: Request, res: Response, next: NextFunction): void {
  if (req.auth?.kind === 'user') {
    next();
    return;
  }
  if (req.auth?.kind === 'admin') {
    res.status(403).json({ success: false, error: 'User session required' });
    return;
  }
  res.status(401).json({ success: false, error: 'Authentication required' });
}

export function requireAdminApiToken(req: Request, res: Response, next: NextFunction): void {
  if (req.auth?.kind === 'admin') {
    next();
    return;
  }
  if (req.auth?.kind === 'user') {
    res.status(403).json({ success: false, error: 'Admin session required' });
    return;
  }
  res.status(401).json({ success: false, error: 'Admin authentication required' });
}

export function requireAdminRoles(roles: readonly string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.auth?.kind !== 'admin') {
      if (req.auth?.kind === 'user') {
        res.status(403).json({ success: false, error: 'Admin access required' });
        return;
      }
      res.status(401).json({ success: false, error: 'Admin authentication required' });
      return;
    }
    if (!roles.includes(req.auth.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
