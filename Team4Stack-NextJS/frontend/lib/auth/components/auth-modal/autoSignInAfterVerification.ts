import { persistAuthSession } from '@/lib/auth/components/auth-modal/sessionPersistence'
import type { AuthResultData } from '@/lib/auth/components/auth-modal/types'

export interface AutoSignInAfterVerificationResult {
  signedIn: boolean
  message: string
}

export const autoSignInAfterVerification = async ({
  email,
  password,
  identityEmail
}: {
  email: string
  password: string
  identityEmail: string
}): Promise<AutoSignInAfterVerificationResult> => {
  const { authApi } = await import('@/lib/api')
  const signInResult = await authApi.signIn(email.trim().toLowerCase(), password.trim())

  if (signInResult.error || !signInResult.success) {
    const maybeConfirm = signInResult.error || ''
    if (
      maybeConfirm.includes('email') ||
      maybeConfirm.includes('confirm') ||
      maybeConfirm.includes('Email not confirmed')
    ) {
      return {
        signedIn: false,
        message: 'Account created! Please check your email to confirm your account, then sign in.'
      }
    }
    return {
      signedIn: false,
      message: 'Account created successfully! You can now sign in with your email and password.'
    }
  }

  const signInData = signInResult.data as AuthResultData | null
  const session = signInData?.session
  if (!session) {
    return {
      signedIn: false,
      message: 'Account created successfully! You can now sign in with your email and password.'
    }
  }

  persistAuthSession({ session, authData: signInData, identityEmail })
  return {
    signedIn: true,
    message: 'Account created and signed in successfully!'
  }
}
