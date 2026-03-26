import type { OtpPayload, SiteSettingEntry } from '@/lib/auth/components/auth-modal/types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toOtpPayload = (value: unknown): OtpPayload | null => {
  if (!isRecord(value)) return null
  const code = typeof value.code === 'string' ? value.code : null
  const email = typeof value.email === 'string' ? value.email : null
  const expiresAt = typeof value.expiresAt === 'string' ? value.expiresAt : null
  const username = typeof value.username === 'string' ? value.username : null
  const password = typeof value.password === 'string' ? value.password : null
  if (!code || !email || !expiresAt || !username || !password) return null
  return { code, email, expiresAt, username, password }
}

export const buildOtpStorageKey = (email: string) =>
  `otp_${email.toLowerCase().replaceAll(/[^a-z0-9]/g, '_')}`

export const saveOtpPayload = async (email: string, payload: OtpPayload) => {
  const storageKey = buildOtpStorageKey(email)
  const serialized = JSON.stringify(payload)

  try {
    const { landingApi } = await import('@/lib/api')
    const result = await landingApi.upsertSiteSetting(storageKey, serialized)
    if (result.error) {
      localStorage.setItem(`otp_${email}`, serialized)
    }
  } catch {
    localStorage.setItem(`otp_${email}`, serialized)
  }
}

export const readOtpPayload = async (email: string): Promise<OtpPayload | null> => {
  const storageKey = buildOtpStorageKey(email)

  try {
    const { landingApi } = await import('@/lib/api')
    const result = await landingApi.getSiteSettings([storageKey])
    if (result.success && Array.isArray(result.data) && result.data.length > 0) {
      const settings = result.data as SiteSettingEntry[]
      const setting = settings.find((entry) => entry.key === storageKey)
      if (setting?.value) {
        const parsed = toOtpPayload(JSON.parse(setting.value))
        if (parsed) return parsed
      }
    }
  } catch {
    // fallback to localStorage
  }

  try {
    const local = localStorage.getItem(`otp_${email}`)
    if (!local) return null
    return toOtpPayload(JSON.parse(local))
  } catch {
    return null
  }
}

export const deleteOtpPayload = async (email: string) => {
  const storageKey = buildOtpStorageKey(email)
  try {
    const { landingApi } = await import('@/lib/api')
    await landingApi.deleteSiteSettings([storageKey])
  } catch {
    // ignore
  }
  localStorage.removeItem(`otp_${email}`)
}
