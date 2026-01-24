'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SuperAdminSidebar from './SuperAdminSidebar'
import AdminHeader from '../../../components/admin/shared/AdminHeader'
import AdminFooter from '../../../components/admin/shared/AdminFooter'
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
        
        // Check if user is super admin in admin_users table via API
        const { superadminApi } = await import('@/lib/api')
        const adminResult = await superadminApi.checkAdminByEmail(userEmail)

        if (adminResult.error || !adminResult.data || !adminResult.data.email) {
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
    return <div className="h-screen flex items-center justify-center bg-[#0a0a0f]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      {/* Dark Background with Subtle Accents */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-black via-slate-950 to-black"></div>
      
      {/* Subtle Neon Grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] [background-size:50px_50px]"></div>
      
      {/* Ambient Glow Effects */}
      <div className="pointer-events-none fixed inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.15)_0,transparent_50%),radial-gradient(circle_at_80%_30%,rgba(249,115,22,0.1)_0,transparent_50%),radial-gradient(circle_at_50%_80%,rgba(6,182,212,0.08)_0,transparent_50%)]"></div>
      
      {/* Navbar - Full Width at Top */}
      <AdminHeader />
      
      {/* Sidebar and Content - Below Navbar */}
      <div className="flex flex-1 relative z-10">
        <SuperAdminSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 sm:p-6 text-white/90">
            {children}
          </main>
        </div>
      </div>
      
      {/* Footer - Full Width at Bottom (including under sidebar) */}
      <div className="relative z-10">
        <AdminFooter />
      </div>
    </div>
  )
}

export { SuperAdminLayout }
export default SuperAdminLayout

