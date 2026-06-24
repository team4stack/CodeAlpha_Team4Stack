import { generateSixDigitOtp, sendVerificationOtpEmail } from '@/lib/auth/components/auth-modal/otpEmail'
import { saveOtpPayload } from '@/lib/auth/components/auth-modal/otpStorage'
import { validateStrongPassword } from '@/lib/auth/utils/passwordPolicy'

type SignUpEmailActionResult =
  | { ok: false; message: string }
  | { ok: true; message: string; isVerifying: boolean }

interface ExecuteSignUpEmailActionArgs {
  email: string
  password: string
  confirmPassword: string
  username: string
}

export const executeSignUpEmailAction = async ({
  email,
  password,
  confirmPassword,
  username
}: ExecuteSignUpEmailActionArgs): Promise<SignUpEmailActionResult> => {
  if (!email || !password || !confirmPassword) {
    return { ok: false, message: 'Please fill in all required fields' }
  }
  if (password !== confirmPassword) {
    return { ok: false, message: 'Passwords do not match' }
  }
  const passwordCheck = validateStrongPassword(password)
  if (!passwordCheck.valid) {
    return { ok: false, message: passwordCheck.message! }
  }
  if (!username) {
    return { ok: false, message: 'Username is required' }
  }

  const usernameRegex = /^[a-z0-9_]{3,20}$/
  if (!usernameRegex.test(username.toLowerCase())) {
    return {
      ok: false,
      message: 'Username must be 3-20 characters, lowercase letters, numbers, and underscores only'
    }
  }

  const { usersApi } = await import('@/lib/api')
  const usernameCheck = await usersApi.getUserByUsername(username.toLowerCase())
  if (usernameCheck.success && usernameCheck.data) {
    return { ok: false, message: 'Username already taken. Please choose another one.' }
  }

  const otpCode = generateSixDigitOtp()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await saveOtpPayload(email, {
    code: otpCode,
    email: email.toLowerCase(),
    expiresAt: expiresAt.toISOString(),
    username: username.toLowerCase(),
    password
  })

  const emailSent = await sendVerificationOtpEmail({
    otpCode,
    userEmail: email,
    displayName: username
  })

  if (!emailSent) {
    return {
      ok: false,
      message: 'We could not send the verification code. Please try again in a few minutes.',
    }
  }

  return {
    ok: true,
    isVerifying: true,
    message: 'Verification code sent to your email! Please check your inbox (including spam folder).'
  }
}
