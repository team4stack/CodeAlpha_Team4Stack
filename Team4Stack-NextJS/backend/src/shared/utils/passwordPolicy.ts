export const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include letters, numbers, and a special character.';

export function isStrongPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  if (password.length < 8) return false;
  if (!/[a-zA-Z]/.test(password)) return false;
  if (!/\d/.test(password)) return false;
  if (!/[^a-zA-Z0-9]/.test(password)) return false;
  return true;
}

export function validateStrongPassword(password: string): { valid: boolean; error?: string } {
  if (isStrongPassword(password)) {
    return { valid: true };
  }

  return { valid: false, error: STRONG_PASSWORD_MESSAGE };
}
