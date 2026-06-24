import type { Request } from 'express';
import { TEAM_ADMIN_ROLES } from '../../../shared/middleware/authMiddleware';

export type WorkspaceActor =
  | { kind: 'admin'; email: string; role: string }
  | { kind: 'user'; email: string; userId: string };

export function getWorkspaceActor(req: Request): WorkspaceActor | null {
  if (req.auth?.kind === 'admin') {
    return { kind: 'admin', email: req.auth.email, role: req.auth.role };
  }
  if (req.auth?.kind === 'user') {
    return { kind: 'user', email: req.auth.email, userId: req.auth.sub };
  }
  return null;
}

export function isWorkspaceAdmin(actor: WorkspaceActor | null): boolean {
  if (!actor || actor.kind !== 'admin') return false;
  return (TEAM_ADMIN_ROLES as readonly string[]).includes(actor.role);
}

export function normalizeEmail(email?: string | null): string {
  return (email || '').toLowerCase().trim();
}
