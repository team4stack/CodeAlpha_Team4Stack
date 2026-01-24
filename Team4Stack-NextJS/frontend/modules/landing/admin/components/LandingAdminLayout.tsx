'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from './LandingAdminSidebar'
import AdminHeader from '../../../../components/admin/shared/AdminHeader'
import { supabase } from '@/lib/supabase/client'
import { isEmailAllowedForAdmin } from '@/lib/auth/utils/adminSecurity'

interface LandingAdminLayoutProps {
  children: React.ReactNode
}

const LandingAdminLayout: React.FC<LandingAdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      // Check custom admin session (NOT Supabase Auth session)
      // Admin login is completely separate from normal website login
      const adminSessionStr = sessionStorage.getItem('admin_session')
      
      if (!adminSessionStr) {
        router.replace('/adminlandingt4s/login')
        setLoading(false)
        return
      }

      try {
        const adminSession = JSON.parse(adminSessionStr)
        
        // Check if session is expired
        if (!adminSession.expiresAt || Date.now() >= adminSession.expiresAt) {
          // Session expired, remove it
          sessionStorage.removeItem('admin_session')
          router.replace('/adminlandingt4s/login')
          setLoading(false)
          return
        }

        // Step 1: ENVIRONMENT VARIABLE CHECK (FIRST - Most Secure Layer)
        // Even if Supabase is hacked, this check will prevent unauthorized access
        const userEmail = adminSession.email?.toLowerCase().trim()
        
        if (!userEmail) {
          sessionStorage.removeItem('admin_session')
          router.replace('/adminlandingt4s/login')
          setLoading(false)
          return
        }

        // Environment variable check (only for super admin)
        // Other admins can access via Supabase check only
        const isSuperAdmin = userEmail === 'superadmin@gmail.com'
        if (isSuperAdmin && !isEmailAllowedForAdmin(userEmail)) {
          sessionStorage.removeItem('admin_session')
          router.replace('/adminlandingt4s/login')
          setLoading(false)
          return
        }
        
        // Step 2: API TABLE CHECK (SECOND - Can be compromised, but still checked)
        // Multi-layer security: Both environment variable AND API check must pass
        const { superadminApi } = await import('@/lib/api')
        const adminResult = await superadminApi.checkAdminByEmail(userEmail)

        if (adminResult.error) {
          // No sensitive info in logs
          sessionStorage.removeItem('admin_session')
          router.replace('/adminlandingt4s/login')
          setLoading(false)
          return
        }

        // CRITICAL: If user email is NOT in admin_users table, deny access
        // Normal users ka email admin_users mein nahi hoga
        // Only manually added admins will be in admin_users table
        if (!adminResult.data || !adminResult.data.email) {
          // This is a normal user trying to access admin panel
          // Remove session and redirect to login
          sessionStorage.removeItem('admin_session')
          router.replace('/adminlandingt4s/login')
          setLoading(false)
          return
        }

        // Step 3: ROLE-BASED ACCESS CONTROL
        // Check if user has permission to access landing admin panel
        // Only super_admin, landing_admin, or legacy 'admin' role can access
        const userRole = (adminData as any)?.role || 'admin'
        const allowedRoles = ['super_admin', 'landing_admin', 'admin']
        if (!allowedRoles.includes(userRole)) {
          // User doesn't have permission for this admin panel
          // Redirect to their appropriate admin panel or login
          sessionStorage.removeItem('admin_session')
          router.replace('/adminlandingt4s/login')
          setLoading(false)
          return
        }

        // User is authenticated and is admin - allow access
        setLoading(false)
      } catch (error) {
        // Invalid session, remove it
        sessionStorage.removeItem('admin_session')
        router.replace('/adminlandingt4s/login')
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
  }, [router])

  if (loading) {
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      {/* Neon grid background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_20%,#7c3aed_0,transparent_35%),radial-gradient(circle_at_80%_30%,#06b6d4_0,transparent_35%),radial-gradient(circle_at_30%_80%,#22c55e_0,transparent_35%)]"></div>
      <div className="pointer-events-none absolute -inset-24 blur-3xl opacity-[0.15] bg-gradient-to-br from-fuchsia-500 via-cyan-400 to-emerald-400"></div>
      
      {/* Navbar - Full Width at Top */}
      <AdminHeader />
      
      {/* Sidebar and Content - Below Navbar */}
      <div className="flex flex-1 min-h-0">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export { LandingAdminLayout }
export default LandingAdminLayout


