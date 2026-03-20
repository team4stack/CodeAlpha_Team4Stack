/** Fields allowed on public.users updates (avoids PostgREST 500s from unknown body keys). */
const ALLOWED_USER_UPDATE_KEYS = ['email', 'username', 'name', 'avatar_url', 'is_blocked', 'role'] as const

export type AllowedUserUpdateKey = (typeof ALLOWED_USER_UPDATE_KEYS)[number]

export function sanitizeUserUpdateBody(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {}
  }
  const raw = body as Record<string, unknown>
  const patch: Record<string, unknown> = {}
  for (const key of ALLOWED_USER_UPDATE_KEYS) {
    if (raw[key] !== undefined) patch[key] = raw[key]
  }
  if (typeof patch.email === 'string') {
    patch.email = patch.email.toLowerCase().trim()
  }
  return patch
}
