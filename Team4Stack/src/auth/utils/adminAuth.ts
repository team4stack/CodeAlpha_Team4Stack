// Admin Authentication Utilities
// Handles admin password verification and admin token management

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_TOKEN_EXPIRY_KEY = 'admin_token_expiry';

export interface AdminToken {
  auth_id: string;
  email: string;
  role: 'admin';
  exp: number;
}

/**
 * Store admin token in memory (localStorage as fallback for persistence)
 */
export const setAdminToken = (token: string, expiresAt: number): void => {
  // Store in memory (preferred) and localStorage (fallback)
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      sessionStorage.setItem(ADMIN_TOKEN_EXPIRY_KEY, expiresAt.toString());
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('Failed to store admin token:', e);
      }
    }
  }
};

/**
 * Get admin token from storage
 */
export const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const expiry = sessionStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return null;
    
    // Check if token is expired
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() >= expiryTime) {
      clearAdminToken();
      return null;
    }
    
    return token;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('Failed to get admin token:', e);
    }
    return null;
  }
};

/**
 * Clear admin token
 */
export const clearAdminToken = (): void => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('Failed to clear admin token:', e);
      }
    }
  }
};

/**
 * Check if admin token is valid
 */
export const isAdminTokenValid = (): boolean => {
  const token = getAdminToken();
  return token !== null;
};

/**
 * Verify admin password directly with Supabase
 * No server endpoint needed - directly checks admin_users table
 */
export const verifyAdminPassword = async (
  adminPassword: string,
  userEmail: string
): Promise<{ success: boolean; token?: string; expiresAt?: number; error?: string }> => {
  try {
    const { supabase } = await import('../../utils/supabaseClient');
    
    // Verify password using Supabase RPC function
    const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_admin_password', {
      p_email: userEmail.toLowerCase().trim(),
      p_password: adminPassword
    });

    if (verifyError) {
      // No sensitive info in logs
      return { success: false, error: verifyError.message || 'Failed to verify password. Please try again.' };
    }

    // Check result - RPC function returns JSON object
    // Result format: { valid: true/false, message/error: string }
    const isValid = verifyResult && typeof verifyResult === 'object' && verifyResult.valid === true;
    
    if (isValid) {
      // Password is valid, create admin token
      const expiresAt = Date.now() + (15 * 60 * 1000); // 15 minutes
      const token = btoa(JSON.stringify({
        email: userEmail,
        role: 'admin',
        exp: Math.floor(expiresAt / 1000)
      }));
      
      return {
        success: true,
        token,
        expiresAt
      };
    }

    return { success: false, error: verifyResult?.error || 'Invalid admin password. Please check your password and try again.' };
  } catch (error: any) {
    // No sensitive info in logs
    return {
      success: false,
      error: 'Failed to verify admin password. Please try again.'
    };
  }
};

/**
 * Decode admin token (JWT payload)
 * Note: This is a simple base64 decode. For production, use a proper JWT library
 */
export const decodeAdminToken = (token: string): AdminToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as AdminToken;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Failed to decode admin token:', e);
    }
    return null;
  }
};

