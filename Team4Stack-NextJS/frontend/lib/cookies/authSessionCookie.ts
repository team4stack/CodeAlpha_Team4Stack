import { buildAuthSessionCookieValue } from '@/lib/security/clientAuthSession';
import { canUseFunctionalCookies } from './consent';

export const AUTH_SESSION_COOKIE_NAME = 'auth_session';

export function setAuthSessionCookie(
  session: { access_token: string; refresh_token: string; expires_at?: number },
  maxAgeSeconds?: number
): void {
  try {
    const expiresAt = typeof session.expires_at === 'number' ? session.expires_at : undefined;
    const now = Date.now();
    const computedMaxAge =
      typeof maxAgeSeconds === 'number'
        ? maxAgeSeconds
        : typeof expiresAt === 'number'
          ? Math.max(0, Math.floor((expiresAt - now) / 1000))
          : 60 * 60 * 24 * 30;

    const encoded = buildAuthSessionCookieValue({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: expiresAt
    });
    if (!encoded) return;

    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${AUTH_SESSION_COOKIE_NAME}=${encoded}; path=/; max-age=${computedMaxAge}; samesite=Lax${secure}`;
  } catch {
    // Silent fail: localStorage may still hold session
  }
}

/** Only sets the cookie when user accepted functional cookies (stay signed-in / cross-tab resilience). */
export function setAuthSessionCookieIfAllowed(
  session: { access_token: string; refresh_token: string; expires_at?: number },
  maxAgeSeconds?: number
): void {
  if (!canUseFunctionalCookies()) return;
  setAuthSessionCookie(session, maxAgeSeconds);
}

export function clearAuthSessionCookie(): void {
  try {
    const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${AUTH_SESSION_COOKIE_NAME}=; Max-Age=0; path=/; samesite=Lax${secure}`;
  } catch {
    // ignore
  }
}
