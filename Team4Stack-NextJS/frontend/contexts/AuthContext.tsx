'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { superadminApi, usersApi } from '@/lib/api'
import { getCookieConsent, persistSignInIdentity, canUseFunctionalCookies } from '@/lib/cookies/consent'
import {
  AUTH_SESSION_COOKIE_NAME,
  clearAuthSessionCookie,
  setAuthSessionCookieIfAllowed
} from '@/lib/cookies/authSessionCookie'
import { isValidAuthTokenString, parseStoredClientAuthSession } from '@/lib/security/clientAuthSession'

export type AppUser = {
  id: string
  name: string | null
  username: string | null
  email: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at?: string
}

type AuthContextType = {
  user: AppUser | null
  loading: boolean
  signOut: () => Promise<void>
  refresh: () => Promise<void>
  requiresUsername: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signOut: async () => {}, refresh: async () => {}, requiresUsername: false })

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  const getCookie = (name: string): string | null => {
    try {
      if (typeof document === 'undefined') return null
      const match = document.cookie
        .split('; ')
        .find((c) => c.startsWith(`${name}=`))
      if (!match) return null
      return decodeURIComponent(match.split('=').slice(1).join('='))
    } catch {
      return null
    }
  }

  const clearSessionCookie = () => {
    clearAuthSessionCookie()
  }

  const generateUniqueUsername = useCallback(async (baseUsername: string): Promise<string> => {
    let username = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 20) || 'user'
    let counter = 1
    let finalUsername = username
    
    while (true) {
      const result = await usersApi.checkUsernameAvailability(finalUsername)
      // Backend returns { success: true, available: boolean }
      // API client returns { success: boolean, data?: { success: true, available: boolean }, error?: string }
      // If username is available (available === true), break
      const responseData = result.data as any
      if (responseData && responseData.available === true) break
      // If error, just use current username
      if (result.error) {
        break
      }
      // Username not available, try next
      finalUsername = `${username}${counter}`
      counter++
      if (counter > 1000) {
        finalUsername = `${username}_${Date.now()}`
        break
      }
    }
    return finalUsername
  }, [])

  const mapProfile = (sessionUser: any, profile?: any): AppUser => ({
    id: sessionUser?.id,
    name: profile?.name ?? sessionUser?.user_metadata?.name ?? sessionUser?.user_metadata?.full_name ?? null,
    username: profile?.username ?? null,
    email: sessionUser?.email ?? null,
    avatar_url: profile?.avatar_url ?? sessionUser?.user_metadata?.avatar_url ?? null,
    role: (profile?.role as 'user' | 'admin') ?? 'user',
    created_at: profile?.created_at
  })

  const upsertProfile = useCallback(async (sessionUser: any) => {
    if (!sessionUser) return null
    
    // Get existing profile to check if it exists via API
    const existingResult = await usersApi.getUserById(sessionUser.id)
    
    // If profile exists, don't overwrite it - just return it
    // Only create new profile if it doesn't exist
    if (existingResult.data) {
      return mapProfile(sessionUser, existingResult.data)
    }
    
    // Only create new profile if it doesn't exist
    let username = sessionUser.user_metadata?.username || null
    
    const candidate: Partial<AppUser> = {
      id: sessionUser.id,
      name: sessionUser.user_metadata?.name ?? sessionUser.user_metadata?.full_name ?? sessionUser.email?.split('@')[0] ?? 'User',
      username: username,
      email: sessionUser.email,
      avatar_url: sessionUser.user_metadata?.avatar_url ?? null,
      role: 'user'
    }
    
    // Upsert user via API
    const upsertResult = await usersApi.upsertUser(candidate)
    if (upsertResult.error) {
      console.error('Error upserting user:', upsertResult.error)
      // Return mapped profile even if upsert fails
      return mapProfile(sessionUser, candidate as any)
    }
    
    // Get the created/updated profile
    const profileResult = await usersApi.getUserById(sessionUser.id)
    return mapProfile(sessionUser, profileResult.data || candidate as any)
  }, [])

  const loadSession = useCallback(async () => {
    setLoading(true)
    try {
      const consent = getCookieConsent()
      if (consent === 'essential') {
        clearAuthSessionCookie()
      }
      const sessionStr =
        localStorage.getItem('auth_session') ||
        (consent === 'essential' ? null : getCookie(AUTH_SESSION_COOKIE_NAME))
      
      if (!sessionStr) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const session = parseStoredClientAuthSession(sessionStr)

        if (!session) {
          localStorage.removeItem('auth_session')
          clearSessionCookie()
          setUser(null)
          setLoading(false)
          return
        }

        // Check if session is expired (only check if expires_at exists and is valid)
        if (session.expires_at) {
          const expiresAt = session.expires_at
          if (!isNaN(expiresAt) && Date.now() > expiresAt) {
            // Session expired, remove it
            localStorage.removeItem('auth_session')
            clearSessionCookie()
            setUser(null)
            setLoading(false)
            return
          }
        }

        // Verify session with backend API (backend will verify with Supabase)
        const { authApi } = await import('@/lib/api')
        let sessionUser = null
        let userProfile = null
        
        try {
          const verifyResult = await authApi.getSession(session.access_token, session.refresh_token)
          
          if (verifyResult.success && verifyResult.data) {
            const sessionData = verifyResult.data as any
            sessionUser = sessionData.user
            userProfile = sessionData.user?.profile || null
          } else {
            // Backend verification failed, try to use stored user data as fallback
            // Use stored user data if available
            if (session.user && session.user.id) {
              sessionUser = session.user
            } else {
              // No user data available, session is invalid
              localStorage.removeItem('auth_session')
              clearSessionCookie()
              setUser(null)
              setLoading(false)
              return
            }
          }
        } catch (verifyErr: any) {
          // Backend API call failed, try to use stored user data
          // Use stored user data if available
          if (session.user && session.user.id) {
            sessionUser = session.user
          } else {
            // No user data available, session is invalid
            localStorage.removeItem('auth_session')
            clearSessionCookie()
            setUser(null)
            setLoading(false)
            return
          }
        }
        
        if (!sessionUser || !sessionUser.id) {
          setUser(null)
          setLoading(false)
          return
        }

        // Get user profile (either from user.profile or fetch separately)
        if (!userProfile) {
          userProfile = sessionUser.profile || null
        }
        
        // If profile is not available, fetch it separately or create it
        if (!userProfile) {
          try {
            const profileResult = await usersApi.getUserById(sessionUser.id)
            if (profileResult.success && profileResult.data) {
              userProfile = profileResult.data
            } else {
              // Profile doesn't exist, create it via upsertProfile
              const createdProfile = await upsertProfile(sessionUser)
              if (createdProfile) {
                userProfile = createdProfile as any
              }
            }
          } catch (profileErr) {
            // Try to create profile
            try {
              const createdProfile = await upsertProfile(sessionUser)
              if (createdProfile) {
                userProfile = createdProfile as any
              }
            } catch (createErr) {
              // Continue without profile - will use session user data
            }
          }
        }

        // Check if user is blocked (only if we have profile data)
        if (userProfile && (userProfile as any).is_blocked === true) {
          // User is blocked, remove session
          localStorage.removeItem('auth_session')
          clearSessionCookie()
          setUser(null)
          setLoading(false)
          return
        }

        // Map user data (use sessionUser as fallback if profile is null)
        const mapped = mapProfile(sessionUser, userProfile)
        setUser(mapped)
        try {
          if (mapped.email && canUseFunctionalCookies()) {
            persistSignInIdentity({ email: mapped.email, name: mapped.name })
          }
        } catch {
          // ignore
        }
      } catch (parseError: any) {
        // Invalid session data, remove it
        localStorage.removeItem('auth_session')
        clearSessionCookie()
        setUser(null)
      }
    } catch (err: any) {
      // Handle any errors gracefully - don't crash the app
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSession()
    
    // Handle OAuth callback from URL hash or query params (when user returns from Google/GitHub)
    const handleOAuthCallback = async () => {
      // Check if URL has OAuth tokens in hash (direct Supabase redirect) or query params (backend redirect)
      const hash = window.location.hash
      const queryParams = new URLSearchParams(window.location.search)
      
      // Get tokens from hash (direct Supabase) or query params (backend redirect)
      let accessToken: string | null = null
      let refreshToken: string | null = null
      let type: string | null = null
      let expiresIn: string | null = null
      let expiresAt: number | null = null
      
      if (hash && hash.includes('access_token')) {
        // Parse hash parameters (handle multiple # separators)
        let hashString = hash.substring(1)
        if (hashString.includes('#')) {
          hashString = hashString.replace(/#/g, '&')
        }
        const hashParams = new URLSearchParams(hashString)
        accessToken = hashParams.get('access_token')
        refreshToken = hashParams.get('refresh_token')
        type = hashParams.get('type')
        expiresIn = hashParams.get('expires_in')
        expiresAt = hashParams.get('expires_at') ? parseInt(hashParams.get('expires_at')!) : null
      } else if (queryParams.has('access_token')) {
        // Parse query parameters (backend redirect)
        accessToken = queryParams.get('access_token')
        refreshToken = queryParams.get('refresh_token')
        type = queryParams.get('type')
        expiresIn = queryParams.get('expires_in')
        expiresAt = queryParams.get('expires_at') ? parseInt(queryParams.get('expires_at')!) : null
      }
      
      // If it's an OAuth callback (not password reset)
      if (accessToken && refreshToken && type !== 'recovery') {
        if (!isValidAuthTokenString(accessToken) || !isValidAuthTokenString(refreshToken)) {
          window.history.replaceState(null, '', window.location.pathname)
          return
        }
        try {
          // Calculate expires_at if not provided
          if (!expiresAt) {
            expiresAt = expiresIn 
              ? Date.now() + (parseInt(expiresIn) * 1000)
              : Date.now() + 3600000 // Default 1 hour
          }
          
          // Verify session with backend and get user profile
          try {
            const { authApi } = await import('@/lib/api')
            const verifyResult = await authApi.getSession(accessToken, refreshToken)
            
            if (verifyResult.success && verifyResult.data) {
              const sessionData = verifyResult.data as any
              const sessionUser = sessionData.user
              
              // Store session in localStorage
              localStorage.setItem('auth_session', JSON.stringify({
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: expiresAt,
                user: sessionUser
              }))
              setAuthSessionCookieIfAllowed({
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: expiresAt
              })
              
              // Clear hash and query params from URL
              window.history.replaceState(null, '', window.location.pathname)
              
              // Trigger session reload
              loadSession()
              return
            }
          } catch (backendErr) {
            // Backend verification failed - still store session
          }
          
          // If backend verification fails, still store basic session
          localStorage.setItem('auth_session', JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt,
            user: null // Will be fetched on next loadSession
          }))
          setAuthSessionCookieIfAllowed({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt
          })
          
          // Clear hash and query params from URL
          window.history.replaceState(null, '', window.location.pathname)
          
          // Trigger session reload
          loadSession()
        } catch (err) {
          // Silent fail - let Supabase handle it via onAuthStateChange
        }
      }
    }
    
    // Check for OAuth callback on mount
    handleOAuthCallback()
    
    // OAuth + email/password auth: tokens come from backend (/auth/oauth, /auth/signin).
    // No browser Supabase client subscription — avoids exposing NEXT_PUBLIC_SUPABASE_* on the client.
    
    // Listen for storage changes (when session is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_session') {
        loadSession()
      }
    }
    
    // Listen for custom event when session is updated in same tab
    const handleSessionUpdate = () => {
      loadSession()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth_session_updated', handleSessionUpdate)

    const onConsentChanged = () => {
      if (getCookieConsent() === 'essential') {
        clearAuthSessionCookie()
      }
      loadSession()
    }
    window.addEventListener('cookie_consent_changed', onConsentChanged)
    
    // Also check session periodically (every 5 minutes) to verify it's still valid
    const intervalId = setInterval(() => {
      loadSession()
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth_session_updated', handleSessionUpdate)
      window.removeEventListener('cookie_consent_changed', onConsentChanged)
      clearInterval(intervalId)
    }
  }, [loadSession])

  // Check if user requires username (logged in but no username set)
  // Admin users don't need username - only normal users
  const [isAdminUser, setIsAdminUser] = useState(false)
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setIsAdminUser(false)
        return
      }
      
      // Check if user email exists in admin_users table via API
      const result = await superadminApi.checkAdminByEmail(user.email.toLowerCase())
      setIsAdminUser(!!result.data)
    }
    
    checkAdminStatus()
  }, [user?.email])
  
  const requiresUsername = useMemo(() => {
    // Admin users don't need username
    if (isAdminUser) return false
    // Normal users need username if not set
    return user !== null && !user.username
  }, [user, isAdminUser])

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    signOut: async () => { 
      // Sign out via backend API
      try {
        const { authApi } = await import('@/lib/api')
        await authApi.signOut()
      } catch (err) {
        // Continue even if backend signout fails
      }
      // Remove session from localStorage
      localStorage.removeItem('auth_session')
      clearSessionCookie()
      setUser(null) 
    },
    refresh: loadSession,
    requiresUsername
  }), [user, loading, loadSession, requiresUsername])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
