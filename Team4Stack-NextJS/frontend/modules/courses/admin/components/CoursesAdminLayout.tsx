'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CoursesAdminSidebar from './CoursesAdminSidebar'
import AdminHeader from '../../../../components/admin/shared/AdminHeader'
import { supabase } from '@/lib/supabase/client'
import { isEmailAllowedForAdmin } from '@/lib/auth/utils/adminSecurity'

interface CoursesAdminLayoutProps {
  children: React.ReactNode
}

const CoursesAdminLayout: React.FC<CoursesAdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      // Check custom admin session
      const adminSessionStr = sessionStorage.getItem('admin_session')
      
      if (!adminSessionStr) {
        router.replace('/admincourset4s/login')
        setLoading(false)
        return
      }

      try {
        const adminSession = JSON.parse(adminSessionStr)
        
        // Check if session is expired
        if (!adminSession.expiresAt || Date.now() >= adminSession.expiresAt) {
          sessionStorage.removeItem('admin_session')
          router.replace('/admincourset4s/login')
          setLoading(false)
          return
        }

        const userEmail = adminSession.email?.toLowerCase().trim()
        
        if (!userEmail) {
          sessionStorage.removeItem('admin_session')
          router.replace('/admincourset4s/login')
          setLoading(false)
          return
        }

        // Environment variable check (only for super admin)
        // Other admins can access via Supabase check only
        const isSuperAdmin = userEmail === 'superadmin@gmail.com'
        if (isSuperAdmin && !isEmailAllowedForAdmin(userEmail)) {
          sessionStorage.removeItem('admin_session')
          router.replace('/admincourset4s/login')
          setLoading(false)
          return
        }
        
        // Check if user is admin in admin_users table
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle()

        if (adminError || !adminData || !adminData.email) {
          sessionStorage.removeItem('admin_session')
          router.replace('/admincourset4s/login')
          setLoading(false)
          return
        }

        // Step 3: ROLE-BASED ACCESS CONTROL
        // Check if user has permission to access courses admin panel
        // Only super_admin or courses_admin role can access
        const userRole = (adminData as any)?.role || 'admin'
        const allowedRoles = ['super_admin', 'courses_admin']
        if (!allowedRoles.includes(userRole)) {
          sessionStorage.removeItem('admin_session')
          router.replace('/adminlandingt4s/login') // Redirect to unified login
          setLoading(false)
          return
        }

        // User is authenticated and has correct role - allow access
        setLoading(false)
      } catch (error) {
        sessionStorage.removeItem('admin_session')
        router.replace('/admincourset4s/login')
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
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      {/* Neon grid background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_20%,#7c3aed_0,transparent_35%),radial-gradient(circle_at_80%_30%,#06b6d4_0,transparent_35%),radial-gradient(circle_at_30%_80%,#22c55e_0,transparent_35%)]"></div>
      <div className="pointer-events-none absolute -inset-24 blur-3xl opacity-[0.15] bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-400"></div>
      <CoursesAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export { CoursesAdminLayout }
export default CoursesAdminLayout

