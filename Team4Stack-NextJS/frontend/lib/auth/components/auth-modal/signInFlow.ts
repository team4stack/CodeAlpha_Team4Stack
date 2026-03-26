import type { AuthResultData, UserLookupData } from '@/lib/auth/components/auth-modal/types'

export const resolveSignInRecaptchaToken = (recaptchaToken: string | null): string | null => {
  if (recaptchaToken) return recaptchaToken
  try {
    return globalThis.window.grecaptcha?.getResponse?.() || null
  } catch {
    return null
  }
}

const normalizeEmail = (value: string) => value.trim().toLowerCase()

export const resolveLoginEmailOrError = async (
  emailOrUsername: string
): Promise<{ loginEmail: string | null; error: string | null }> => {
  const normalizedInput = normalizeEmail(emailOrUsername)
  if (!normalizedInput.includes('@')) {
    try {
      const { usersApi } = await import('@/lib/api')
      const result = await usersApi.getUserByUsername(normalizedInput)
      if (!result.success || !result.data) {
        return { loginEmail: null, error: 'Username not found. Please use your email address.' }
      }
      const userData = result.data as UserLookupData | null
      if (userData?.is_blocked === true) {
        return { loginEmail: null, error: 'Your account has been suspended. Please contact support.' }
      }
      if (!userData?.email) {
        return { loginEmail: null, error: 'Username not found. Please use your email address.' }
      }
      return { loginEmail: normalizeEmail(userData.email), error: null }
    } catch {
      return { loginEmail: null, error: 'Failed to verify username. Please use your email address.' }
    }
  }

  try {
    const { usersApi } = await import('@/lib/api')
    const result = await usersApi.getUserByEmail(normalizedInput)
    const userData = result.data as UserLookupData | null
    if (result.success && userData?.is_blocked === true) {
      return { loginEmail: null, error: 'Your account has been suspended. Please contact support.' }
    }
  } catch {
    // Continue even if user service check fails; backend sign-in still validates.
  }

  return { loginEmail: normalizedInput, error: null }
}

export const signInViaBackend = async (
  loginEmail: string,
  password: string
): Promise<{ data: AuthResultData | null; error: string | null }> => {
  const { authApi } = await import('@/lib/api')
  const signInResult = await authApi.signIn(loginEmail.trim(), password.trim())
  if (signInResult.error || !signInResult.success) {
    return { data: null, error: signInResult.error || 'Invalid email or password.' }
  }
  return { data: (signInResult.data as AuthResultData | null) || null, error: null }
}
