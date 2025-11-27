import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import SuperAdminSidebar from './SuperAdminSidebar'
import AdminHeader from '../../../components/admin/shared/AdminHeader'
import { supabase } from '../../../utils/supabaseClient'
import { isEmailAllowedForAdmin } from '../../../auth/utils/adminSecurity'

const SuperAdminLayout: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      // Check custom admin session
      const adminSessionStr = sessionStorage.getItem('admin_session')
      
      if (!adminSessionStr) {
        navigate('/supadmin/login', { replace: true })
        setLoading(false)
        return
      }

      try {
        const adminSession = JSON.parse(adminSessionStr)
        
        // Check if session is expired
        if (!adminSession.expiresAt || Date.now() >= adminSession.expiresAt) {
          sessionStorage.removeItem('admin_session')
          navigate('/supadmin/login', { replace: true })
          setLoading(false)
          return
        }

        const userEmail = adminSession.email?.toLowerCase().trim()
        
        if (!userEmail) {
          sessionStorage.removeItem('admin_session')
          navigate('/supadmin/login', { replace: true })
          setLoading(false)
          return
        }

        // Environment variable check (MUST for super admin)
        // Super admin MUST be in .env file for security
        if (!isEmailAllowedForAdmin(userEmail)) {
          sessionStorage.removeItem('admin_session')
          navigate('/supadmin/login', { replace: true })
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
          navigate('/supadmin/login', { replace: true })
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
              navigate('/adminlandingt4s', { replace: true })
              break
            case 'stackstore_admin':
              navigate('/adminstackt4s', { replace: true })
              break
            case 'courses_admin':
              navigate('/admincourset4s', { replace: true })
              break
            case 'team_admin':
              navigate('/adminteamt4s', { replace: true })
              break
            default:
              navigate('/adminlandingt4s/login', { replace: true })
          }
          setLoading(false)
          return
        }

        // User is authenticated and is super admin - allow access
        setLoading(false)
      } catch (error) {
        sessionStorage.removeItem('admin_session')
        navigate('/supadmin/login', { replace: true })
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
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout

