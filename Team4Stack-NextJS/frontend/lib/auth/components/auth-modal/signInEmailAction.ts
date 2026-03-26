import { persistAuthSession } from '@/lib/auth/components/auth-modal/sessionPersistence'
import {
  resolveLoginEmailOrError,
  resolveSignInRecaptchaToken,
  signInViaBackend
} from '@/lib/auth/components/auth-modal/signInFlow'
import type { AuthResultData } from '@/lib/auth/components/auth-modal/types'

type SignInEmailActionResult =
  | { ok: false; message: string }
  | { ok: true; loginEmail: string; signInData: AuthResultData | null }

interface ExecuteSignInEmailActionArgs {
  email: string
  password: string
  recaptchaToken: string | null
}

export const executeSignInEmailAction = async ({
  email,
  password,
  recaptchaToken
}: ExecuteSignInEmailActionArgs): Promise<SignInEmailActionResult> => {
  if (!email || !password) {
    return { ok: false, message: 'Please enter both email and password' }
  }

  const token = resolveSignInRecaptchaToken(recaptchaToken)
  if (!token) {
    return { ok: false, message: 'Please complete the reCAPTCHA verification' }
  }

  const loginResolution = await resolveLoginEmailOrError(email)
  if (loginResolution.error || !loginResolution.loginEmail) {
    return { ok: false, message: loginResolution.error || 'Invalid email or username.' }
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    return { ok: false, message: 'Password is required' }
  }

  const loginEmail = loginResolution.loginEmail
  const signInResult = await signInViaBackend(loginEmail, password)
  if (signInResult.error || !signInResult.data) {
    return { ok: false, message: signInResult.error || 'Invalid email or password.' }
  }

  const signInData: AuthResultData | null = signInResult.data
  const session = signInData?.session
  if (!session) {
    return { ok: false, message: 'Failed to sign in. Please try again.' }
  }

  try {
    persistAuthSession({ session, authData: signInData, identityEmail: loginEmail })
  } catch {
    return { ok: false, message: 'Failed to save session. Please try again.' }
  }

  return { ok: true, loginEmail, signInData }
}
