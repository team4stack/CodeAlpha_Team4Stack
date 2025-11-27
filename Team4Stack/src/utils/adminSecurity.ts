// Admin Security Utility
// Multi-layer security: Environment Variable + Supabase Table
// Even if Supabase is hacked, admin access is protected by environment variables

/**
 * Get allowed admin emails from environment variable
 * Format: comma-separated emails (e.g., "admin1@example.com,admin2@example.com")
 */
const getAllowedAdminEmails = (): string[] => {
  const envAdmins = import.meta.env.VITE_ALLOWED_ADMIN_EMAILS as string | undefined;
  
  if (!envAdmins || typeof envAdmins !== 'string') {
    // If environment variable is not set, return empty array (no access)
    return [];
  }

  // Parse comma-separated emails
  return envAdmins
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0 && email.includes('@'));
};

/**
 * Check if email is in the allowed admin list (from environment variable)
 * This is the FIRST security layer - even before Supabase check
 */
export const isEmailAllowedForAdmin = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const allowedEmails = getAllowedAdminEmails();

  // If no allowed emails in environment variable, deny access
  if (allowedEmails.length === 0) {
    return false;
  }

  // Check if email is in allowed list
  return allowedEmails.includes(normalizedEmail);
};

/**
 * Verify admin access with multi-layer security:
 * 1. Environment variable check (FIRST - most secure)
 * 2. Supabase table check (SECOND - can be compromised)
 * 
 * Both must pass for access to be granted
 */
export const verifyAdminAccess = async (
  email: string,
  supabaseCheck: () => Promise<boolean>
): Promise<{ allowed: boolean; reason?: string }> => {
  // Step 1: Environment variable check (FIRST - cannot be hacked via Supabase)
  if (!isEmailAllowedForAdmin(email)) {
    return {
      allowed: false,
      reason: 'Email not authorized in system configuration'
    };
  }

  // Step 2: Supabase table check (SECOND - can be compromised, but still checked)
  try {
    const supabaseAllowed = await supabaseCheck();
    if (!supabaseAllowed) {
      return {
        allowed: false,
        reason: 'Email not found in admin database'
      };
    }
  } catch (error) {
    // If Supabase check fails, deny access (fail-secure)
    return {
      allowed: false,
      reason: 'Unable to verify admin status'
    };
  }

  // Both checks passed
  return { allowed: true };
};

/**
 * Get security status (for debugging - only in development)
 */
export const getAdminSecurityStatus = (): {
  envConfigured: boolean;
  allowedEmailsCount: number;
  allowedEmails: string[];
} => {
  const allowedEmails = getAllowedAdminEmails();
  
  return {
    envConfigured: allowedEmails.length > 0,
    allowedEmailsCount: allowedEmails.length,
    allowedEmails: import.meta.env.DEV ? allowedEmails : [] // Only show in development
  };
};

