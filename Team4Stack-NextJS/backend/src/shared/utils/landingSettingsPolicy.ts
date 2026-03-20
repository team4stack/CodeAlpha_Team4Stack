/**
 * Site settings keys used for ephemeral OTP / verification payloads (signup, account delete).
 * These must stay writable without an admin token so public auth flows keep working.
 */
export function isPublicOtpSettingKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false;
  const k = key.trim();
  return /^(otp_|delete_otp_)[a-z0-9_]+$/i.test(k);
}

export function areAllPublicOtpSettingKeys(keys: string[]): boolean {
  return keys.length > 0 && keys.every((k) => isPublicOtpSettingKey(k));
}
