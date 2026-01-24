import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { isEmailAllowedForAdmin, verifyAdminAccess } from '../utils/adminSecurity'

type Props = {
  children: React.ReactNode
}

const AuthGuard: React.FC<Props> = ({ children }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const check = async () => {
      // Check custom admin session (NOT Supabase Auth session)
      // Admin login is completely separate from normal website login
      const adminSessionStr = sessionStorage.getItem('admin_session')
      
      if (!adminSessionStr) {
        setAllowed(false)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const adminSession = JSON.parse(adminSessionStr)
        
        // Check if session is expired
        if (!adminSession.expiresAt || Date.now() >= adminSession.expiresAt) {
          // Session expired, remove it
          sessionStorage.removeItem('admin_session')
          setAllowed(false)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // Step 1: ENVIRONMENT VARIABLE CHECK (FIRST - Most Secure Layer)
        // Even if Supabase is hacked, this check will prevent unauthorized access
        const userEmail = adminSession.email?.toLowerCase().trim()
        
        if (!userEmail) {
          setAllowed(false)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // Environment variable check - PRIMARY security layer
        if (!isEmailAllowedForAdmin(userEmail)) {
          // Email not in environment variable whitelist - deny immediately
          // This prevents access even if someone adds email to Supabase admin_users table
          sessionStorage.removeItem('admin_session')
          setAllowed(false)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // Step 2: API TABLE CHECK (SECOND - Can be compromised, but still checked)
        // Multi-layer security: Both environment variable AND API check must pass
        const { superadminApi } = await import('@/lib/api')
        const adminResult = await superadminApi.checkAdminByEmail(userEmail)

        if (adminResult.error) {
          // No sensitive info in logs
          setAllowed(false)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // CRITICAL: If user email is not in admin_users table, deny access
        // Normal users ka email admin_users mein nahi hoga
        // Only manually added admins will be in admin_users table
        const adminData = adminResult.data as { email?: string } | null
        if (!adminData || !adminData.email) {
          // This is a normal user trying to access admin panel
          // Deny access immediately
          sessionStorage.removeItem('admin_session')
          setAllowed(false)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        setIsAdmin(true)
        setAllowed(true)
        setLoading(false)
      } catch (error) {
        // Invalid session, remove it
        sessionStorage.removeItem('admin_session')
        setAllowed(false)
        setIsAdmin(false)
        setLoading(false)
      }
    }
    
    check()
    
    // Re-check periodically (every 5 minutes)
    const interval = setInterval(() => {
      check()
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!loading && (!isAdmin || !allowed)) {
      router.replace('/adminlandingt4s/login')
    }
  }, [loading, isAdmin, allowed, router])

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>
  }

  if (!isAdmin || !allowed) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}

export default AuthGuard


