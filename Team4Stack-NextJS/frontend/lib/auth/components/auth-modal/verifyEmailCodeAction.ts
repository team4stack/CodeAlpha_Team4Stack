import { autoSignInAfterVerification } from '@/lib/auth/components/auth-modal/autoSignInAfterVerification'
import { deleteOtpPayload, readOtpPayload } from '@/lib/auth/components/auth-modal/otpStorage'
import type { AuthResultData, OtpPayload } from '@/lib/auth/components/auth-modal/types'

type VerifyEmailCodeActionResult =
  | { ok: false; message: string }
  | { ok: true; message: string; signedIn: boolean }

interface ExecuteVerifyEmailCodeActionArgs {
  email: string
  verificationCode: string
  identityEmail: string
}

const validateOtpPayload = (
  otpData: OtpPayload,
  verificationCode: string,
  email: string
): { valid: true } | { valid: false; message: string; shouldDeleteOtp?: boolean } => {
  if (otpData.code !== verificationCode) {
    return { valid: false, message: 'Invalid verification code. Please try again.' }
  }

  const expiresAt = new Date(otpData.expiresAt)
  if (new Date() > expiresAt) {
    return {
      valid: false,
      message: 'Verification code has expired. Please request a new one.',
      shouldDeleteOtp: true
    }
  }

  if (otpData.email.toLowerCase() !== email.toLowerCase()) {
    return { valid: false, message: 'Email mismatch. Please use the same email you signed up with.' }
  }

  if (!otpData.password || typeof otpData.password !== 'string' || otpData.password.trim().length < 6) {
    return { valid: false, message: 'Password is invalid. Please sign up again.' }
  }

  return { valid: true }
}

export const executeVerifyEmailCodeAction = async ({
  email,
  verificationCode,
  identityEmail
}: ExecuteVerifyEmailCodeActionArgs): Promise<VerifyEmailCodeActionResult> => {
  if (verificationCode.length !== 6) {
    return { ok: false, message: 'Please enter a valid 6-digit verification code' }
  }

  const otpData: OtpPayload | null = await readOtpPayload(email)
  if (!otpData) {
    return { ok: false, message: 'Verification code expired or invalid. Please sign up again.' }
  }

  const validation = validateOtpPayload(otpData, verificationCode, email)
  if (!validation.valid) {
    if (validation.shouldDeleteOtp) {
      await deleteOtpPayload(email)
    }
    return { ok: false, message: validation.message }
  }

  const { authApi } = await import('@/lib/api')
  const signUpResult = await authApi.signUp(
    otpData.email.trim().toLowerCase(),
    otpData.password.trim(),
    otpData.username,
    otpData.username || otpData.email.split('@')[0]
  )

  if (signUpResult.error || !signUpResult.success) {
    return { ok: false, message: signUpResult.error || 'Failed to create account. Please try again.' }
  }

  const signUpData = signUpResult.data as AuthResultData | null
  if (!signUpData?.user) {
    return { ok: false, message: 'Failed to create account. Please try again.' }
  }

  await deleteOtpPayload(email)

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const autoSignInResult = await autoSignInAfterVerification({
      email: otpData.email,
      password: otpData.password,
      identityEmail
    })
    return {
      ok: true,
      signedIn: autoSignInResult.signedIn,
      message: autoSignInResult.message
    }
  } catch {
    return {
      ok: true,
      signedIn: false,
      message: 'Account created successfully! You can now sign in with your email and password.'
    }
  }
}
