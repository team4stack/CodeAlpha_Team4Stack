import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import emailjs from '@emailjs/browser'
import { RECAPTCHA_SITE_KEY } from '../../utils/constants'

// Extend window interface for reCAPTCHA
declare global {
  interface Window {
    grecaptcha: any;
  }
}

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

  // Handle password reset callback from Supabase
  useEffect(() => {
    const handlePasswordReset = async () => {
      // Check if URL has password reset token (even if modal not open yet)
      let hash = window.location.hash;
      
      // Handle double hash format: #type=recovery#access_token=...
      if (hash.includes('#type=') && hash.includes('#access_token=')) {
        // Extract everything after first #
        hash = hash.substring(1);
        // Replace all # with & to make it a proper query string
        hash = hash.replace(/#/g, '&');
      }
      
      const hashParams = new URLSearchParams(hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')
      
      if (type === 'recovery' && accessToken) {
        // Set the session first using the recovery token
        try {
          const { data: { session }, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })
          
          if (setSessionError) {
            // No sensitive info in logs
            setError('Invalid or expired reset link. Please request a new password reset link.')
            return
          }
          
          if (session) {
            // Password reset link clicked - show reset form
            setIsForgotPassword(false)
            setIsResettingPassword(true)
            setError(null)
            setSuccess('Please enter your new password')
            
            // Clear URL hash
            window.history.replaceState(null, '', window.location.pathname)
          } else {
            setError('Failed to authenticate. Please request a new password reset link.')
          }
        } catch (err: any) {
          // No sensitive info in logs
          setError('Failed to process reset link. Please request a new password reset link.')
        }
      }
    }
    
    // Always check on mount and when modal opens
    handlePasswordReset()
  }, [isOpen])

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

  const signInOAuth = async (provider: 'google' | 'github') => {
    setError(null)
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
        // No console warnings - silent fail for security
        // Always show generic message to users (production-safe)
        setError('Authentication service is temporarily unavailable. Please contact support.')
        return
      }
      
      // Get the current site URL for redirect after OAuth
      // The redirectTo should be where user lands after OAuth completes
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      
      // Supabase OAuth automatically handles the callback through Supabase
      // We just need to specify where to redirect after successful auth
      const { data, error } = await supabase.auth.signInWithOAuth({ 
        provider, 
        options: { 
          redirectTo: `${redirectUrl}${window.location.pathname}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        } 
      })
      
      if (error) {
        setError(error.message)
      }
      // If successful, data.url will contain the OAuth URL and user will be redirected
      // No need to handle success here as user will be redirected
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate OAuth login. Please try again.')
    }
  }

  // Initialize reCAPTCHA when component mounts and modal is open (only for sign-in)
  useEffect(() => {
    if (!isOpen || isSignUp || isForgotPassword || isVerifying || isResettingPassword) {
      // Only show reCAPTCHA for sign-in
      return;
    }

    // Load reCAPTCHA script
    const loadRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render) {
        window.grecaptcha.ready(() => {
          const container = document.getElementById('auth-recaptcha-container');
          if (container && container.children.length === 0) {
            try {
              window.grecaptcha.render("auth-recaptcha-container", {
                sitekey: RECAPTCHA_SITE_KEY,
                callback: (token: string) => {
                  setRecaptchaToken(token);
                },
                'expired-callback': () => {
                  setRecaptchaToken(null);
                },
                'error-callback': () => {
                  setRecaptchaToken(null);
                }
              });
            } catch (error) {
              if (process.env.NODE_ENV === 'development') {
                console.error('reCAPTCHA render error:', error);
              }
            }
          }
        });
      } else {
        setTimeout(loadRecaptcha, 500);
      }
    };

    // Check if script already exists
    if (document.querySelector('script[src*="recaptcha"]')) {
      loadRecaptcha();
    } else {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      script.onload = loadRecaptcha;
      document.body.appendChild(script);
    }

    // Cleanup
    return () => {
      if (window.grecaptcha && window.grecaptcha.reset) {
        try {
          window.grecaptcha.reset();
        } catch (error) {
          // Silent fail
        }
      }
    };
  }, [isOpen, isSignUp, isForgotPassword, isVerifying, isResettingPassword]);

  const signInEmail = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
        // No console warnings - silent fail for security
        // Always show generic message to users (production-safe)
        setError('Authentication service is temporarily unavailable. Please try again later.')
        setLoading(false)
        return
      }
      
      if (!email || !password) {
        setError('Please enter both email and password')
        setLoading(false)
        return
      }

      // Check reCAPTCHA for sign-in
      let token = recaptchaToken;
      if (!token && window.grecaptcha) {
        try {
          const recaptchaResponse = window.grecaptcha.getResponse();
          if (recaptchaResponse) {
            token = recaptchaResponse;
          }
        } catch (e) {
          // Silent fail
        }
      }
      
      if (!token) {
        setError('Please complete the reCAPTCHA verification')
        setLoading(false)
        return
      }
      
      // Check if input is username or email
      let loginEmail = email.trim().toLowerCase()
      if (!email.includes('@')) {
        // It's a username, find the email via backend API
        try {
          const { usersApi } = await import('@/lib/api')
          const result = await usersApi.getUserByUsername(email.toLowerCase().trim())
          
          if (!result.success || !result.data) {
            setError('Username not found. Please use your email address.')
            setLoading(false)
            return
          }
          
          const userData = result.data
          
          // Check if user is blocked
          if (userData.is_blocked === true) {
            setError('Your account has been suspended. Please contact support.')
            setLoading(false)
            return
          }
          
          loginEmail = userData.email.toLowerCase().trim()
        } catch (err) {
          setError('Failed to verify username. Please use your email address.')
          setLoading(false)
          return
        }
      } else {
        // It's an email, check if user is blocked via backend API
        try {
          const { usersApi } = await import('@/lib/api')
          const result = await usersApi.getUserByEmail(loginEmail)
          
          if (result.success && result.data && result.data.is_blocked === true) {
            setError('Your account has been suspended. Please contact support.')
            setLoading(false)
            return
          }
        } catch (err) {
          // Continue with login attempt even if check fails
        }
      }
      
      // Ensure password is not empty and is a string
      if (!password || typeof password !== 'string' || password.trim().length === 0) {
        setError('Password is required')
        setLoading(false)
        return
      }
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ 
        email: loginEmail.trim(), 
        password: password.trim() 
      })
      
      if (signInError) {
        // Generic error message - no sensitive info
        setError('Invalid email or password.')
      } else if (signInData?.user) {
        // Double-check blocked status after successful auth (in case it was changed during login)
        try {
          const { usersApi } = await import('@/lib/api')
          const result = await usersApi.getUserByEmail(loginEmail)
          
          if (result.success && result.data && result.data.is_blocked === true) {
            // User was blocked, sign them out
            await supabase.auth.signOut()
            setError('Your account has been suspended. Please contact support.')
            setLoading(false)
            return
          }
        } catch (err) {
          // Continue even if check fails
        }
        
        // Success - session is automatically saved by Supabase
        setSuccess('Signed in successfully!')
        // Reset reCAPTCHA
        if (window.grecaptcha && window.grecaptcha.reset) {
          try {
            window.grecaptcha.reset();
            setRecaptchaToken(null);
          } catch (e) {
            // Silent fail
          }
        }
        // Reload page to ensure session is properly loaded across all pages
        // Session is already saved in localStorage, so reload will load it properly
        setTimeout(() => {
          window.location.reload()
        }, 800)
      }
    } catch (err: any) {
      // Generic error message - no sensitive info
      setError('An error occurred. Please try again.')
    } finally { 
      setLoading(false) 
    }
  }

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const sendOTPEmail = async (otpCode: string, userEmail: string): Promise<boolean> => {
    try {
      // EmailJS configuration
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

      // Check if EmailJS is configured
      if (!serviceId || !templateId || !publicKey || 
          serviceId === 'your_service_id' || 
          templateId === 'your_template_id' || 
          publicKey === 'your_public_key' ||
          serviceId.trim() === '' || 
          templateId.trim() === '' || 
          publicKey.trim() === '') {
        // No sensitive info in logs
        return false
      }

      // Initialize EmailJS with public key
      try {
        emailjs.init(publicKey)
      } catch (initError) {
        // No sensitive info in logs
      }

      // Template parameters - use common variable names that work with most templates
      const templateParams: Record<string, string> = {
        // Most common variable names
        'to_email': userEmail,
        'to_name': username || userEmail.split('@')[0],
        'verification_code': otpCode,
        'code': otpCode,
        'otp': otpCode,
        'verification_code_6': otpCode,
        'user_email': userEmail,
        'user_name': username || userEmail.split('@')[0],
        'email': userEmail,
        'name': username || userEmail.split('@')[0],
        'from_name': 'Team4Stack',
        'subject': 'Team4Stack - Email Verification Code',
        'message': `Your verification code is: ${otpCode}. This code expires in 10 minutes.`
      }

      // Debug: Log in development only
      if (process.env.NODE_ENV === 'development') {
        // No sensitive info in logs
      }

      // Send email via EmailJS
      const response = await emailjs.send(
        serviceId.trim(), 
        templateId.trim(), 
        templateParams, 
        publicKey.trim()
      )
      
      if (response && response.status === 200) {
        return true
      } else {
        return false
      }
    } catch (error: any) {
      // No sensitive info in logs
      return false
    }
  }

  const signUpEmail = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)
      
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
        // No console warnings - silent fail for security
        // Always show generic message to users (production-safe)
        setError('Authentication service is temporarily unavailable. Please try again later.')
        setLoading(false)
        return
      }
      
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all required fields')
        return
      }
      // Real-time password mismatch check is done in the UI
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      if (!username) {
        setError('Username is required')
        return
      }
      // Validate username format
      const usernameRegex = /^[a-z0-9_]{3,20}$/
      if (!usernameRegex.test(username.toLowerCase())) {
        setError('Username must be 3-20 characters, lowercase letters, numbers, and underscores only')
        return
      }
      // Check if username already exists via API
      const usernameCheck = await usersApi.getUserByUsername(username.toLowerCase())
      if (usernameCheck.success && usernameCheck.data) {
        setError('Username already taken. Please choose another one.')
        return
      }
      
      // Generate 6-digit OTP
      const otpCode = generateOTP()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      
      // Store OTP via API (using site_settings) or localStorage as fallback
      const storageKey = `otp_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      const otpValue = JSON.stringify({
        code: otpCode,
        email: email.toLowerCase(),
        expiresAt: expiresAt.toISOString(),
        username: username.toLowerCase(),
        password: password // Store password for account creation
      })
      
      try {
        // Try to store in site_settings via API
        const { landingApi } = await import('@/lib/api')
        const result = await landingApi.upsertSiteSetting(storageKey, otpValue)
        
        if (result.error) {
          // Fallback: use localStorage if API fails
          localStorage.setItem(`otp_${email}`, otpValue)
        }
      } catch (e) {
        // Fallback to localStorage
        localStorage.setItem(`otp_${email}`, otpValue)
      }
      
      // Send OTP via EmailJS
      const emailSent = await sendOTPEmail(otpCode, email)
      
      if (emailSent) {
        setIsVerifying(true)
        setSuccess('Verification code sent to your email! Please check your inbox (including spam folder).')
      } else {
        setError('Failed to send verification code. Please check your EmailJS configuration and try again.')
        // No sensitive info in logs
      }
    } finally { setLoading(false) }
  }

  const verifyEmailCode = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)
      if (!verificationCode || verificationCode.length !== 6) {
        setError('Please enter a valid 6-digit verification code')
        return
      }
      
      // Retrieve OTP from API or localStorage
      let otpData: any = null
      const storageKey = `otp_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      
      try {
        const { landingApi } = await import('@/lib/api')
        const result = await landingApi.getSiteSettings([storageKey])
        
        // Check if data exists
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          const setting = result.data.find((s: any) => s.key === storageKey)
          if (setting?.value) {
            try {
              otpData = JSON.parse(setting.value)
            } catch (parseError) {
              // Invalid JSON, try localStorage
            }
          }
        }
      } catch (e) {
        // API error, try localStorage
      }
      
      // Fallback to localStorage if Supabase didn't work
      if (!otpData) {
        try {
          const stored = localStorage.getItem(`otp_${email}`)
          if (stored) {
            otpData = JSON.parse(stored)
          }
        } catch (e) {
          // localStorage parse error
        }
      }
      
      if (!otpData) {
        setError('Verification code expired or invalid. Please sign up again.')
        return
      }
      
      // Check if code matches
      if (otpData.code !== verificationCode) {
        setError('Invalid verification code. Please try again.')
        return
      }
      
      // Check if code expired
      const expiresAt = new Date(otpData.expiresAt)
      if (new Date() > expiresAt) {
        setError('Verification code has expired. Please request a new one.')
        // Clean up expired OTP
        try {
          const { landingApi } = await import('@/lib/api')
          await landingApi.deleteSiteSettings([storageKey])
        } catch {}
        localStorage.removeItem(`otp_${email}`)
        return
      }
      
      // Verify email matches
      if (otpData.email.toLowerCase() !== email.toLowerCase()) {
        setError('Email mismatch. Please use the same email you signed up with.')
        return
      }
      
      // Validate password before creating account
      if (!otpData.password) {
        // No sensitive info in logs
        setError('Password not found in session. Please sign up again.')
        return
      }
      
      if (typeof otpData.password !== 'string' || otpData.password.length < 6) {
        // No sensitive info in logs
        setError('Password must be at least 6 characters. Please sign up again.')
        return
      }
      
      // Debug: Log password info (without showing actual password)
      // Create account in Supabase
      // Support both localhost and production
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      
      // Validate password before sign up
      if (!otpData.password || typeof otpData.password !== 'string' || otpData.password.trim().length < 6) {
        setError('Password is invalid. Please sign up again.')
        setLoading(false)
        return
      }
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({ 
        email: otpData.email.trim().toLowerCase(), 
        password: otpData.password.trim(),
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: otpData.username,
            name: otpData.username || otpData.email.split('@')[0]
          }
        }
      })
      
      if (signUpError) {
        // Generic error message - no sensitive info
        setError('Failed to create account. Please try again.')
        return
      }
      
      if (authData) {
        // Clean up OTP data
        try {
          const { landingApi } = await import('@/lib/api')
          await landingApi.deleteSiteSettings([storageKey])
        } catch {}
        localStorage.removeItem(`otp_${email}`)
        
        // Automatically sign in the user after account creation
        // Note: If email confirmation is required in Supabase, user might need to confirm email first
        try {
          // Wait a bit for account to be fully created
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Use the same email and password format as sign up
          const signInEmail = otpData.email.trim().toLowerCase()
          const signInPassword = otpData.password.trim()
          
          // Debug: Log auto sign-in attempt
          if (process.env.NODE_ENV === 'development') {
            console.log('Auto sign-in attempt:', {
              email: signInEmail,
              passwordLength: signInPassword.length,
              originalEmail: otpData.email
            })
          }
          
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: signInEmail,
            password: signInPassword
          })
          
          if (signInError) {
            console.error('Auto sign-in error:', signInError)
            
            // Check if error is due to email confirmation
            if (signInError.message.includes('email') || 
                signInError.message.includes('confirm') ||
                signInError.message.includes('Email not confirmed')) {
              setSuccess('Account created! Please check your email to confirm your account, then sign in.')
            } else {
              // Even if auto sign-in fails, account is created
              setSuccess('Account created successfully! You can now sign in with your email and password.')
            }
          } else if (signInData?.user) {
            setSuccess('Account created and signed in successfully!')
            // Reload page to update user state
            setTimeout(() => {
              window.location.reload()
            }, 1500)
            return
          }
        } catch (signInErr: any) {
          // No sensitive info in logs
          setSuccess('Account created successfully! You can now sign in with your email and password.')
        }
        
        setSuccess('Account created successfully!')
        setTimeout(() => {
          onClose()
          setIsVerifying(false)
          setVerificationCode('')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          setUsername('')
        }, 2000)
      }
    } finally { setLoading(false) }
  }

  const resendVerificationCode = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)
      
      // Generate new OTP
      const otpCode = generateOTP()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      
      // Retrieve stored data to get password
      let storedData: any = null
      const storageKey = `otp_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      
      try {
        const { landingApi } = await import('@/lib/api')
        const result = await landingApi.getSiteSettings([storageKey])
        
        if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
          const setting = result.data.find((s: any) => s.key === storageKey)
          if (setting?.value) {
            storedData = JSON.parse(setting.value)
          }
        }
      } catch (e) {
        const stored = localStorage.getItem(`otp_${email}`)
        if (stored) {
          storedData = JSON.parse(stored)
        }
      }
      
      if (!storedData) {
        setError('Session expired. Please sign up again.')
        return
      }
      
      // Update OTP in storage
      const updatedData = {
        ...storedData,
        code: otpCode,
        expiresAt: expiresAt.toISOString()
      }
      
      try {
        const { landingApi } = await import('@/lib/api')
        await landingApi.upsertSiteSetting(storageKey, JSON.stringify(updatedData))
      } catch (e) {
        localStorage.setItem(`otp_${email}`, JSON.stringify(updatedData))
      }
      
      // Send new OTP
      const emailSent = await sendOTPEmail(otpCode, email)
      
      if (emailSent) {
        setSuccess('Verification code resent to your email!')
      } else {
        setError('Failed to resend verification code. Please try again.')
      }
    } finally { setLoading(false) }
  }

  const resetPassword = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)
      
      // Check if Supabase is properly configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
        // No console warnings - silent fail for security
        // Always show generic message to users (production-safe)
        setError('Authentication service is temporarily unavailable. Please try again later.')
        setLoading(false)
        return
      }
      
      if (!email) {
        setError('Please enter your email address')
        return
      }
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectUrl}${window.location.pathname}#type=recovery`
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password reset link sent to your email! Please check your inbox.')
      }
    } finally { setLoading(false) }
  }

  const updatePassword = async () => {
    try {
      setLoading(true); setError(null); setSuccess(null)
      
      if (!newPassword || !confirmNewPassword) {
        setError('Please fill in all password fields')
        return
      }
      
      if (newPassword !== confirmNewPassword) {
        setError('Passwords do not match')
        return
      }
      
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      
      // Check if we have a valid session (from recovery token)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Session error:', sessionError)
        }
        setError('Session expired. Please request a new password reset link.')
        return
      }
      
      if (!session) {
        // Try to get session from URL hash if available
        let hash = window.location.hash;
        if (hash.includes('#type=') && hash.includes('#access_token=')) {
          hash = hash.substring(1).replace(/#/g, '&');
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            // Set the session using the access token
            const { data: { session: newSession }, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || ''
            })
            
            if (setSessionError || !newSession) {
              setError('Invalid or expired reset link. Please request a new password reset link.')
              return
            }
          } else {
            setError('Invalid reset link. Please request a new password reset link.')
            return
          }
        } else {
          setError('Session expired. Please request a new password reset link.')
          return
        }
      }
      
      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) {
        // Generic error message - no sensitive info
        setError('An error occurred. Please try again.')
      } else {
        setSuccess('Password updated successfully! You can now sign in with your new password.')
        setTimeout(() => {
          setIsResettingPassword(false)
          setNewPassword('')
          setConfirmNewPassword('')
          setEmail('')
          onClose()
        }, 2000)
      }
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <>
      <div className={`fixed inset-0 z-[9998] transition ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ background: 'rgba(0,0,0,0.6)' }} />
      <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} overflow-y-auto p-4`}>
        <div ref={panelRef} className="w-full max-w-md my-auto rounded-2xl border border-white/10 bg-[#0c1224]/95 text-white backdrop-blur-xl p-6 shadow-[0_40px_120px_rgba(56,189,248,0.25)] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/90 hover:bg-red-600 border border-white/30 hover:border-white/50 transition-all cursor-pointer z-[100] shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            aria-label="Close"
            type="button"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center mb-4">
            <div className="text-xs px-2 py-1 inline-block rounded-md bg-white/10">Welcome</div>
            <h3 className="mt-2 text-2xl font-bold">
              {isVerifying ? 'Verify Email' : isResettingPassword ? 'Reset Password' : isForgotPassword ? 'Forgot Password' : isSignUp ? 'Sign Up' : 'Sign In'}
            </h3>
          </div>
          {!isForgotPassword && !isVerifying && !isResettingPassword && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => signInOAuth('google')} className="rounded-lg px-3 py-2 bg-white/10 border border-white/15 hover:bg-white/15">Google</button>
              <button onClick={() => signInOAuth('github')} className="rounded-lg px-3 py-2 bg-white/10 border border-white/15 hover:bg-white/15">GitHub</button>
            </div>
          )}
          {!isForgotPassword && !isVerifying && !isResettingPassword && <div className="my-4 h-px bg-white/10" />}
          <div className="space-y-2">
            {isVerifying ? (
              <>
                <p className="text-sm text-white/70 mb-2">Enter the 6-digit verification code sent to <span className="font-semibold">{email}</span></p>
                <p className="text-xs text-white/50 mb-3">Code expires in 10 minutes</p>
                <input 
                  placeholder="Enter 6-digit code" 
                  type="text" 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest font-mono" 
                  maxLength={6}
                />
                {error && <div className="text-sm text-red-400">{error}</div>}
                {success && <div className="text-sm text-green-400">{success}</div>}
                <button 
                  onClick={verifyEmailCode} 
                  disabled={loading || verificationCode.length !== 6} 
                  className="auth-signin-btn w-full rounded-lg px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 disabled:opacity-50 text-white font-medium"
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
                <div className="w-full text-center mt-2">
                  <span className="text-sm text-white/60">Didn't receive code? </span>
                  <span 
                    onClick={resendVerificationCode}
                    className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                  >
                    Resend
                  </span>
                </div>
                <div className="w-full text-center mt-2">
                  <span 
                    onClick={() => {
                      setIsVerifying(false)
                      setVerificationCode('')
                      setError(null)
                      setSuccess(null)
                    }} 
                    className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                  >
                    Back to Sign Up
                  </span>
                </div>
              </>
            ) : isResettingPassword ? (
              <>
                <p className="text-sm text-white/70 mb-2">Enter your new password below.</p>
                <div className="relative">
                  <input 
                    placeholder="New Password" 
                    type={showNewPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (confirmNewPassword && e.target.value !== confirmNewPassword) {
                        setError('Passwords do not match')
                      } else if (confirmNewPassword && e.target.value === confirmNewPassword) {
                        setError(null)
                      }
                    }} 
                    className="w-full rounded-lg px-3 py-2 pr-10 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 focus:outline-none"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input 
                    placeholder="Confirm New Password" 
                    type={showConfirmNewPassword ? "text" : "password"} 
                    value={confirmNewPassword} 
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value)
                      if (newPassword && e.target.value !== newPassword) {
                        setError('Passwords do not match')
                      } else if (newPassword && e.target.value === newPassword) {
                        setError(null)
                      }
                    }} 
                    className={`w-full rounded-lg px-3 py-2 pr-10 bg-white/10 border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      confirmNewPassword && newPassword && confirmNewPassword !== newPassword 
                        ? 'border-red-500' 
                        : confirmNewPassword && newPassword && confirmNewPassword === newPassword 
                        ? 'border-green-500' 
                        : 'border-white/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white focus:outline-none z-10 p-1 rounded hover:bg-white/10 transition-colors"
                    aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {error && <div className="text-sm text-red-400">{error}</div>}
                {success && <div className="text-sm text-green-400">{success}</div>}
                <button 
                  onClick={updatePassword} 
                  disabled={loading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword} 
                  className="auth-signin-btn w-full rounded-lg px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 disabled:opacity-50 text-white font-medium"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <div className="w-full text-center mt-2">
                  <span 
                    onClick={() => {
                      setIsResettingPassword(false)
                      setIsForgotPassword(false)
                      setNewPassword('')
                      setConfirmNewPassword('')
                      setError(null)
                      setSuccess(null)
                    }} 
                    className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                  >
                    Back to Sign In
                  </span>
                </div>
              </>
            ) : isForgotPassword ? (
              <>
                <p className="text-sm text-white/70 mb-2">Enter your email address and we'll send you a password reset link.</p>
                <input 
                  placeholder="Email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
                {error && <div className="text-sm text-red-400">{error}</div>}
                {success && <div className="text-sm text-green-400">{success}</div>}
                <button 
                  onClick={resetPassword} 
                  disabled={loading} 
                  className="auth-signin-btn w-full rounded-lg px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 disabled:opacity-50 text-white font-medium"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <div className="w-full text-center mt-2">
                  <span 
                    onClick={() => {
                      setIsForgotPassword(false)
                      setError(null)
                      setSuccess(null)
                    }} 
                    className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                  >
                    Back to Sign In
                  </span>
                </div>
              </>
            ) : (
              <>
                {isSignUp && (
                  <input 
                    placeholder="Username (required)" 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                    className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                    maxLength={20}
                    required
                  />
                )}
                <input 
                  placeholder={isSignUp ? "Email" : "Email or Username"} 
                  type={isSignUp ? "email" : "text"}
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                />
                <div className="relative">
                  <input 
                    placeholder={isSignUp ? "New Password" : "Password"} 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => {
                      setPassword(e.target.value)
                      // Real-time password mismatch check
                      if (isSignUp && confirmPassword && e.target.value !== confirmPassword) {
                        setError('Passwords do not match')
                      } else if (isSignUp && confirmPassword && e.target.value === confirmPassword) {
                        setError(null)
                      }
                    }} 
                    className="w-full rounded-lg px-3 py-2 pr-10 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white focus:outline-none z-10 p-1 rounded hover:bg-white/10 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  {!isSignUp && (
                    <span 
                      onClick={() => {
                        setIsForgotPassword(true)
                        setPassword('')
                        setError(null)
                        setSuccess(null)
                      }} 
                      className="absolute right-14 top-1/2 -translate-y-1/2 text-sm text-white/60 hover:text-white/80 underline cursor-pointer z-10"
                    >
                      Forgot?
                    </span>
                  )}
                </div>
                {isSignUp && (
                  <div className="relative">
                    <input 
                      placeholder="Confirm Password" 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        // Real-time password mismatch check
                        if (password && e.target.value !== password) {
                          setError('Passwords do not match')
                        } else if (password && e.target.value === password) {
                          setError(null)
                        }
                      }} 
                      className={`w-full rounded-lg px-3 py-2 pr-10 bg-white/10 border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        confirmPassword && password && confirmPassword !== password 
                          ? 'border-red-500' 
                          : confirmPassword && password && confirmPassword === password 
                          ? 'border-green-500' 
                          : 'border-white/15'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white focus:outline-none z-10 p-1 rounded hover:bg-white/10 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
                
                {/* reCAPTCHA - only show for sign-in, not sign-up */}
                {!isSignUp && (
                  <div className="mt-4">
                    <div id="auth-recaptcha-container" ref={recaptchaRef}></div>
                    {!recaptchaToken && (
                      <p className="mt-1 text-red-400 text-xs">Please complete the reCAPTCHA verification</p>
                    )}
                  </div>
                )}
                
                {error && <div className="text-sm text-red-400">{error}</div>}
                {success && <div className="text-sm text-green-400">{success}</div>}
                {isSignUp ? (
                  <>
                    <button 
                      onClick={signUpEmail}
                      disabled={loading} 
                      className="auth-signin-btn w-full rounded-lg px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 disabled:opacity-50 text-white font-medium"
                    >
                      {loading ? 'Creating...' : 'Sign Up'}
                    </button>
                    <div className="w-full text-center mt-2">
                      <span className="text-sm text-white/60">Already have an account? </span>
                      <span 
                        onClick={() => {
                          setIsSignUp(false)
                          setUsername('')
                          setPassword('')
                          setConfirmPassword('')
                          setError(null)
                          setSuccess(null)
                          // Reset reCAPTCHA when switching to sign-in
                          if (window.grecaptcha && window.grecaptcha.reset) {
                            try {
                              window.grecaptcha.reset();
                              setRecaptchaToken(null);
                            } catch (e) {
                              // Silent fail
                            }
                          }
                        }} 
                        className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                      >
                        Sign In
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={signInEmail} 
                      disabled={loading || !recaptchaToken} 
                      className="auth-signin-btn w-full rounded-lg px-3 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-95 disabled:opacity-50 text-white font-medium"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <div className="w-full text-center mt-2">
                      <span className="text-sm text-white/60">Don't have an account? </span>
                      <span 
                        onClick={() => {
                          setIsSignUp(true)
                          setError(null)
                          setSuccess(null)
                          // Clear reCAPTCHA when switching to sign-up
                          setRecaptchaToken(null);
                        }} 
                        className="text-sm text-white/60 hover:text-white/80 underline cursor-pointer"
                      >
                        Sign Up
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthModal


