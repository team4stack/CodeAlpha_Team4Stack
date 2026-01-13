'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TeamAdminSidebar from './TeamAdminSidebar'
import AdminHeader from '../../../../components/admin/shared/AdminHeader'
import { supabase } from '@/lib/supabase/client'
import { isEmailAllowedForAdmin } from '@/lib/utils/adminSecurity'

interface TeamAdminLayoutProps {
  children: React.ReactNode
}

const TeamAdminLayout: React.FC<TeamAdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      // Check custom admin session
      const adminSessionStr = sessionStorage.getItem('admin_session')
      
      if (!adminSessionStr) {
        router.replace('/adminteamt4s/login')
        setLoading(false)
        return
      }

      try {
        const adminSession = JSON.parse(adminSessionStr)
        
        // Check if session is expired
        if (!adminSession.expiresAt || Date.now() >= adminSession.expiresAt) {
          sessionStorage.removeItem('admin_session')
          router.replace('/adminteamt4s/login')
          setLoading(false)
          return
        }

        const userEmail = adminSession.email?.toLowerCase().trim()
        
        if (!userEmail) {
          sessionStorage.removeItem('admin_session')
          router.replace('/adminteamt4s/login')
          setLoading(false)
          return
        }

        // Environment variable check (only for super admin)
        // Other admins can access via Supabase check only
        const isSuperAdmin = userEmail === 'superadmin@gmail.com'
        if (isSuperAdmin && !isEmailAllowedForAdmin(userEmail)) {
          sessionStorage.removeItem('admin_session')
          router.replace('/adminteamt4s/login')
          setLoading(false)
          return
        }
        
        // Check if user is admin in admin_users table via API
        const { superadminApi } = await import('@/lib/api')
        const adminResult = await superadminApi.checkAdminByEmail(userEmail)

        if (adminResult.error || !adminResult.data || !adminResult.data.email) {
          sessionStorage.removeItem('admin_session')
          router.replace('/adminteamt4s/login')
          setLoading(false)
          return
        }

        // Step 3: ROLE-BASED ACCESS CONTROL
        // Check if user has permission to access team admin panel
        // Only super_admin or team_admin role can access
        const userRole = (adminData as any)?.role || 'admin'
        const allowedRoles = ['super_admin', 'team_admin']
        if (!allowedRoles.includes(userRole)) {
          // User doesn't have permission for this admin panel
          // Redirect to login
          sessionStorage.removeItem('admin_session')
          router.replace('/adminteamt4s/login')
          setLoading(false)
          return
        }

        // User is authenticated and has correct role - allow access
        setLoading(false)
      } catch (error) {
        sessionStorage.removeItem('admin_session')
        router.replace('/adminteamt4s/login')
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
    return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      {/* Neon grid background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_20%,#3b82f6_0,transparent_35%),radial-gradient(circle_at_80%_30%,#06b6d4_0,transparent_35%),radial-gradient(circle_at_30%_80%,#14b8a6_0,transparent_35%)]"></div>
      <div className="pointer-events-none absolute -inset-24 blur-3xl opacity-[0.15] bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400"></div>
      <TeamAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export { TeamAdminLayout }
export default TeamAdminLayout

