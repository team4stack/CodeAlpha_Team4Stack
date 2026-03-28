import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { canUseFunctionalCookies, readSavedSignInIdentity } from '@/lib/cookies/consent'
import { type OAuthProvider } from '@/lib/auth/components/auth-modal/oauthRedirect'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import AuthModalView from '@/lib/auth/components/auth-modal/AuthModalView'
import { useAuthModalPasswordResetCallback } from '@/lib/auth/components/auth-modal/useAuthModalPasswordResetCallback'
import { useAuthModalRecaptcha } from '@/lib/auth/components/auth-modal/useAuthModalRecaptcha'
import { notifyAuthSessionUpdatedAndReload } from '@/lib/auth/components/auth-modal/sessionPersistence'
import { executeResetPasswordAction } from '@/lib/auth/components/auth-modal/resetPasswordAction'
import { executeResendVerificationCodeAction } from '@/lib/auth/components/auth-modal/resendVerificationCodeAction'
import { executeSignInEmailAction } from '@/lib/auth/components/auth-modal/signInEmailAction'
import { executeSignUpEmailAction } from '@/lib/auth/components/auth-modal/signUpEmailAction'
import { executeUpdatePasswordAction } from '@/lib/auth/components/auth-modal/updatePasswordAction'
import { executeVerifyEmailCodeAction } from '@/lib/auth/components/auth-modal/verifyEmailCodeAction'

type Props = { isOpen: boolean; onClose: () => void; initialError?: string | null }

const AuthModal: React.FC<Props> = ({ isOpen, onClose, initialError }) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    try {
      if (canUseFunctionalCookies()) {
        const saved = readSavedSignInIdentity()
        if (saved?.email) setEmail(saved.email)
      }
    } catch {
      // ignore
    }
  }, [isOpen])

  useAuthModalPasswordResetCallback({
    isOpen,
    setError,
    setSuccess,
    setIsForgotPassword,
    setIsResettingPassword
  })

  // Set initial error when modal opens with OAuth error
  useEffect(() => {
    if (isOpen && initialError) {
      setError(initialError)
    }
  }, [isOpen, initialError])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => { if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose() }
    if (isOpen) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [isOpen, onClose])

  const signInOAuth = async (provider: OAuthProvider) => {
    setError(null)
    setLoading(true)
    try {
      if (!isSupabaseConfigured()) {
        setError('OAuth is not configured. Please contact support.')
        return
      }

      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || globalThis.window.location.origin
      const currentPath = globalThis.window.location.pathname
      const finalRedirectTo = `${redirectUrl}${currentPath}`

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: finalRedirectTo,
          queryParams: provider === 'google'
            ? { access_type: 'offline', prompt: 'consent' }
            : undefined,
          skipBrowserRedirect: true,
        }
      })

      if (oauthError) {
        setError(oauthError.message || 'Failed to initiate OAuth login. Please try again.')
        return
      }

      if (!data?.url) {
        setError('Failed to initiate OAuth login. Please try again.')
        return
      }

      globalThis.window.location.assign(data.url)
    } catch (err: unknown) {
      // Sanitize error message
      try {
        const { sanitizeError } = await import('@/lib/utils/errorHandler')
        const sanitized = sanitizeError(err)
        setError(sanitized.message)
      } catch {
        setError('Failed to initiate OAuth login. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  useAuthModalRecaptcha({
    isOpen,
    isSignUp,
    isForgotPassword,
    isVerifying,
    isResettingPassword,
    setRecaptchaToken
  })

  const signInEmail = async () => {
    try {
      setLoading(true)
      setError(null)

      const signIn = await executeSignInEmailAction({ email, password, recaptchaToken })
      if (!signIn.ok) {
        setError(signIn.message)
        setLoading(false)
        return
      }

      setSuccess('Signed in successfully!')
      toast.success('Signed in successfully!')
      try {
        globalThis.window.grecaptcha?.reset?.()
      } catch {
        // Silent fail
      }
      setRecaptchaToken(null)

      onClose()
      notifyAuthSessionUpdatedAndReload()
    } catch (err: unknown) {
      try {
        const { sanitizeError } = await import('@/lib/utils/errorHandler')
        const sanitized = sanitizeError(err)
        setError(sanitized.message)
      } catch {
        setError('An error occurred. Please try again.')
      }
    } finally { 
      setLoading(false) 
    }
  }

  const signUpEmail = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)

      const signUp = await executeSignUpEmailAction({
        email,
        password,
        confirmPassword,
        username
      })

      if (!signUp.ok) {
        setError(signUp.message)
        return
      }

      setIsVerifying(signUp.isVerifying)
      setSuccess(signUp.message)
    } finally { setLoading(false) }
  }

  const verifyEmailCode = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)
      const verificationResult = await executeVerifyEmailCodeAction({
        email,
        verificationCode,
        identityEmail: email.trim()
      })

      if (!verificationResult.ok) {
        setError(verificationResult.message)
        return
      }

      setSuccess(verificationResult.message)
      if (verificationResult.signedIn) {
        onClose()
        notifyAuthSessionUpdatedAndReload()
        return
      }

      setTimeout(() => {
        onClose()
        setIsVerifying(false)
        setVerificationCode('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setUsername('')
      }, 2000)
    } finally { setLoading(false) }
  }

  const resendVerificationCode = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)

      const resendResult = await executeResendVerificationCodeAction({ email, username })
      if (!resendResult.ok) {
        setError(resendResult.message)
        return
      }

      setSuccess(resendResult.message)
    } finally { setLoading(false) }
  }

  const resetPassword = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)

      const resetResult = await executeResetPasswordAction(email)
      if (!resetResult.ok) {
        setError(resetResult.message)
        return
      }
      setSuccess(resetResult.message)
    } catch (err: unknown) {
      try {
        const { sanitizeError } = await import('@/lib/utils/errorHandler')
        const sanitized = sanitizeError(err)
        setError(sanitized.message)
      } catch {
        setError('An error occurred. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const updatePassword = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)

      const updateResult = await executeUpdatePasswordAction({
        newPassword,
        confirmNewPassword
      })
      if (!updateResult.ok) {
        setError(updateResult.message)
        return
      }

      setSuccess(updateResult.message)
      setTimeout(() => {
        setIsResettingPassword(false)
        setNewPassword('')
        setConfirmNewPassword('')
        setEmail('')
        onClose()
      }, 2000)
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <AuthModalView
      isOpen={isOpen}
      onClose={onClose}
      panelRef={panelRef}
      recaptchaRef={recaptchaRef}
      isSignUp={isSignUp}
      isForgotPassword={isForgotPassword}
      isVerifying={isVerifying}
      isResettingPassword={isResettingPassword}
      loading={loading}
      error={error}
      success={success}
      email={email}
      verificationCode={verificationCode}
      newPassword={newPassword}
      confirmNewPassword={confirmNewPassword}
      showNewPassword={showNewPassword}
      showConfirmNewPassword={showConfirmNewPassword}
      username={username}
      password={password}
      confirmPassword={confirmPassword}
      showPassword={showPassword}
      showConfirmPassword={showConfirmPassword}
      recaptchaToken={recaptchaToken}
      setEmail={setEmail}
      setVerificationCode={setVerificationCode}
      setIsVerifying={setIsVerifying}
      setError={setError}
      setSuccess={setSuccess}
      setIsResettingPassword={setIsResettingPassword}
      setIsForgotPassword={setIsForgotPassword}
      setNewPassword={setNewPassword}
      setConfirmNewPassword={setConfirmNewPassword}
      setShowNewPassword={setShowNewPassword}
      setShowConfirmNewPassword={setShowConfirmNewPassword}
      setUsername={setUsername}
      setPassword={setPassword}
      setConfirmPassword={setConfirmPassword}
      setShowPassword={setShowPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      setRecaptchaToken={setRecaptchaToken}
      setIsSignUp={setIsSignUp}
      signInOAuth={signInOAuth}
      verifyEmailCode={verifyEmailCode}
      resendVerificationCode={resendVerificationCode}
      updatePassword={updatePassword}
      resetPassword={resetPassword}
      signUpEmail={signUpEmail}
      signInEmail={signInEmail}
    />
  )
}

export default AuthModal


