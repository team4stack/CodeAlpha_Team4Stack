// Re-export canonical admin security helpers (single source of truth).
export {
  isEmailAllowedForAdmin,
  verifyAdminAccess,
  getAdminSecurityStatus
} from '@/lib/auth/utils/adminSecurity';
