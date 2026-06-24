import { readPasswordResetTokens } from '@/lib/auth/components/auth-modal/passwordResetTokens'
import { validateStrongPassword } from '@/lib/auth/utils/passwordPolicy'

type UpdatePasswordActionResult =
  | { ok: false; message: string }
  | { ok: true; message: string }

interface ExecuteUpdatePasswordActionArgs {
  newPassword: string
  confirmNewPassword: string
}

export const executeUpdatePasswordAction = async ({
  newPassword,
  confirmNewPassword
}: ExecuteUpdatePasswordActionArgs): Promise<UpdatePasswordActionResult> => {
  if (!newPassword || !confirmNewPassword) {
    return { ok: false, message: 'Please fill in all password fields' }
  }
  if (newPassword !== confirmNewPassword) {
    return { ok: false, message: 'Passwords do not match' }
  }
  const passwordCheck = validateStrongPassword(newPassword)
  if (!passwordCheck.valid) {
    return { ok: false, message: passwordCheck.message! }
  }

  const { accessToken, refreshToken } = readPasswordResetTokens()
  if (!accessToken) {
    return { ok: false, message: 'Session expired. Please request a new password reset link.' }
  }

  const { authApi } = await import('@/lib/api')
  const result = await authApi.updatePassword(newPassword, accessToken, refreshToken)
  if (result.error || !result.success) {
    return { ok: false, message: result.error || 'An error occurred. Please try again.' }
  }

  try {
    localStorage.removeItem('password_reset_tokens')
  } catch {
    // ignore storage removal errors
  }

  return { ok: true, message: 'Password updated successfully! You can now sign in with your new password.' }
}
