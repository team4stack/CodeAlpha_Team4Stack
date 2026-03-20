/**
 * Cookie / storage consent for Team4Stack.
 * - essential: core site + localStorage session; no auth cookie; no optional identity cache.
 * - functional: auth cookie + full sign-in identity cache (email + display name) for UX.
 */

export const COOKIE_CONSENT_STORAGE_KEY = 't4s_cookie_consent_v1';
/** Legacy single-email key — kept in sync when saving identity */
export const REMEMBER_EMAIL_KEY = 't4s_remember_email';
/** Richer cache: email + name for sign-in UX when user chose Accept all */
export const SAVED_SIGNIN_IDENTITY_KEY = 't4s_signin_identity_v1';

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
    if (!raw) return 'pending';
    const parsed = JSON.parse(raw) as StoredCookieConsent;
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
  if (!email) return;
  try {
    let name: string | undefined;
    if (typeof data.name === 'string' && data.name.trim()) name = data.name.trim();
    const payload = JSON.stringify({
      email,
      ...(name ? { name } : {}),
      savedAt: new Date().toISOString()
    });
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
    if (raw) {
      const j = JSON.parse(raw) as { email?: string; name?: string };
      if (j?.email && typeof j.email === 'string') {
        return { email: j.email, name: j.name ?? null };
      }
    }
    const legacy = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (legacy) return { email: legacy, name: null };
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
    if (!raw) return;
    const s = JSON.parse(raw) as { user?: Record<string, unknown> };
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
  if (typeof window !== 'undefined') {
    void import('@/lib/performance/functionalExperienceCache')
      .then((m) => m.clearFunctionalPublicCaches())
      .catch(() => {});
  }
}
