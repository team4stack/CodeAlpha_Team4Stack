/**
 * Client-side guards for auth session blobs (localStorage / mirrored cookie).
 * Does not replace HttpOnly server sessions — mitigates malformed storage, oversized payloads, and prototype pollution.
 */

const MAX_TOKEN_CHARS = 12_000;
const MAX_RAW_SESSION_JSON_CHARS = 500_000;
/** ~4KB cookie limit — avoid writing a truncated / invalid cookie */
const MAX_COOKIE_VALUE_CHARS = 3_900;

const MIN_EXPIRES_MS = 946684800000; // ~year 2000
function maxExpiresMs() {
  return Date.now() + 15 * 365 * 24 * 60 * 60 * 1000;
}

export function parseJsonStorage(raw: string): unknown | null {
  try {
    return JSON.parse(raw, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') return undefined;
      return value;
    });
  } catch {
    return null;
  }
}

export function isValidAuthTokenString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > MAX_TOKEN_CHARS) return false;
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) return false;
  return true;
}

function normalizeExpiresAtMs(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  let ms = n;
  // Accept seconds-based timestamps and normalize to ms.
  if (ms < MIN_EXPIRES_MS && ms < 1_000_000_000_000) {
    ms = ms * 1000;
  }
  const hi = maxExpiresMs();
  if (ms < MIN_EXPIRES_MS || ms > hi) return undefined;
  return Math.floor(ms);
}

export type StoredClientAuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user?: unknown;
  profile?: unknown;
};

export function parseStoredClientAuthSession(raw: string | null | undefined): StoredClientAuthSession | null {
  if (!raw || typeof raw !== 'string') return null;
  if (raw.length > MAX_RAW_SESSION_JSON_CHARS) return null;
  const data = parseJsonStorage(raw);
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const rec = data as Record<string, unknown>;
  if (!isValidAuthTokenString(rec.access_token) || !isValidAuthTokenString(rec.refresh_token)) return null;
  const expires_at = normalizeExpiresAtMs(rec.expires_at);
  return {
    access_token: rec.access_token,
    refresh_token: rec.refresh_token,
    ...(expires_at !== undefined ? { expires_at } : {}),
    ...(rec.user !== undefined ? { user: rec.user } : {}),
    ...(rec.profile !== undefined ? { profile: rec.profile } : {})
  };
}

export type SessionCookiePayload = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
};

/** Returns null if tokens invalid or JSON would not fit in a single cookie value. */
export function buildAuthSessionCookieValue(session: SessionCookiePayload): string | null {
  if (!isValidAuthTokenString(session.access_token) || !isValidAuthTokenString(session.refresh_token)) {
    return null;
  }
  const expires_at =
    session.expires_at !== undefined ? normalizeExpiresAtMs(session.expires_at) : undefined;
  const payload: SessionCookiePayload = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    ...(expires_at !== undefined ? { expires_at } : {})
  };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  if (encoded.length > MAX_COOKIE_VALUE_CHARS) return null;
  return encoded;
}
