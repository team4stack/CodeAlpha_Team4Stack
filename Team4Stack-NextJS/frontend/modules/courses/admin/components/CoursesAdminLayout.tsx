'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import CoursesAdminSidebar from './CoursesAdminSidebar'
import AdminHeader from '@/components/admin/shared/AdminHeader'
import AdminFooter from '@/components/admin/shared/AdminFooter'
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

        if (!adminSession.apiToken || typeof adminSession.apiToken !== 'string') {
          sessionStorage.removeItem('admin_session')
          router.replace('/admincourset4s/login')
          setLoading(false)
          return
        }

        // Check if user is admin in admin_users table via API
        const { superadminApi } = await import('@/lib/api')
        const adminResult = await superadminApi.checkAdminByEmail(userEmail)
        const adminRow = adminResult.data as any

        if (adminResult.error || !adminRow || !adminRow.email) {
          sessionStorage.removeItem('admin_session')
          router.replace('/admincourset4s/login')
          setLoading(false)
          return
        }

        // Step 3: ROLE-BASED ACCESS CONTROL
        // Check if user has permission to access courses admin panel
        // Only super_admin or courses_admin role can access
        const userRole = adminRow?.role || 'admin'
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
    return <div className="h-screen flex items-center justify-center bg-[#0a0a0f]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f] overflow-x-visible overflow-y-hidden">
      {/* Dark Background with Subtle Accents */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-black via-slate-950 to-black"></div>
      
      {/* Subtle Neon Grid */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] [background-size:50px_50px]"></div>
      
      {/* Ambient Glow Effects */}
      <div className="pointer-events-none fixed inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.15)_0,transparent_50%),radial-gradient(circle_at_80%_30%,rgba(249,115,22,0.1)_0,transparent_50%),radial-gradient(circle_at_50%_80%,rgba(6,182,212,0.08)_0,transparent_50%)]"></div>
      
      {/* Header - Fixed at top, height matches --admin-header-height (80px) */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <AdminHeader />
      </div>
      
      {/* Body: sidebar + content row, then footer full width (sidebar connects to footer top) */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10" style={{ paddingTop: 'var(--admin-header-height, 80px)' }}>
        {/* Row: sidebar + content. Sidebar above content (z-30) so pin button is never covered. Content has ml-4 so it does not overlap pin. No scrollbar added for pin – fix is positioning only. */}
        <div className="flex-1 flex min-h-0 min-w-0 relative">
          <aside className="flex-shrink-0 h-full w-fit overflow-visible border-r border-white/5 relative z-30">
            <CoursesAdminSidebar />
          </aside>
          <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden admin-custom-scrollbar relative z-0 ml-4">
            <main className="flex-1 min-h-full p-4 sm:p-6 text-white/90">
              {children}
            </main>
          </div>
        </div>
        {/* Footer - full width below sidebar & content, sidebar connects at footer top */}
        <div className="w-full flex-shrink-0">
          <AdminFooter />
        </div>
      </div>
    </div>
  )
}

export { CoursesAdminLayout }
export default CoursesAdminLayout

