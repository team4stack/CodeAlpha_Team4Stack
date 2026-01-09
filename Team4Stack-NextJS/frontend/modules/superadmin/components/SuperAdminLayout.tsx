'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminSidebar from './SuperAdminSidebar'
import AdminHeader from '../../../components/admin/shared/AdminHeader'
import { supabase } from '@/lib/supabase/client'
import { isEmailAllowedForAdmin } from '@/lib/utils/adminSecurity'

interface SuperAdminLayoutProps {
  children: React.ReactNode
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      // Check custom admin session
      const adminSessionStr = sessionStorage.getItem('admin_session')
      
      if (!adminSessionStr) {
        router.replace('/supadmin/login')
        setLoading(false)
        return
      }

      try {
        const adminSession = JSON.parse(adminSessionStr)
        
        // Check if session is expired
        if (!adminSession.expiresAt || Date.now() >= adminSession.expiresAt) {
          sessionStorage.removeItem('admin_session')
          router.replace('/supadmin/login')
          setLoading(false)
          return
        }

        const userEmail = adminSession.email?.toLowerCase().trim()
        
        if (!userEmail) {
          sessionStorage.removeItem('admin_session')
          router.replace('/supadmin/login')
          setLoading(false)
          return
        }

        // Environment variable check (MUST for super admin)
        // Super admin MUST be in .env file for security
        if (!isEmailAllowedForAdmin(userEmail)) {
          sessionStorage.removeItem('admin_session')
          router.replace('/supadmin/login')
          setLoading(false)
          return
        }
        
        // Check if user is super admin in admin_users table
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle()

        if (adminError || !adminData || !adminData.email) {
          sessionStorage.removeItem('admin_session')
          router.replace('/supadmin/login')
          setLoading(false)
          return
        }

        // Check if user has super_admin role
        const userRole = (adminData as any)?.role || 'admin'
        if (userRole !== 'super_admin') {
          // Not a super admin, redirect to their appropriate admin panel based on role
          switch (userRole) {
            case 'landing_admin':
            case 'admin':
              router.replace('/adminlandingt4s')
              break
            case 'stackstore_admin':
              router.replace('/adminstackt4s')
              break
            case 'courses_admin':
              router.replace('/admincourset4s')
              break
            case 'team_admin':
              router.replace('/adminteamt4s')
              break
            default:
              router.replace('/adminlandingt4s/login')
          }
          setLoading(false)
          return
        }

        // User is authenticated and is super admin - allow access
        setLoading(false)
      } catch (error) {
        sessionStorage.removeItem('admin_session')
        router.replace('/supadmin/login')
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
      <div className="pointer-events-none absolute -inset-24 blur-3xl opacity-[0.15] bg-gradient-to-br from-fuchsia-500 via-cyan-400 to-emerald-400"></div>
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export { SuperAdminLayout }
export default SuperAdminLayout

