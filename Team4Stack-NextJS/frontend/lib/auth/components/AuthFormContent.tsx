import React from 'react'
import Link from 'next/link'
import type { AuthFormState } from '@/lib/auth/hooks/useAuthForm'
import { GitHubIcon, GoogleIcon } from '@/lib/auth/components/OAuthProviderIcons'
import PasswordStrengthHints from '@/lib/auth/components/PasswordStrengthHints'
import { checkPasswordStrength } from '@/lib/auth/utils/passwordPolicy'

type Props = AuthFormState & {
  recaptchaRef: React.RefObject<HTMLDivElement | null>
  showHeader?: boolean
  layout?: 'modal' | 'page'
  partnerHref?: string
  partnerMode?: 'login' | 'signup'
}

const AuthFormContent: React.FC<Props> = ({
  recaptchaRef,
  showHeader = true,
  layout = 'modal',
  partnerHref,
  partnerMode,
  isSignUp,
  isForgotPassword,
  isVerifying,
  isResettingPassword,
  loading,
  error,
  success,
  email,
  verificationCode,
  newPassword,
  confirmNewPassword,
  showNewPassword,
  showConfirmNewPassword,
  username,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  recaptchaToken,
  setEmail,
  setVerificationCode,
  setIsVerifying,
  setError,
  setSuccess,
  setIsResettingPassword,
  setIsForgotPassword,
  setNewPassword,
  setConfirmNewPassword,
  setShowNewPassword,
  setShowConfirmNewPassword,
  setUsername,
  setPassword,
  setConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  setRecaptchaToken,
  setIsSignUp,
  signInOAuth,
  verifyEmailCode,
  resendVerificationCode,
  updatePassword,
  resetPassword,
  signUpEmail,
  signInEmail,
}) => {
  const title = isVerifying
    ? 'Verify Email'
    : isResettingPassword
      ? 'Reset Password'
      : isForgotPassword
        ? 'Forgot Password'
        : isSignUp
          ? 'Create account'
          : 'Sign in'

  const signupPasswordStrong = checkPasswordStrength(password).isStrong
  const resetPasswordStrong = checkPasswordStrength(newPassword).isStrong

  return (
    <div className={`t4s-auth-form ${layout === 'page' ? 't4s-auth-form--page' : ''}`}>
      {showHeader ? (
        <div className={`t4s-auth-form__header ${layout === 'page' ? 't4s-auth-form__header--page' : ''}`}>
          {layout !== 'page' ? (
            <span className="t4s-auth-form__badge">Team4Stack</span>
          ) : null}
          <h1 className="t4s-auth-form__title">{title}</h1>
          {!isVerifying && !isResettingPassword && !isForgotPassword ? (
            <p className="t4s-auth-form__subtitle">
              {isSignUp
                ? 'Join to message developers, apply for courses, and manage projects.'
                : 'Access your client account, courses, and developer messaging.'}
            </p>
          ) : null}
        </div>
      ) : null}

      {!isForgotPassword && !isVerifying && !isResettingPassword && (
        <div className="t4s-auth-form__oauth t4s-auth-form__oauth--row">
          <button
            type="button"
            onClick={() => signInOAuth('google')}
            disabled={loading}
            className="t4s-auth-oauth-btn"
          >
            <span className="t4s-auth-oauth-btn__icon" aria-hidden>
              <GoogleIcon />
            </span>
            Google
          </button>
          <button
            type="button"
            onClick={() => signInOAuth('github')}
            disabled={loading}
            className="t4s-auth-oauth-btn"
          >
            <span className="t4s-auth-oauth-btn__icon t4s-auth-oauth-btn__icon--github" aria-hidden>
              <GitHubIcon />
            </span>
            GitHub
          </button>
        </div>
      )}

      {!isForgotPassword && !isVerifying && !isResettingPassword && (
        <div className="t4s-auth-form__divider">
          <span>or use email</span>
        </div>
      )}

      <div className="t4s-auth-form__fields">
        {isVerifying ? (
          <>
            <p className="t4s-auth-form__hint">
              Enter the 6-digit code sent to <strong>{email}</strong>. Expires in 10 minutes.
            </p>
            <input
              placeholder="000000"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="t4s-auth-input t4s-auth-input--code"
              maxLength={6}
            />
            {error ? <p className="t4s-auth-form__error">{error}</p> : null}
            {success ? <p className="t4s-auth-form__success">{success}</p> : null}
            <button
              type="button"
              onClick={verifyEmailCode}
              disabled={loading || verificationCode.length !== 6}
              className="t4s-auth-btn"
            >
              {loading ? 'Verifying…' : 'Verify & create account'}
            </button>
            <button type="button" onClick={resendVerificationCode} className="t4s-auth-link t4s-auth-link--block">
              Resend code
            </button>
            <button
              type="button"
              onClick={() => {
                setIsVerifying(false)
                setVerificationCode('')
                setError(null)
                setSuccess(null)
              }}
              className="t4s-auth-link t4s-auth-link--block"
            >
              Back to sign up
            </button>
          </>
        ) : isResettingPassword ? (
          <>
            <p className="t4s-auth-form__hint">Enter your new password below.</p>
            <PasswordInput
              placeholder="New password"
              value={newPassword}
              show={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
              onChange={(value) => {
                setNewPassword(value)
                if (confirmNewPassword && value !== confirmNewPassword) setError('Passwords do not match')
                else if (confirmNewPassword && value === confirmNewPassword) setError(null)
              }}
            />
            <PasswordStrengthHints password={newPassword} />
            <PasswordInput
              placeholder="Confirm new password"
              value={confirmNewPassword}
              show={showConfirmNewPassword}
              onToggle={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              onChange={(value) => {
                setConfirmNewPassword(value)
                if (newPassword && value !== newPassword) setError('Passwords do not match')
                else if (newPassword && value === newPassword) setError(null)
              }}
              invalid={Boolean(confirmNewPassword && newPassword && confirmNewPassword !== newPassword)}
              valid={Boolean(confirmNewPassword && newPassword && confirmNewPassword === newPassword)}
            />
            {error ? <p className="t4s-auth-form__error">{error}</p> : null}
            {success ? <p className="t4s-auth-form__success">{success}</p> : null}
            <button
              type="button"
              onClick={updatePassword}
              disabled={
                loading ||
                !newPassword ||
                !confirmNewPassword ||
                newPassword !== confirmNewPassword ||
                !resetPasswordStrong
              }
              className="t4s-auth-btn"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsResettingPassword(false)
                setIsForgotPassword(false)
                setNewPassword('')
                setConfirmNewPassword('')
                setError(null)
                setSuccess(null)
              }}
              className="t4s-auth-link t4s-auth-link--block"
            >
              Back to sign in
            </button>
          </>
        ) : isForgotPassword ? (
          <>
            <p className="t4s-auth-form__hint">We will email you a password reset link.</p>
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="t4s-auth-input"
            />
            {error ? <p className="t4s-auth-form__error">{error}</p> : null}
            {success ? <p className="t4s-auth-form__success">{success}</p> : null}
            <button type="button" onClick={resetPassword} disabled={loading} className="t4s-auth-btn">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false)
                setError(null)
                setSuccess(null)
              }}
              className="t4s-auth-link t4s-auth-link--block"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <>
            {isSignUp ? (
              <input
                placeholder="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="t4s-auth-input"
                maxLength={20}
                required
              />
            ) : null}
            <input
              placeholder={isSignUp ? 'Email' : 'Email or username'}
              type={isSignUp ? 'email' : 'text'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="t4s-auth-input"
            />
            <PasswordInput
              placeholder={isSignUp ? 'Password' : 'Password'}
              value={password}
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              onChange={(value) => {
                setPassword(value)
                if (isSignUp && confirmPassword && value !== confirmPassword) setError('Passwords do not match')
                else if (isSignUp && confirmPassword && value === confirmPassword) setError(null)
              }}
            />
            {isSignUp ? <PasswordStrengthHints password={password} /> : null}
            {!isSignUp ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true)
                  setPassword('')
                  setError(null)
                  setSuccess(null)
                }}
                className="t4s-auth-link t4s-auth-link--forgot"
              >
                Forgot password?
              </button>
            ) : null}
            {isSignUp ? (
              <PasswordInput
                placeholder="Confirm password"
                value={confirmPassword}
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                onChange={(value) => {
                  setConfirmPassword(value)
                  if (password && value !== password) setError('Passwords do not match')
                  else if (password && value === password) setError(null)
                }}
                invalid={Boolean(confirmPassword && password && confirmPassword !== password)}
                valid={Boolean(confirmPassword && password && confirmPassword === password)}
              />
            ) : null}

            {!isSignUp ? (
              <div className="t4s-auth-recaptcha">
                <div id="auth-recaptcha-container" ref={recaptchaRef} />
                {!recaptchaToken ? (
                  <p className="t4s-auth-recaptcha__hint">Complete reCAPTCHA to continue</p>
                ) : null}
              </div>
            ) : null}

            {error ? <p className="t4s-auth-form__error">{error}</p> : null}
            {success ? <p className="t4s-auth-form__success">{success}</p> : null}

            {isSignUp ? (
              <>
                <button
                  type="button"
                  onClick={signUpEmail}
                  disabled={loading || !signupPasswordStrong || !confirmPassword || password !== confirmPassword}
                  className="t4s-auth-btn"
                >
                  {loading ? 'Creating…' : 'Create account'}
                </button>
                <p className="t4s-auth-form__switch">
                  Already have an account?{' '}
                  {partnerHref && partnerMode === 'login' ? (
                    <Link href={partnerHref} className="t4s-auth-link">
                      Sign in
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false)
                        setUsername('')
                        setPassword('')
                        setConfirmPassword('')
                        setError(null)
                        setSuccess(null)
                        if (window.grecaptcha?.reset) {
                          try {
                            window.grecaptcha.reset()
                            setRecaptchaToken(null)
                          } catch {
                            // ignore
                          }
                        }
                      }}
                      className="t4s-auth-link"
                    >
                      Sign in
                    </button>
                  )}
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={signInEmail}
                  disabled={loading || !recaptchaToken}
                  className="t4s-auth-btn"
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
                <p className="t4s-auth-form__switch">
                  New here?{' '}
                  {partnerHref && partnerMode === 'signup' ? (
                    <Link href={partnerHref} className="t4s-auth-link">
                      Create account
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true)
                        setError(null)
                        setSuccess(null)
                        setRecaptchaToken(null)
                      }}
                      className="t4s-auth-link"
                    >
                      Create account
                    </button>
                  )}
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PasswordInput({
  placeholder,
  value,
  show,
  onToggle,
  onChange,
  invalid,
  valid,
}: {
  placeholder: string
  value: string
  show: boolean
  onToggle: () => void
  onChange: (value: string) => void
  invalid?: boolean
  valid?: boolean
}) {
  return (
    <div className="t4s-auth-password">
      <input
        placeholder={placeholder}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`t4s-auth-input ${invalid ? 't4s-auth-input--invalid' : ''} ${valid ? 't4s-auth-input--valid' : ''}`}
      />
      <button type="button" onClick={onToggle} className="t4s-auth-password__toggle" aria-label="Toggle password">
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}

export default AuthFormContent
