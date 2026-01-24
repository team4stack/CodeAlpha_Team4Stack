'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const SuperAdminDashboard: React.FC = () => {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    superAdmins: 0,
    regularAdmins: 0,
    totalProjects: 0,
    totalServices: 0,
    totalCourses: 0,
    totalForms: 0,
    activeSessions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch all counts in parallel
        const [
          usersResult,
          adminsResult,
          projectsResult,
          servicesResult,
          coursesResult,
          formsResult,
        ] = await Promise.all([
          // Users via API
          (async () => {
            const { superadminApi } = await import('@/lib/api')
            const result = await superadminApi.getUsers()
            return { count: result.data?.length || 0, data: result.data || [] }
          })(),
          // Admin users count via API
          (async () => {
            const { superadminApi } = await import('@/lib/api')
            const result = await superadminApi.getAdminUsers()
            return { count: result.data?.length || 0, data: result.data || [] }
          })(),
          // Projects via API
          (async () => {
            const { landingApi } = await import('@/lib/api')
            const result = await landingApi.getProjects()
            return { count: result.data?.length || 0, data: result.data || [] }
          })(),
          // Services via API
          (async () => {
            const { landingApi } = await import('@/lib/api')
            const result = await landingApi.getServices()
            return { count: result.data?.length || 0, data: result.data || [] }
          })(),
          // Courses via API
          (async () => {
            const { coursesApi } = await import('@/lib/api')
            const result = await coursesApi.getAllCourses()
            return { count: result.data?.length || 0, data: result.data || [] }
          })(),
          // Admission forms via API
          (async () => {
            const { coursesApi } = await import('@/lib/api')
            const result = await coursesApi.getAdmissionForms()
            return { count: result.data?.length || 0, data: result.data || [] }
          })(),
        ])

        const users = (usersResult as any).data || []
        const admins = (adminsResult as any).data || []

        setStats({
          totalUsers: users.length,
          totalAdmins: admins.length,
          superAdmins: admins.filter((a: any) => a.role === 'super_admin').length,
          regularAdmins: admins.filter((a: any) => a.role === 'admin').length,
          totalProjects: projectsResult.count || 0,
          totalServices: servicesResult.count || 0,
          totalCourses: coursesResult.count || 0,
          totalForms: formsResult.count || 0,
          activeSessions: 0, // TODO: Implement session tracking
        })
      } catch (error) {
        console.error('Error loading super admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  // Custom Stat Card Component for Super Admin
  const StatCard: React.FC<{ title: string; value: number; icon: string; gradient: string }> = ({ title, value, icon, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} backdrop-blur-sm rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl mb-2">{icon}</div>
          <div className="text-2xl font-bold mb-1">{value.toLocaleString()}</div>
          <div className="text-white/90 text-xs font-medium">{title}</div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-6 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="text-4xl">👑</div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Super Admin Dashboard</h1>
              <p className="text-white/90 text-sm">Complete system access and control</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Total Admins"
          value={stats.totalAdmins}
          icon="🛡️"
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Super Admins"
          value={stats.superAdmins}
          icon="👑"
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Regular Admins"
          value={stats.regularAdmins}
          icon="📊"
          gradient="from-indigo-500 to-purple-500"
        />
        <StatCard
          title="Projects"
          value={stats.totalProjects}
          icon="🛠️"
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Services"
          value={stats.totalServices}
          icon="💼"
          gradient="from-cyan-500 to-blue-500"
        />
        <StatCard
          title="Courses"
          value={stats.totalCourses}
          icon="🎓"
          gradient="from-pink-500 to-rose-500"
        />
        <StatCard
          title="Admission Forms"
          value={stats.totalForms}
          icon="📧"
          gradient="from-violet-500 to-purple-500"
        />
        <StatCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon="🔐"
          gradient="from-teal-500 to-cyan-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-white flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/supadmin/roles')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">🔐</div>
            <div className="font-bold text-lg mb-1">Manage Roles</div>
            <div className="text-sm opacity-90">Assign and modify user roles</div>
          </button>
          <button
            onClick={() => router.push('/supadmin/admins')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">🛡️</div>
            <div className="font-bold text-lg mb-1">Admin Management</div>
            <div className="text-sm opacity-90">Add or remove admins</div>
          </button>
          <button
            onClick={() => router.push('/supadmin/system')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-bold text-lg mb-1">System Settings</div>
            <div className="text-sm opacity-90">Configure system options</div>
          </button>
          <button
            onClick={() => router.push('/supadmin/audit')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="font-bold text-lg mb-1">Audit Logs</div>
            <div className="text-sm opacity-90">View system activity</div>
          </button>
          <button
            onClick={() => router.push('/adminlandingt4s')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-bold text-lg mb-1">Landing Admin</div>
            <div className="text-sm opacity-90">Switch to landing admin panel</div>
          </button>
          <button
            onClick={() => router.push('/admincourset4s')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">🎓</div>
            <div className="font-bold text-lg mb-1">Courses Admin</div>
            <div className="text-sm opacity-90">Switch to courses admin panel</div>
          </button>
          <button
            onClick={() => router.push('/adminteamt4s')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="font-bold text-lg mb-1">Team Admin</div>
            <div className="text-sm opacity-90">Switch to team admin panel</div>
          </button>
          <button
            onClick={() => router.push('/adminstackt4s')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">🧩</div>
            <div className="font-bold text-lg mb-1">StackStore Admin</div>
            <div className="text-sm opacity-90">Switch to stackstore admin panel</div>
          </button>
          <button
            onClick={() => router.push('/supadmin/users')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="font-bold text-lg mb-1">All Users</div>
            <div className="text-sm opacity-90">View and manage users</div>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm rounded-xl p-5 border border-orange-200/50 dark:border-orange-800/50">
        <div className="flex items-start gap-3">
          <div className="text-2xl">⚠️</div>
          <div>
            <h3 className="text-base font-bold mb-2 text-gray-800 dark:text-white">Super Admin Access</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              You have complete access to all system features. Use this power responsibly. 
              All actions are logged for security and audit purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard
