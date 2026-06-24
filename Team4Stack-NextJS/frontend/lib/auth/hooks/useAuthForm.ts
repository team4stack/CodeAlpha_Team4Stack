'use client'

import { useEffect, useRef, useState } from 'react'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'
import toast from 'react-hot-toast'
import { canUseFunctionalCookies, readSavedSignInIdentity } from '@/lib/cookies/consent'
import { type OAuthProvider } from '@/lib/auth/components/auth-modal/oauthRedirect'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import { useAuthModalPasswordResetCallback } from '@/lib/auth/components/auth-modal/useAuthModalPasswordResetCallback'
import { useAuthModalRecaptcha } from '@/lib/auth/components/auth-modal/useAuthModalRecaptcha'
import { notifyAuthSessionUpdatedAndReload } from '@/lib/auth/components/auth-modal/sessionPersistence'
import { executeResetPasswordAction } from '@/lib/auth/components/auth-modal/resetPasswordAction'
import { executeResendVerificationCodeAction } from '@/lib/auth/components/auth-modal/resendVerificationCodeAction'
import { executeSignInEmailAction } from '@/lib/auth/components/auth-modal/signInEmailAction'
import { executeSignUpEmailAction } from '@/lib/auth/components/auth-modal/signUpEmailAction'
import { executeUpdatePasswordAction } from '@/lib/auth/components/auth-modal/updatePasswordAction'
import { executeVerifyEmailCodeAction } from '@/lib/auth/components/auth-modal/verifyEmailCodeAction'

type Options = {
  active?: boolean
  initialError?: string | null
  initialSignUp?: boolean
  authPath?: '/login' | '/signup'
  returnTo?: string | null
  onSuccess?: () => void
}

export function useAuthForm({
  active = true,
  initialError,
  initialSignUp = false,
  authPath = '/login',
  returnTo,
  onSuccess,
}: Options = {}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const recaptchaRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isSignUp, setIsSignUp] = useState(initialSignUp)
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

  const completeAuth = () => {
    if (onSuccess) {
      onSuccess()
      return
    }
    notifyAuthSessionUpdatedAndReload()
  }

  useEffect(() => {
    if (!active) return
    try {
      if (canUseFunctionalCookies()) {
        const saved = readSavedSignInIdentity()
        if (saved?.email) setEmail(saved.email)
      }
    } catch {
      // ignore
    }
  }, [active])

  useAuthModalPasswordResetCallback({
    isOpen: active,
    setError,
    setSuccess,
    setIsForgotPassword,
    setIsResettingPassword,
  })

  useEffect(() => {
    if (active && initialError) setError(getUserFriendlyMessage(initialError))
  }, [active, initialError])

  useAuthModalRecaptcha({
    isOpen: active,
    isSignUp,
    isForgotPassword,
    isVerifying,
    isResettingPassword,
    setRecaptchaToken,
  })

  const signInOAuth = async (provider: OAuthProvider) => {
    setError(null)
    setLoading(true)
    try {
      if (!isSupabaseConfigured()) {
        setError('Sign in with this provider is not available right now. Please use email sign in or contact support.')
        return
      }

      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || globalThis.window.location.origin
      const safeReturn = returnTo && returnTo.startsWith('/') ? returnTo : null
      const loginPath = safeReturn
        ? `${authPath}?returnTo=${encodeURIComponent(safeReturn)}`
        : authPath
      const finalRedirectTo = `${redirectUrl}${loginPath}`

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: finalRedirectTo,
          queryParams:
            provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : undefined,
          skipBrowserRedirect: true,
        },
      })

      if (oauthError) {
        setError(getUserFriendlyMessage(oauthError.message, 'Sign in failed. Please try again.'))
        return
      }

      if (!data?.url) {
        setError('Sign in failed. Please try again.')
        return
      }

      globalThis.window.location.assign(data.url)
    } catch (err: unknown) {
      setError(getUserFriendlyMessage(err, 'Sign in failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const signInEmail = async () => {
    try {
      setLoading(true)
      setError(null)

      const signIn = await executeSignInEmailAction({ email, password, recaptchaToken })
      if (!signIn.ok) {
        setError(getUserFriendlyMessage(signIn.message))
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
      completeAuth()
    } catch (err: unknown) {
      setError(getUserFriendlyMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const signUpEmail = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const signUp = await executeSignUpEmailAction({
        email,
        password,
        confirmPassword,
        username,
      })

      if (!signUp.ok) {
        setError(getUserFriendlyMessage(signUp.message))
        return
      }

      setIsVerifying(signUp.isVerifying)
      setSuccess(signUp.message)
    } finally {
      setLoading(false)
    }
  }

  const verifyEmailCode = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      const verificationResult = await executeVerifyEmailCodeAction({
        email,
        verificationCode,
        identityEmail: email.trim(),
      })

      if (!verificationResult.ok) {
        setError(getUserFriendlyMessage(verificationResult.message))
        return
      }

      setSuccess(verificationResult.message)
      if (verificationResult.signedIn) {
        completeAuth()
        return
      }

      setTimeout(() => {
        setIsVerifying(false)
        setVerificationCode('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setUsername('')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const resendVerificationCode = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const resendResult = await executeResendVerificationCodeAction({ email, username })
      if (!resendResult.ok) {
        setError(getUserFriendlyMessage(resendResult.message))
        return
      }

      setSuccess(resendResult.message)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const resetResult = await executeResetPasswordAction(email)
      if (!resetResult.ok) {
        setError(getUserFriendlyMessage(resetResult.message))
        return
      }
      setSuccess(resetResult.message)
    } catch (err: unknown) {
      setError(getUserFriendlyMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const updateResult = await executeUpdatePasswordAction({
        newPassword,
        confirmNewPassword,
      })
      if (!updateResult.ok) {
        setError(getUserFriendlyMessage(updateResult.message))
        return
      }

      setSuccess(updateResult.message)
      setTimeout(() => {
        setIsResettingPassword(false)
        setNewPassword('')
        setConfirmNewPassword('')
        setEmail('')
        completeAuth()
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  return {
    panelRef,
    recaptchaRef,
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
  }
}

export type AuthFormState = ReturnType<typeof useAuthForm>
