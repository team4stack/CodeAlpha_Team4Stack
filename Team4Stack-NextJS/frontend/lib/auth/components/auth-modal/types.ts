export type UserLookupData = { email?: string; is_blocked?: boolean; [key: string]: unknown }

export type SiteSettingEntry = { key: string; value?: string }

export type AuthSessionData = {
  access_token: string
  refresh_token: string
  expires_at?: number
  expires_in?: number
}

export type AuthResultData = { session?: AuthSessionData; user?: Record<string, unknown> | null }

export type OtpPayload = {
  code: string
  email: string
  expiresAt: string
  username: string
  password: string
}
