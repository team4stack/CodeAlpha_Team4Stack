export const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include letters, numbers, and a special character.'

export type PasswordStrengthCheck = {
  hasMinLength: boolean
  hasLetter: boolean
  hasNumber: boolean
  hasSpecial: boolean
  isStrong: boolean
}

export function checkPasswordStrength(password: string): PasswordStrengthCheck {
  const hasMinLength = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)

  return {
    hasMinLength,
    hasLetter,
    hasNumber,
    hasSpecial,
    isStrong: hasMinLength && hasLetter && hasNumber && hasSpecial,
  }
}

export function validateStrongPassword(password: string): { valid: boolean; message?: string } {
  if (checkPasswordStrength(password).isStrong) {
    return { valid: true }
  }

  return { valid: false, message: STRONG_PASSWORD_MESSAGE }
}
