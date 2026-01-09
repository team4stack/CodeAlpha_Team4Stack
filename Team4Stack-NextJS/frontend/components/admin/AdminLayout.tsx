import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import { supabase } from '../../utils/supabaseClient'
import { isEmailAllowedForAdmin } from '../../utils/adminSecurity'

const AdminLayout: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      // Check custom admin session (NOT Supabase Auth session)
      // Admin login is completely separate from normal website login
      const adminSessionStr = sessionStorage.getItem('admin_session')
      
      if (!adminSessionStr) {
        navigate('/adminsami/login', { replace: true })
        setLoading(false)
        return
      }

      try {
        const adminSession = JSON.parse(adminSessionStr)
        
        // Check if session is expired
        if (!adminSession.expiresAt || Date.now() >= adminSession.expiresAt) {
          // Session expired, remove it
          sessionStorage.removeItem('admin_session')
          navigate('/adminsami/login', { replace: true })
          setLoading(false)
          return
        }

        // Step 1: ENVIRONMENT VARIABLE CHECK (FIRST - Most Secure Layer)
        // Even if Supabase is hacked, this check will prevent unauthorized access
        const userEmail = adminSession.email?.toLowerCase().trim()
        
        if (!userEmail) {
          sessionStorage.removeItem('admin_session')
          navigate('/adminsami/login', { replace: true })
          setLoading(false)
          return
        }

        // Environment variable check - PRIMARY security layer
        if (!isEmailAllowedForAdmin(userEmail)) {
          // Email not in environment variable whitelist - deny immediately
          // This prevents access even if someone adds email to Supabase admin_users table
          sessionStorage.removeItem('admin_session')
          navigate('/adminsami/login', { replace: true })
          setLoading(false)
          return
        }
        
        // Step 2: SUPABASE TABLE CHECK (SECOND - Can be compromised, but still checked)
        // Multi-layer security: Both environment variable AND Supabase table must pass
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('email')
          .eq('email', userEmail)
          .maybeSingle()

        if (adminError) {
          // No sensitive info in logs
          sessionStorage.removeItem('admin_session')
          navigate('/adminsami/login', { replace: true })
          setLoading(false)
          return
        }

        // CRITICAL: If user email is NOT in admin_users table, deny access
        // Normal users ka email admin_users mein nahi hoga
        // Only manually added admins will be in admin_users table
        if (!adminData || !adminData.email) {
          // This is a normal user trying to access admin panel
          // Remove session and redirect to login
          sessionStorage.removeItem('admin_session')
          navigate('/adminsami/login', { replace: true })
          setLoading(false)
          return
        }

        // User is authenticated and is admin - allow access
        setLoading(false)
      } catch (error) {
        // Invalid session, remove it
        sessionStorage.removeItem('admin_session')
        navigate('/adminsami/login', { replace: true })
        setLoading(false)
      }
    }
    
    checkSession()
    
    // Re-check periodically (every 5 minutes)
    const interval = setInterval(() => {
      checkSession()
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [navigate])

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      {/* Neon grid background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_20%,#7c3aed_0,transparent_35%),radial-gradient(circle_at_80%_30%,#06b6d4_0,transparent_35%),radial-gradient(circle_at_30%_80%,#22c55e_0,transparent_35%)]"></div>
      <div className="pointer-events-none absolute -inset-24 blur-3xl opacity-[0.15] bg-gradient-to-br from-fuchsia-500 via-cyan-400 to-emerald-400"></div>
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout


