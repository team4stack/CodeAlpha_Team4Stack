'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from './LandingAdminSidebar'
import AdminHeader from '@/components/admin/shared/AdminHeader'
import AdminFooter from '@/components/admin/shared/AdminFooter'
import { isTransientAdminDirectoryError } from '../utils/adminSessionCheck'
interface LandingAdminLayoutProps {
  children: React.ReactNode
}

const LandingAdminLayout: React.FC<LandingAdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [verificationDegraded, setVerificationDegraded] = useState(false)

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

        const userEmail = adminSession.email?.toLowerCase().trim()

        if (!userEmail) {
          sessionStorage.removeItem('admin_session')
          router.replace('/adminlandingt4s/login')
          setLoading(false)
          return
        }

        if (!adminSession.apiToken || typeof adminSession.apiToken !== 'string') {
          sessionStorage.removeItem('admin_session')
          router.replace('/adminlandingt4s/login')
          setLoading(false)
          return
        }

        // API TABLE CHECK
        // Multi-layer security: Both environment variable AND API check must pass
        const { superadminApi } = await import('@/lib/api')

        const runDirectoryCheck = async () => {
          let adminResult = await superadminApi.checkAdminByEmail(userEmail)
          for (let attempt = 0; attempt < 2; attempt++) {
            if (!adminResult.error) break
            if (!isTransientAdminDirectoryError(adminResult.error)) break
            superadminApi.clearAdminDirectoryCheckCache(userEmail)
            await new Promise((r) => setTimeout(r, 450 * (attempt + 1)))
            adminResult = await superadminApi.checkAdminByEmail(userEmail)
          }
          return adminResult
        }

        const adminResult = await runDirectoryCheck()
        const adminRow = adminResult.data as any

        if (adminResult.error) {
          if (isTransientAdminDirectoryError(adminResult.error)) {
            setVerificationDegraded(true)
            setLoading(false)
            return
          }
          sessionStorage.removeItem('admin_session')
          router.replace('/adminlandingt4s/login')
          setLoading(false)
          return
        }

        setVerificationDegraded(false)

        // CRITICAL: If user email is NOT in admin_users table, deny access
        // Normal users ka email admin_users mein nahi hoga
        // Only manually added admins will be in admin_users table
        if (!adminRow || !adminRow.email) {
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
        const userRole = String(adminRow?.role || 'admin')
          .toLowerCase()
          .trim()
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
      } catch (error: any) {
        const msg = String(error?.message || error || '')
        if (isTransientAdminDirectoryError(msg)) {
          setVerificationDegraded(true)
          setLoading(false)
          return
        }
        sessionStorage.removeItem('admin_session')
        router.replace('/adminlandingt4s/login')
        setLoading(false)
      }
    }
    
    checkSession()
    
    // Re-check periodically (every 15 minutes — avoids kicking admins on brief API/DB blips)
    const interval = setInterval(() => {
      checkSession()
    }, 15 * 60 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [router])

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#0a0a0f]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div></div>
  }

  return (
    <div className="dark h-screen flex flex-col bg-[#0a0a0f] overflow-x-visible overflow-y-hidden">
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
        {/* Row: sidebar (width from component: 80px collapsed / 256px expanded) + content (flex-1 fills remaining space) */}
        <div className="flex-1 flex min-h-0 min-w-0">
          <aside className="relative z-30 flex h-full w-fit flex-shrink-0 overflow-visible border-r border-white/5">
            <AdminSidebar />
          </aside>
          <div className="flex-1 min-w-0 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden admin-custom-scrollbar">
            <main className="flex-1 min-h-full p-4 pb-8 sm:p-6 sm:pb-10 text-white/90">
              {verificationDegraded && (
                <div
                  className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
                  role="status"
                >
                  <p className="font-medium text-amber-50">Could not verify admin with the server</p>
                  <p className="mt-1 text-amber-100/90">
                    This is usually a temporary API or database issue (for example Supabase paused or backend
                    restarting). Your session is still open. If saving content fails, confirm the backend is running,
                    then open{' '}
                    <code className="rounded bg-black/30 px-1 py-0.5 text-xs text-amber-50">/health/supabase</code> on
                    the API host to confirm the database is reachable.
                  </p>
                </div>
              )}
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

export { LandingAdminLayout }
export default LandingAdminLayout


