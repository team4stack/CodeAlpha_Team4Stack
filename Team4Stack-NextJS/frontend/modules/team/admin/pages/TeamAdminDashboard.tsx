'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '@/components/admin/shared/StatCard'

const TeamAdminDashboard: React.FC = () => {
  const router = useRouter()
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
        const { teamApi } = await import('@/lib/api')
        const [membersRes, mentorsRes] = await Promise.all([
          teamApi.getTeamMembers(),
          teamApi.getMentorProfiles(),
        ])
        const members = (membersRes.data as any[]) || []
        const mentors = (mentorsRes.data as any[]) || []
        const activeCount = members.filter((m: any) => m.active === true).length

        setStats({
          totalMembers: members.length,
          activeMembers: activeCount,
          mentorProfiles: mentors.length,
          totalRoles: 0, // TODO: Add roles table
          featuredMembers: 0, // TODO: Add featured flag
          inactiveMembers: Math.max(0, members.length - activeCount),
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
            <div className="text-4xl">👥</div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Team Admin Dashboard</h1>
              <p className="text-white/90 text-sm">Manage team members, mentor profiles, and roles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon="👥"
          gradient="from-blue-500 to-cyan-500"
          onClick={() => router.push('/adminteamt4s/members')}
        />
        <StatCard
          title="Active Members"
          value={stats.activeMembers}
          icon="✅"
          gradient="from-green-500 to-emerald-500"
          onClick={() => router.push('/adminteamt4s/members')}
        />
        <StatCard
          title="Mentor Profiles"
          value={stats.mentorProfiles}
          icon="🎓"
          gradient="from-purple-500 to-pink-500"
          onClick={() => router.push('/adminteamt4s/mentor')}
        />
        <StatCard
          title="Roles & Positions"
          value={stats.totalRoles}
          icon="💼"
          gradient="from-indigo-500 to-blue-500"
          onClick={() => router.push('/adminteamt4s/roles')}
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
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-white flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/adminteamt4s/members')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">👤</div>
            <div className="font-bold text-lg mb-1">Add Team Member</div>
            <div className="text-sm opacity-90">Create new team member profile</div>
          </button>
          <button
            onClick={() => router.push('/adminteamt4s/mentor')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">🎓</div>
            <div className="font-bold text-lg mb-1">Manage Mentor</div>
            <div className="text-sm opacity-90">Update mentor profile</div>
          </button>
          <button
            onClick={() => router.push('/adminteamt4s/roles')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">💼</div>
            <div className="font-bold text-lg mb-1">Manage Roles</div>
            <div className="text-sm opacity-90">Configure team roles</div>
          </button>
          <button
            onClick={() => router.push('/adminteamt4s/settings')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-bold text-lg mb-1">Settings</div>
            <div className="text-sm opacity-90">Configure team settings</div>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm rounded-xl p-5 border border-orange-200/50 dark:border-orange-800/50">
        <h3 className="text-base font-bold mb-2 text-gray-800 dark:text-white">📝 Team Management</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Manage all aspects of your team including member profiles, mentor information, roles, and positions.
          All changes are logged for audit purposes.
        </p>
      </div>
    </div>
  )
}

export default TeamAdminDashboard

