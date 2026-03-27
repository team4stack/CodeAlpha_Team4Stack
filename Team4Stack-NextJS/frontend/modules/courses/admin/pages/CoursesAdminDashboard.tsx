'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '@/components/admin/shared/StatCard'

const CoursesAdminDashboard: React.FC = () => {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalVideos: 0,
    totalStudents: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalQuizzes: 0,
    averageProgress: 0,
    recentApplications: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const loadStats = useCallback(async () => {
    try {
      const { coursesApi } = await import('@/lib/api')

      const coursesResult = await coursesApi.getAllCourses()
      const coursesData = Array.isArray(coursesResult.data) ? coursesResult.data : []
      const coursesCount = coursesData.length || 0
      const activeCourses = coursesData.filter((course: any) => course.active !== false).length

      let videosCount = 0
      const allCourses = coursesData
      for (const course of allCourses) {
        const videosResult = await coursesApi.getCourseVideos(parseInt(course.id))
        const videosData = Array.isArray(videosResult.data) ? videosResult.data : []
        videosCount += videosData.length || 0
      }

      const allProgressResult = await coursesApi.getAllProgress()
      const allProgress = Array.isArray(allProgressResult.data) ? allProgressResult.data : []
      const progressCount = allProgress.length

      const uniqueStudents = new Set(allProgress.map((p: any) => p.user_id)).size
      const completedCount = allProgress.filter((p: any) => p.completed === true).length

      const allAppsResult = await coursesApi.getAdmissionForms()
      const allApps = Array.isArray(allAppsResult.data) ? allAppsResult.data : []
      const applicationsCount = allApps.length

      const pendingCount = allApps.filter(
        (app: any) => app.approved === null || app.approved === undefined
      ).length
      const approvedCount = allApps.filter((app: any) => app.approved === true).length
      const rejectedCount = allApps.filter((app: any) => app.approved === false).length

      let quizzesCount = 0
      try {
        const allVideosPromises = allCourses.map(async (course: any) => {
          try {
            const videosResult = await coursesApi.getCourseVideos(parseInt(course.id))
            return Array.isArray(videosResult.data) ? videosResult.data : []
          } catch {
            return []
          }
        })
        const allVideosArrays = await Promise.all(allVideosPromises)
        const allVideos = allVideosArrays.flat()

        const quizCheckPromises = allVideos.slice(0, 20).map(async (video: any) => {
          try {
            const quizResult = await coursesApi.getQuizByVideoId(parseInt(video.id))
            return quizResult.data ? 1 : 0
          } catch {
            return 0
          }
        })
        const quizResults = (await Promise.all(quizCheckPromises)) as number[]
        quizzesCount = quizResults.reduce((sum, count) => sum + count, 0)
      } catch (error) {
        console.error('Error calculating quizzes:', error)
        quizzesCount = 0
      }

      const avgProgress = progressCount > 0
        ? Math.round((completedCount / progressCount) * 100) || 0
        : 0

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentApps = allApps.filter((app: any) => {
        if (!app.created_at) return false
        const appDate = new Date(app.created_at)
        return appDate >= sevenDaysAgo
      }).length

      setStats({
        totalCourses: coursesCount || 0,
        activeCourses: activeCourses || 0,
        totalVideos: videosCount || 0,
        totalStudents: uniqueStudents,
        totalApplications: applicationsCount || 0,
        pendingApplications: pendingCount || 0,
        approvedApplications: approvedCount || 0,
        rejectedApplications: rejectedCount || 0,
        totalQuizzes: quizzesCount || 0,
        averageProgress: avgProgress,
        recentApplications: recentApps,
      })
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading Courses stats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()

    let intervalId: NodeJS.Timeout | null = null

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadStats()
        intervalId = setInterval(() => {
          loadStats()
        }, 30000)
      } else if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    if (document.visibilityState === 'visible') {
      intervalId = setInterval(() => {
        loadStats()
      }, 30000)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [loadStats])

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#ff7b21] via-[#ff3d81] to-[#7b4dff] p-5 sm:p-7 shadow-2xl">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_60%)]"></div>
        <div className="absolute -right-16 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/80">Courses Admin</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              Live Command Center
            </h1>
            <p className="text-white/85 text-sm sm:text-base">
              Real-time insight for courses, students, and applications.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              onClick={() => router.push('/admincourset4s/manage')}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-black/20 hover:bg-black/30 transition"
            >
              Manage Courses
            </button>
            <button
              onClick={() => router.push('/admincourset4s/videos')}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-black/20 hover:bg-black/30 transition"
            >
              Manage Videos
            </button>
            <button
              onClick={() => router.push('/admincourset4s/progress')}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-black/20 hover:bg-black/30 transition"
            >
              Student Progress
            </button>
            <button
              onClick={() => router.push('/admincourset4s/applications')}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition"
            >
              Applications
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-emerald-400">Live updates on</span>
          <span className="text-gray-500">•</span>
          <span>Refresh every 30s</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          <button
            onClick={loadStats}
            className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
          >
            Refresh now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon="CRS"
          onClick={() => router.push('/admincourset4s/manage')}
          chartType="line"
          chartData={[
            { name: 'W1', value: Math.max(1, stats.totalCourses - 3) },
            { name: 'W2', value: Math.max(1, stats.totalCourses - 2) },
            { name: 'W3', value: Math.max(1, stats.totalCourses - 1) },
            { name: 'W4', value: stats.totalCourses }
          ]}
        />
        <StatCard
          title="Active Courses"
          value={stats.activeCourses}
          icon="ON"
          onClick={() => router.push('/admincourset4s/manage')}
          chartType="bar"
          chartData={[
            { name: 'Active', value: stats.activeCourses },
            { name: 'Total', value: stats.totalCourses }
          ]}
        />
        <StatCard
          title="Total Videos"
          value={stats.totalVideos}
          icon="VID"
          onClick={() => router.push('/admincourset4s/videos')}
          chartType="area"
          chartData={[
            { name: 'M1', value: Math.max(1, Math.floor(stats.totalVideos * 0.6)) },
            { name: 'M2', value: Math.max(1, Math.floor(stats.totalVideos * 0.75)) },
            { name: 'M3', value: Math.max(1, Math.floor(stats.totalVideos * 0.9)) },
            { name: 'M4', value: stats.totalVideos }
          ]}
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon="STD"
          onClick={() => router.push('/admincourset4s/progress')}
          chartType="area"
          chartData={[
            { name: 'W1', value: Math.max(1, Math.floor(stats.totalStudents * 0.4)) },
            { name: 'W2', value: Math.max(1, Math.floor(stats.totalStudents * 0.6)) },
            { name: 'W3', value: Math.max(1, Math.floor(stats.totalStudents * 0.8)) },
            { name: 'W4', value: stats.totalStudents }
          ]}
        />
        <StatCard
          title="Average Progress"
          value={`${stats.averageProgress}%`}
          icon="AVG"
          onClick={() => router.push('/admincourset4s/progress')}
          chartType="bar"
          chartData={[
            { name: 'W1', value: Math.max(1, stats.averageProgress - 15) },
            { name: 'W2', value: Math.max(1, stats.averageProgress - 10) },
            { name: 'W3', value: Math.max(1, stats.averageProgress - 5) },
            { name: 'W4', value: stats.averageProgress }
          ]}
        />
        <StatCard
          title="Total Quizzes"
          value={stats.totalQuizzes}
          icon="QZ"
          onClick={() => router.push('/admincourset4s/videos')}
          chartType="line"
          chartData={[
            { name: 'W1', value: Math.max(1, stats.totalQuizzes - 2) },
            { name: 'W2', value: Math.max(1, stats.totalQuizzes - 1) },
            { name: 'W3', value: stats.totalQuizzes },
            { name: 'W4', value: stats.totalQuizzes }
          ]}
        />
        <StatCard
          title="Applications"
          value={stats.totalApplications}
          icon="APP"
          onClick={() => router.push('/admincourset4s/applications')}
          chartType="bar"
          chartData={[
            { name: 'Pending', value: stats.pendingApplications },
            { name: 'Approved', value: stats.approvedApplications },
            { name: 'Rejected', value: stats.rejectedApplications }
          ]}
          badges={[
            { label: 'Pending', value: stats.pendingApplications, color: 'yellow' },
            { label: 'Approved', value: stats.approvedApplications, color: 'green' },
            { label: 'Rejected', value: stats.rejectedApplications, color: 'red' }
          ]}
        />
        <StatCard
          title="Recent Apps (7d)"
          value={stats.recentApplications}
          icon="NEW"
          onClick={() => router.push('/admincourset4s/applications')}
          chartType="area"
          chartData={[
            { name: 'D1', value: Math.max(1, Math.floor(stats.recentApplications * 0.3)) },
            { name: 'D2', value: Math.max(1, Math.floor(stats.recentApplications * 0.5)) },
            { name: 'D3', value: Math.max(1, Math.floor(stats.recentApplications * 0.7)) },
            { name: 'D4', value: stats.recentApplications }
          ]}
        />
      </div>
    </div>
  )
}

export default CoursesAdminDashboard
