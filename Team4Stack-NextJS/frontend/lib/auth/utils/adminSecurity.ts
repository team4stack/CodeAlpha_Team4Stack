// Admin security — authorization is enforced on the API with HMAC admin tokens + roles.
// Do not rely on client env for secrecy; optional UX-only checks only.

/**
 * @deprecated Client cannot hold a secret allowlist. Server uses `ALLOWED_ADMIN_EMAILS` /
 * `SUPERADMIN_PRIMARY_EMAIL` at verify-password. Kept as `true` so legacy imports do not block UX.
 */
export const isEmailAllowedForAdmin = (_email: string): boolean => true;

/**
 * Verify admin row exists (e.g. via `superadminApi.checkAdminByEmail`).
 * Env allowlist removed from client — server decides at login.
 */
export const verifyAdminAccess = async (
  email: string,
  supabaseCheck: () => Promise<boolean>
): Promise<{ allowed: boolean; reason?: string }> => {
  if (!email || typeof email !== 'string') {
    return { allowed: false, reason: 'Invalid email' };
  }
  try {
    const supabaseAllowed = await supabaseCheck();
    if (!supabaseAllowed) {
      return { allowed: false, reason: 'Email not found in admin database' };
    }
  } catch {
    return { allowed: false, reason: 'Unable to verify admin status' };
  }
  return { allowed: true };
};

export const getAdminSecurityStatus = (): {
  envConfigured: boolean;
  allowedEmailsCount: number;
  allowedEmails: string[];
} => ({
  envConfigured: false,
  allowedEmailsCount: 0,
  allowedEmails: []
});
