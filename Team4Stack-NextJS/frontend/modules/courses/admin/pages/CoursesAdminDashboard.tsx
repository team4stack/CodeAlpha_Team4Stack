'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../../components/admin/shared/StatCard'
import { supabase } from '@/lib/supabase/client'

const CoursesAdminDashboard: React.FC = () => {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalVideos: 0,
    totalStudents: 0,
    activeCourses: 0,
    completedCourses: 0,
    totalProgress: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch courses count
        const { count: coursesCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })

        // Fetch videos count
        const { count: videosCount } = await supabase
          .from('videos')
          .select('*', { count: 'exact', head: true })

        // Fetch progress records count
        const { count: progressCount } = await supabase
          .from('progress_records')
          .select('*', { count: 'exact', head: true })

        // Fetch unique students (users with progress)
        const { data: progressData } = await supabase
          .from('progress_records')
          .select('user_id')
        
        const uniqueStudents = new Set(progressData?.map(p => p.user_id) || []).size

        // Fetch completed courses (progress with completed = true)
        const { count: completedCount } = await supabase
          .from('progress_records')
          .select('*', { count: 'exact', head: true })
          .eq('completed', true)

        setStats({
          totalCourses: coursesCount || 0,
          totalVideos: videosCount || 0,
          totalStudents: uniqueStudents,
          activeCourses: coursesCount || 0, // TODO: Add active flag
          completedCourses: completedCount || 0,
          totalProgress: progressCount || 0,
        })
      } catch (error) {
        console.error('Error loading Courses stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-5xl">🎓</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Courses Admin Dashboard</h1>
              <p className="text-white/90 text-lg">Manage courses, videos, and student progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon="📚"
          gradient="from-indigo-500 to-purple-500"
          onClick={() => router.push('/admincourset4s/manage')}
        />
        <StatCard
          title="Total Videos"
          value={stats.totalVideos}
          icon="🎥"
          gradient="from-purple-500 to-pink-500"
          onClick={() => router.push('/admincourset4s/videos')}
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="👥"
          gradient="from-pink-500 to-rose-500"
          onClick={() => router.push('/admincourset4s/progress')}
        />
        <StatCard
          title="Active Courses"
          value={stats.activeCourses}
          icon="✅"
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Completed Courses"
          value={stats.completedCourses}
          icon="🎯"
          gradient="from-blue-500 to-cyan-500"
          onClick={() => router.push('/admincourset4s/progress')}
        />
        <StatCard
          title="Total Progress"
          value={stats.totalProgress}
          icon="📊"
          gradient="from-cyan-500 to-teal-500"
          onClick={() => router.push('/admincourset4s/progress')}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/admincourset4s/manage')}
            className="p-5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">📚</div>
            <div className="font-bold text-lg mb-1">Manage Courses</div>
            <div className="text-sm opacity-90">Create and edit courses</div>
          </button>
          <button
            onClick={() => router.push('/admincourset4s/videos')}
            className="p-5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">🎥</div>
            <div className="font-bold text-lg mb-1">Manage Videos</div>
            <div className="text-sm opacity-90">Add and organize videos</div>
          </button>
          <button
            onClick={() => router.push('/admincourset4s/progress')}
            className="p-5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="font-bold text-lg mb-1">View Progress</div>
            <div className="text-sm opacity-90">Monitor student progress</div>
          </button>
          <button
            onClick={() => router.push('/admincourset4s/settings')}
            className="p-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-bold text-lg mb-1">Settings</div>
            <div className="text-sm opacity-90">Configure course settings</div>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">📝 Course Management</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Manage all aspects of your courses including course creation, video management, and student progress tracking.
          All changes are logged for audit purposes.
        </p>
      </div>
    </div>
  )
}

export default CoursesAdminDashboard
