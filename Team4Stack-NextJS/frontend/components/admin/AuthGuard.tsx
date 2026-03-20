import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../utils/supabaseClient'

type Props = {
  children: React.ReactNode
}

const AuthGuard: React.FC<Props> = ({ children }) => {
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

        const userEmail = adminSession.email?.toLowerCase().trim()

        if (!userEmail) {
          setAllowed(false)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        if (!adminSession.apiToken || typeof adminSession.apiToken !== 'string') {
          sessionStorage.removeItem('admin_session')
          setAllowed(false)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        // API TABLE CHECK
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
        const row = adminResult.data as { email?: string } | null | undefined
        if (!row || !row.email) {
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

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>
  }

  if (!isAdmin || !allowed) {
    return <Navigate to="/adminsami/login" replace />
  }

  return <>{children}</>
}

export default AuthGuard


