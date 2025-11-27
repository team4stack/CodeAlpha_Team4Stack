import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../utils/supabaseClient'

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate()
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
          supabase.from('users').select('*', { count: 'exact', head: false }),
          supabase.from('admin_users').select('*', { count: 'exact', head: false }),
          supabase.from('projects').select('id', { count: 'exact', head: true }),
          supabase.from('services').select('id', { count: 'exact', head: true }),
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase.from('admission_forms').select('id', { count: 'exact', head: true }),
        ])

        const users = usersResult.data || []
        const admins = adminsResult.data || []

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
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-4xl mb-2">{icon}</div>
          <div className="text-3xl font-bold mb-1">{value.toLocaleString()}</div>
          <div className="text-white/90 text-sm font-medium">{title}</div>
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
      <div className="bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 rounded-xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-5xl">👑</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Super Admin Dashboard</h1>
              <p className="text-white/90 text-lg">Complete system access and control</p>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/supadmin/roles')}
            className="p-5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">🔐</div>
            <div className="font-bold text-lg mb-1">Manage Roles</div>
            <div className="text-sm opacity-90">Assign and modify user roles</div>
          </button>
          <button
            onClick={() => navigate('/supadmin/admins')}
            className="p-5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">🛡️</div>
            <div className="font-bold text-lg mb-1">Admin Management</div>
            <div className="text-sm opacity-90">Add or remove admins</div>
          </button>
          <button
            onClick={() => navigate('/supadmin/system')}
            className="p-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-bold text-lg mb-1">System Settings</div>
            <div className="text-sm opacity-90">Configure system options</div>
          </button>
          <button
            onClick={() => navigate('/supadmin/audit')}
            className="p-5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">📋</div>
            <div className="font-bold text-lg mb-1">Audit Logs</div>
            <div className="text-sm opacity-90">View system activity</div>
          </button>
          <button
            onClick={() => navigate('/adminlandingt4s')}
            className="p-5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-bold text-lg mb-1">Landing Admin</div>
            <div className="text-sm opacity-90">Switch to admin panel</div>
          </button>
          <button
            onClick={() => navigate('/supadmin/users')}
            className="p-5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="font-bold text-lg mb-1">All Users</div>
            <div className="text-sm opacity-90">View and manage users</div>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border-2 border-yellow-300 dark:border-yellow-700">
        <div className="flex items-start gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Super Admin Access</h3>
            <p className="text-gray-700 dark:text-gray-300">
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
