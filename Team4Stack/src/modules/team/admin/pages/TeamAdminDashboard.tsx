import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../../components/admin/shared/StatCard'
import { supabase } from '../../../utils/supabaseClient'

const TeamAdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    mentorProfiles: 0,
    totalRoles: 0,
    featuredMembers: 0,
    inactiveMembers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch team members count
        const { count: membersCount } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })

        // Fetch mentor profile count
        const { count: mentorCount } = await supabase
          .from('mentor_profile')
          .select('*', { count: 'exact', head: true })

        // Fetch active members
        const { count: activeCount } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('active', true)

        setStats({
          totalMembers: membersCount || 0,
          activeMembers: activeCount || 0,
          mentorProfiles: mentorCount || 0,
          totalRoles: 0, // TODO: Add roles table
          featuredMembers: 0, // TODO: Add featured flag
          inactiveMembers: (membersCount || 0) - (activeCount || 0),
        })
      } catch (error) {
        console.error('Error loading Team stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-cyan-600 to-teal-500 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">👥 Team Admin Dashboard</h1>
        <p className="text-white/90">Manage team members, mentor profiles, and roles</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon="👥"
          gradient="from-blue-500 to-cyan-500"
          onClick={() => navigate('/adminteamt4s/members')}
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          icon="✅"
          gradient="from-green-500 to-emerald-500"
          onClick={() => navigate('/adminteamt4s/members')}
        />
        <StatCard
          title="Mentor Profiles"
          value={stats.mentorProfiles}
          icon="🎓"
          gradient="from-purple-500 to-pink-500"
          onClick={() => navigate('/adminteamt4s/mentor')}
        />
        <StatCard
          title="Roles & Positions"
          value={stats.totalRoles}
          icon="💼"
          gradient="from-indigo-500 to-blue-500"
          onClick={() => navigate('/adminteamt4s/roles')}
        />
        <StatCard
          title="Featured Members"
          value={stats.featuredMembers}
          icon="⭐"
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="Inactive Members"
          value={stats.inactiveMembers}
          icon="⏸️"
          gradient="from-gray-500 to-slate-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/adminteamt4s/members')}
            className="p-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="font-semibold">Add Team Member</div>
            <div className="text-sm opacity-90">Create new team member profile</div>
          </button>
          <button
            onClick={() => navigate('/adminteamt4s/mentor')}
            className="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
          >
            <div className="text-2xl mb-2">🎓</div>
            <div className="font-semibold">Manage Mentor</div>
            <div className="text-sm opacity-90">Update mentor profile</div>
          </button>
          <button
            onClick={() => navigate('/adminteamt4s/roles')}
            className="p-4 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
          >
            <div className="text-2xl mb-2">💼</div>
            <div className="font-semibold">Manage Roles</div>
            <div className="text-sm opacity-90">Configure team roles</div>
          </button>
          <button
            onClick={() => navigate('/adminteamt4s/settings')}
            className="p-4 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-lg"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-semibold">Settings</div>
            <div className="text-sm opacity-90">Configure team settings</div>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">📝 Team Management</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Manage all aspects of your team including member profiles, mentor information, roles, and positions.
          All changes are logged for audit purposes.
        </p>
      </div>
    </div>
  )
}

export default TeamAdminDashboard

