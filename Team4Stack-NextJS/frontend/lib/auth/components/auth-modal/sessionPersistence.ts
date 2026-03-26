import { setAuthSessionCookieIfAllowed } from '@/lib/cookies/authSessionCookie'
import { canUseFunctionalCookies, persistSignInIdentity } from '@/lib/cookies/consent'
import { isValidAuthTokenString } from '@/lib/security/clientAuthSession'
import type { AuthResultData, AuthSessionData } from '@/lib/auth/components/auth-modal/types'

interface PersistAuthSessionArgs {
  session: AuthSessionData
  authData?: AuthResultData | null
  identityEmail: string
}

const resolveIdentityName = (authData?: AuthResultData | null) => {
  const user = authData?.user as Record<string, unknown> | undefined
  const metadata = user?.user_metadata as Record<string, unknown> | undefined
  return (
    (typeof user?.name === 'string' && user.name) ||
    (metadata && typeof metadata.full_name === 'string' && metadata.full_name) ||
    (metadata && typeof metadata.name === 'string' && metadata.name) ||
    null
  )
}

const normalizeSessionExpiry = (session: AuthSessionData) => {
  let expiresAt = session.expires_at
  if (!expiresAt) {
    return session.expires_in ? Date.now() + session.expires_in * 1000 : Date.now() + 3600000
  }
  if (typeof expiresAt === 'number' && expiresAt < 1000000000000) {
    expiresAt = expiresAt * 1000
  }
  return expiresAt
}

export const persistAuthSession = ({ session, authData, identityEmail }: PersistAuthSessionArgs) => {
  const expiresAt = normalizeSessionExpiry(session)
  const sessionToStore = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: expiresAt,
    user: authData?.user || null
  }

  if (
    !isValidAuthTokenString(sessionToStore.access_token) ||
    !isValidAuthTokenString(sessionToStore.refresh_token)
  ) {
    throw new Error('Invalid session tokens')
  }

  localStorage.setItem('auth_session', JSON.stringify(sessionToStore))
  setAuthSessionCookieIfAllowed(
    {
      access_token: sessionToStore.access_token,
      refresh_token: sessionToStore.refresh_token,
      expires_at: sessionToStore.expires_at
    },
    undefined
  )

  try {
    if (canUseFunctionalCookies()) {
      persistSignInIdentity({ email: identityEmail.trim(), name: resolveIdentityName(authData) })
    }
  } catch {
    // ignore optional identity persistence errors
  }

  const verifyStored = localStorage.getItem('auth_session')
  if (!verifyStored) {
    throw new Error('Session storage verification failed')
  }
}

export const notifyAuthSessionUpdatedAndReload = () => {
  setTimeout(() => {
    if (globalThis.window !== undefined) {
      globalThis.window.dispatchEvent(new Event('auth_session_updated'))
    }
    setTimeout(() => {
      globalThis.window.location.reload()
    }, 100)
  }, 300)
}
