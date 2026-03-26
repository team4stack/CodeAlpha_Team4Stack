type ResetPasswordActionResult =
  | { ok: false; message: string }
  | { ok: true; message: string }

export const executeResetPasswordAction = async (email: string): Promise<ResetPasswordActionResult> => {
  if (!email) {
    return { ok: false, message: 'Please enter your email address' }
  }

  const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || globalThis.window.location.origin
  const { authApi } = await import('@/lib/api')
  const result = await authApi.resetPassword(
    email,
    `${redirectUrl}${globalThis.window.location.pathname}#type=recovery`,
    globalThis.window.location.pathname
  )

  if (result.error || !result.success) {
    return { ok: false, message: result.error || 'Failed to send password reset email. Please try again.' }
  }

  return { ok: true, message: 'Password reset link sent to your email! Please check your inbox.' }
}
