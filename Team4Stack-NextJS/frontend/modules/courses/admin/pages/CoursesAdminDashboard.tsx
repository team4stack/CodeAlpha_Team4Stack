'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../../components/admin/shared/StatCard'

const CoursesAdminDashboard: React.FC = () => {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalVideos: 0,
    totalStudents: 0,
    activeCourses: 0,
    completedCourses: 0,
    totalProgress: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Import API once
        const { coursesApi } = await import('@/lib/api');
        
        // Fetch courses count via API
        const coursesResult = await coursesApi.getAllCourses();
        const coursesCount = coursesResult.data?.length || 0;

        // Fetch videos count via API - get all courses and sum their videos
        let videosCount = 0;
        const allCourses = coursesResult.data || [];
        for (const course of allCourses) {
          const videosResult = await coursesApi.getCourseVideos(parseInt(course.id));
          videosCount += videosResult.data?.length || 0;
        }

        // Fetch all progress records via API
        const allProgressResult = await coursesApi.getAllProgress();
        const allProgress = allProgressResult.data || [];
        const progressCount = allProgress.length;
        
        // Get unique students
        const uniqueStudents = new Set(allProgress.map((p: any) => p.user_id)).size;
        
        // Count completed
        const completedCount = allProgress.filter((p: any) => p.completed === true).length;

        // Fetch admission applications via API
        const allAppsResult = await coursesApi.getAdmissionForms();
        const allApps = allAppsResult.data || [];
        const applicationsCount = allApps.length;
        
        // Count pending (approved is null or false)
        const pendingCount = allApps.filter(app => app.approved === null || app.approved === false).length;
        
        // Count approved
        const approvedCount = allApps.filter(app => app.approved === true).length;

        setStats({
          totalCourses: coursesCount || 0,
          totalVideos: videosCount || 0,
          totalStudents: uniqueStudents,
          activeCourses: coursesCount || 0, // TODO: Add active flag
          completedCourses: completedCount || 0,
          totalProgress: progressCount || 0,
          totalApplications: applicationsCount || 0,
          pendingApplications: pendingCount || 0,
          approvedApplications: approvedCount || 0,
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
          onClick={() => router.push('/admincourset4s/manage')}
        />
        <StatCard
          title="Total Videos"
          value={stats.totalVideos}
          icon="🎥"
          onClick={() => router.push('/admincourset4s/videos')}
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="👥"
          onClick={() => router.push('/admincourset4s/progress')}
        />
        <StatCard
          title="Active Courses"
          value={stats.activeCourses}
          icon="✅"
        />
        <StatCard
          title="Completed Courses"
          value={stats.completedCourses}
          icon="🎯"
          onClick={() => router.push('/admincourset4s/progress')}
        />
        <StatCard
          title="Total Progress"
          value={stats.totalProgress}
          icon="📊"
          onClick={() => router.push('/admincourset4s/progress')}
        />
        <StatCard
          title="Applications"
          value={stats.totalApplications}
          icon="📝"
          onClick={() => router.push('/admincourset4s/applications')}
          badges={[
            { label: 'Pending', value: stats.pendingApplications, color: 'yellow' },
            { label: 'Approved', value: stats.approvedApplications, color: 'green' }
          ]}
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
            onClick={() => router.push('/admincourset4s/applications')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">📝</div>
            <div className="font-bold text-lg mb-1">Applications</div>
            <div className="text-sm opacity-90">Review and approve applications</div>
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
