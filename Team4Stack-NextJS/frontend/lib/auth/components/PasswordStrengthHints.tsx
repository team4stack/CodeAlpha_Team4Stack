import React from 'react'
import { checkPasswordStrength } from '@/lib/auth/utils/passwordPolicy'

type Props = {
  password: string
  className?: string
}

const PasswordStrengthHints: React.FC<Props> = ({ password, className = '' }) => {
  if (!password) return null

  const strength = checkPasswordStrength(password)

  return (
    <div className={`t4s-auth-password-hints ${className}`.trim()} aria-live="polite">
      <p className={strength.hasMinLength ? 't4s-auth-password-hints__ok' : ''}>
        {strength.hasMinLength ? '✓' : '•'} Minimum 8 characters
      </p>
      <p className={strength.hasLetter ? 't4s-auth-password-hints__ok' : ''}>
        {strength.hasLetter ? '✓' : '•'} Contains letters
      </p>
      <p className={strength.hasNumber ? 't4s-auth-password-hints__ok' : ''}>
        {strength.hasNumber ? '✓' : '•'} Contains numbers
      </p>
      <p className={strength.hasSpecial ? 't4s-auth-password-hints__ok' : ''}>
        {strength.hasSpecial ? '✓' : '•'} Contains special character
      </p>
    </div>
  )
}

export default PasswordStrengthHints
