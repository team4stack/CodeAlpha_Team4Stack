import { generateSixDigitOtp, sendVerificationOtpEmail } from '@/lib/auth/components/auth-modal/otpEmail'
import { readOtpPayload, saveOtpPayload } from '@/lib/auth/components/auth-modal/otpStorage'

type ResendVerificationCodeActionResult =
  | { ok: false; message: string }
  | { ok: true; message: string }

interface ExecuteResendVerificationCodeActionArgs {
  email: string
  username: string
}

export const executeResendVerificationCodeAction = async ({
  email,
  username
}: ExecuteResendVerificationCodeActionArgs): Promise<ResendVerificationCodeActionResult> => {
  const otpCode = generateSixDigitOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  const storedData = await readOtpPayload(email)
  if (!storedData) {
    return { ok: false, message: 'Session expired. Please sign up again.' }
  }

  await saveOtpPayload(email, {
    ...storedData,
    code: otpCode,
    expiresAt: expiresAt.toISOString()
  })

  const emailSent = await sendVerificationOtpEmail({
    otpCode,
    userEmail: email,
    displayName: username
  })

  if (!emailSent) {
    return { ok: false, message: 'Failed to resend verification code. Please try again.' }
  }

  return { ok: true, message: 'Verification code resent to your email!' }
}
