'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { superadminApi, usersApi } from '@/lib/api'

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
      // Check if Supabase is properly configured (not placeholder)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // If Supabase keys are missing, skip auth (for admin-only mode)
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // If session check fails, don't sign out - just set user to null
      if (sessionError) {
        console.warn('Session check failed:', sessionError.message)
        setUser(null)
        setLoading(false)
        return
      }

      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }
      // Ensure profile exists (only creates if doesn't exist)
      await upsertProfile(session.user)
      // Always fetch fresh data from database to get latest updates via API
      const profileResult = await usersApi.getUserById(session.user.id)
      
      if (profileResult.error) {
        // No sensitive info in logs
        // Fallback to upsertProfile result if fetch fails
        const fallback = await upsertProfile(session.user)
        setUser(fallback)
      } else {
        const profile = profileResult.data
        // Check if user is blocked - if yes, sign them out immediately
        if (profile && (profile as any).is_blocked === true) {
          await supabase.auth.signOut()
          setUser(null)
          setLoading(false)
          return
        }
        
        const mapped = mapProfile(session.user, profile)
        setUser(mapped)
      }
    } catch (err: any) {
      // Handle any errors gracefully - don't crash the app
      console.warn('Error loading session:', err.message)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [upsertProfile])

  useEffect(() => {
    loadSession()
    
    // Only subscribe to auth changes if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
      const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
        // Only reload session if we have a valid session or explicit sign out
        if (_event === 'SIGNED_OUT' || _event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
          loadSession()
        }
      })
      return () => { sub?.subscription?.unsubscribe() }
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
    signOut: async () => { await supabase.auth.signOut(); setUser(null) },
    refresh: loadSession,
    requiresUsername
  }), [user, loading, loadSession, requiresUsername])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
