'use client'

import { setAuthSessionCookieIfAllowed } from '@/lib/cookies/authSessionCookie'
import { isValidAuthTokenString } from '@/lib/security/clientAuthSession'

/**
 * Persist access/refresh tokens after a successful backend sign-in.
 * Expects API shape: { user?, session: { access_token, refresh_token, expires_at?, expires_in? } }
 */
export function persistClientAuthSessionFromSignInData(
  signInData: unknown
): { ok: true } | { ok: false; error: string } {
  try {
    if (!signInData || typeof signInData !== 'object') {
      return { ok: false, error: 'Invalid sign-in data' }
    }
    const payload = signInData as Record<string, unknown>
    const session = payload.session as Record<string, unknown> | undefined
    if (!session || typeof session !== 'object') {
      return { ok: false, error: 'No session returned' }
    }

    const access_token = session.access_token
    const refresh_token = session.refresh_token
    if (!isValidAuthTokenString(access_token) || !isValidAuthTokenString(refresh_token)) {
      return { ok: false, error: 'Invalid session tokens' }
    }

    let expiresAt: number
    const rawExpires = session.expires_at
    if (typeof rawExpires === 'number' && Number.isFinite(rawExpires)) {
      expiresAt = rawExpires < 1_000_000_000_000 ? rawExpires * 1000 : rawExpires
    } else if (typeof session.expires_in === 'number' && Number.isFinite(session.expires_in)) {
      expiresAt = Date.now() + session.expires_in * 1000
    } else {
      expiresAt = Date.now() + 3600000
    }

    const sessionToStore = {
      access_token,
      refresh_token,
      expires_at: expiresAt,
      user: payload.user ?? null,
    }

    localStorage.setItem('auth_session', JSON.stringify(sessionToStore))
    setAuthSessionCookieIfAllowed(
      {
        access_token,
        refresh_token,
        expires_at: expiresAt,
      },
      undefined
    )
    return { ok: true }
  } catch {
    return { ok: false, error: 'Failed to save session' }
  }
}
