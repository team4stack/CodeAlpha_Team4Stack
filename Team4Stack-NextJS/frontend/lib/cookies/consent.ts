/**
 * Cookie / storage consent for Team4Stack.
 * - essential: core site + localStorage session; no auth cookie; no optional identity cache.
 * - functional: auth cookie + full sign-in identity cache (email + display name) for UX.
 */

import { parseJsonStorage, parseStoredClientAuthSession } from '@/lib/security/clientAuthSession';

const MAX_CONSENT_JSON_CHARS = 4096;
const MAX_EMAIL_CHARS = 254;
const MAX_NAME_CHARS = 200;
const MAX_IDENTITY_JSON_CHARS = 8192;

export const COOKIE_CONSENT_STORAGE_KEY = 't4s_cookie_consent_v1';
/** Legacy single-email key — kept in sync when saving identity */
export const REMEMBER_EMAIL_KEY = 't4s_remember_email';
/** Richer cache: email + name for sign-in UX when user chose Accept all */
export const SAVED_SIGNIN_IDENTITY_KEY = 't4s_signin_identity_v1';
export const VISITOR_ID_STORAGE_KEY = 't4s_visitor_id_v1';
export const VISITOR_SESSION_STORAGE_KEY = 't4s_visitor_session_v1';

export type CookieConsentLevel = 'pending' | 'essential' | 'functional';

export type StoredCookieConsent = {
  level: Exclude<CookieConsentLevel, 'pending'>;
  updatedAt: string;
};

export type SavedSignInIdentity = {
  email: string;
  name?: string | null;
};

export function getCookieConsent(): CookieConsentLevel {
  if (typeof window === 'undefined') return 'pending';
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw || raw.length > MAX_CONSENT_JSON_CHARS) return 'pending';
    const parsed = parseJsonStorage(raw) as StoredCookieConsent | null;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return 'pending';
    if (parsed.level === 'essential' || parsed.level === 'functional') return parsed.level;
    return 'pending';
  } catch {
    return 'pending';
  }
}

export function setCookieConsent(level: 'essential' | 'functional'): void {
  if (typeof window === 'undefined') return;
  const payload: StoredCookieConsent = {
    level,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent('cookie_consent_changed', { detail: level }));
}

export function canUseFunctionalCookies(): boolean {
  return getCookieConsent() === 'functional';
}

export function hasAnsweredConsent(): boolean {
  return getCookieConsent() !== 'pending';
}

/** Save account email (+ name when available) for faster return visits — only when consent is functional */
export function persistSignInIdentity(data: { email?: string | null; name?: string | null }): void {
  if (!canUseFunctionalCookies()) return;
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  if (!email || email.length > MAX_EMAIL_CHARS || email.includes('\0')) return;
  try {
    let name: string | undefined;
    if (typeof data.name === 'string' && data.name.trim()) {
      const t = data.name.trim();
      if (!t.includes('\0')) name = t.slice(0, MAX_NAME_CHARS);
    }
    const payload = JSON.stringify({
      email,
      ...(name ? { name } : {}),
      savedAt: new Date().toISOString()
    });
    if (payload.length > MAX_IDENTITY_JSON_CHARS) return;
    localStorage.setItem(SAVED_SIGNIN_IDENTITY_KEY, payload);
    localStorage.setItem(REMEMBER_EMAIL_KEY, email);
  } catch {
    // ignore
  }
}

export function readSavedSignInIdentity(): SavedSignInIdentity | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SAVED_SIGNIN_IDENTITY_KEY);
    if (raw && raw.length <= MAX_IDENTITY_JSON_CHARS) {
      const j = parseJsonStorage(raw) as { email?: string; name?: string } | null;
      if (j && typeof j === 'object' && !Array.isArray(j) && typeof j.email === 'string') {
        const em = j.email.trim();
        if (em && em.length <= MAX_EMAIL_CHARS && !em.includes('\0')) {
          const nm = typeof j.name === 'string' ? j.name.trim().slice(0, MAX_NAME_CHARS) : null;
          return { email: em, name: nm || null };
        }
      }
    }
    const legacy = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (legacy && legacy.length <= MAX_EMAIL_CHARS && !legacy.includes('\0')) {
      return { email: legacy.trim(), name: null };
    }
  } catch {
    // ignore
  }
  return null;
}

/** After user taps Accept all: pull email/name from existing auth_session JSON */
export function syncSignInIdentityFromAuthSessionLocalStorage(): void {
  if (!canUseFunctionalCookies()) return;
  try {
    const raw = localStorage.getItem('auth_session');
    const s = parseStoredClientAuthSession(raw);
    if (!s) return;
    const u = s.user as Record<string, unknown> | undefined;
    if (!u) return;
    const email =
      (typeof u.email === 'string' && u.email) ||
      (typeof (u.user_metadata as Record<string, unknown> | undefined)?.email === 'string' &&
        String((u.user_metadata as Record<string, unknown>).email)) ||
      '';
    const meta = u.user_metadata as Record<string, unknown> | undefined;
    const name =
      (typeof u.name === 'string' && u.name) ||
      (meta && typeof meta.full_name === 'string' && meta.full_name) ||
      (meta && typeof meta.name === 'string' && meta.name) ||
      null;
    if (email) persistSignInIdentity({ email, name });
  } catch {
    // ignore
  }
}

export function clearRememberedEmail(): void {
  try {
    localStorage.removeItem(REMEMBER_EMAIL_KEY);
    localStorage.removeItem(SAVED_SIGNIN_IDENTITY_KEY);
  } catch {
    // ignore
  }
}

export function clearOptionalPreferenceStorage(): void {
  clearRememberedEmail();
  try {
    localStorage.removeItem(VISITOR_ID_STORAGE_KEY);
    sessionStorage.removeItem(VISITOR_SESSION_STORAGE_KEY);
  } catch {
    // ignore
  }
  if (typeof window !== 'undefined') {
    void import('@/lib/performance/functionalExperienceCache')
      .then((m) => m.clearFunctionalPublicCaches())
      .catch(() => {});
  }
}
