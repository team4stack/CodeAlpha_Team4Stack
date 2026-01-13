import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

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
      const { data } = await supabase.from('users').select('id').eq('username', finalUsername).maybeSingle()
      if (!data) break
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
    
    // Get existing profile to check if it exists
    const { data: existingProfile } = await supabase.from('users').select('*').eq('id', sessionUser.id).maybeSingle()
    
    // If profile exists, don't overwrite it - just return it
    // Only create new profile if it doesn't exist
    if (existingProfile) {
      return mapProfile(sessionUser, existingProfile)
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
    await supabase.from('users').upsert(candidate, { onConflict: 'id' })
    const { data: profile } = await supabase.from('users').select('*').eq('id', sessionUser.id).maybeSingle()
    return mapProfile(sessionUser, profile)
  }, [])

  const loadSession = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setUser(null)
        setLoading(false)
        return
      }
      // Ensure profile exists (only creates if doesn't exist)
      await upsertProfile(session.user)
      // Always fetch fresh data from database to get latest updates
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()
      
      if (error) {
        // No sensitive info in logs
        // Fallback to upsertProfile result if fetch fails
        const fallback = await upsertProfile(session.user)
        setUser(fallback)
      } else {
        // Check if user is blocked - if yes, sign them out immediately
        if (profile && profile.is_blocked === true) {
          await supabase.auth.signOut()
          setUser(null)
          setLoading(false)
          return
        }
        
        const mapped = mapProfile(session.user, profile)
        setUser(mapped)
      }
    } finally {
      setLoading(false)
    }
  }, [upsertProfile])

  useEffect(() => {
    loadSession()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      loadSession()
    })
    return () => { sub.subscription.unsubscribe() }
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
      const { superadminApi } = await import('@/lib/api')
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


