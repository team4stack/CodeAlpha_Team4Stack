interface PasswordResetTokens {
  accessToken?: string
  refreshToken?: string
}

export const readPasswordResetTokens = (): PasswordResetTokens => {
  let accessToken: string | undefined
  let refreshToken: string | undefined

  try {
    const resetTokensRaw = localStorage.getItem('password_reset_tokens')
    if (resetTokensRaw) {
      const parsed = JSON.parse(resetTokensRaw) as { access_token?: string; refresh_token?: string }
      accessToken = parsed.access_token
      refreshToken = parsed.refresh_token
    }
  } catch {
    // Ignore malformed localStorage values and continue with hash parsing.
  }

  if (accessToken) {
    return { accessToken, refreshToken }
  }

  let hash = globalThis.window.location.hash
  if (hash.includes('#type=') && hash.includes('#access_token=')) {
    hash = hash.substring(1).replaceAll('#', '&')
    const hashParams = new URLSearchParams(hash)
    accessToken = hashParams.get('access_token') || undefined
    refreshToken = hashParams.get('refresh_token') || undefined
  }

  return { accessToken, refreshToken }
}
