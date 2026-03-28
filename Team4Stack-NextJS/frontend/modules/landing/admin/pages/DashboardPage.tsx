'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '@/components/admin/shared/StatCard'
import QuickActions from '@/components/admin/shared/QuickActions'
import { landingApi, coursesApi } from '@/lib/api'

type Activity = {
  id: string
  type: 'project' | 'service' | 'review' | 'course' | 'contact' | 'support'
  title: string
  timestamp: string
  action: string
}

const DashboardPage: React.FC = () => {
  const router = useRouter()
  const [stats, setStats] = useState({
    projects: 0,
    services: 0,
    reviews: 0,
    courses: 0,
    contacts: 0,
    activeServices: 0,
    inactiveServices: 0,
    approvedReviews: 0,
    unapprovedReviews: 0,
    supportRequests: 0,
    pendingSupport: 0,
    viewedSupport: 0,
    unviewedSupport: 0,
    viewedForms: 0,
    unviewedForms: 0
  })
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch all data via API and count on client side
        const [projectsResult, servicesResult, reviewsResult, coursesResult, admissionFormsResult, supportRequestsResult] = await Promise.all([
          landingApi.getProjects().catch(() => ({ data: [] as any[] })),
          landingApi.getServices().catch(() => ({ data: [] as any[] })),
          landingApi.getReviews().catch(() => ({ data: [] as any[] })),
          coursesApi.getAllCourses().catch(() => ({ data: [] as any[] })),
          coursesApi.getAdmissionForms().catch(() => ({ data: [] as any[] })),
          landingApi.getSupportRequests().catch(() => ({ data: [] as any[] }))
        ])

        // Count projects
        const projects = Array.isArray(projectsResult.data) ? projectsResult.data.length : 0

        // Count services
        const allServices = Array.isArray(servicesResult.data) ? servicesResult.data : []
        const services = allServices.length
        const activeServices = allServices.filter((s: any) => s.active === true).length
        const inactiveServices = allServices.filter((s: any) => s.active === false).length

        // Count reviews
        const allReviews = Array.isArray(reviewsResult.data) ? reviewsResult.data : []
        const reviews = allReviews.length
        const approvedReviews = allReviews.filter((r: any) => r.status === 'approved').length

        // Count courses
        const courses = Array.isArray(coursesResult.data) ? coursesResult.data.length : 0

        // Count admission forms
        const allAdmissionForms = Array.isArray(admissionFormsResult.data) ? admissionFormsResult.data : []
        const contacts = allAdmissionForms.length
        const viewedForms = allAdmissionForms.filter((f: any) => f.viewed === true).length

        // Count support requests
        const allSupportRequests = Array.isArray(supportRequestsResult.data) ? supportRequestsResult.data : []
        const supportRequests = allSupportRequests.length
        const pendingSupport = allSupportRequests.filter((r: any) => r.status === 'pending').length
        const viewedSupport = allSupportRequests.filter((r: any) => r.viewed === true).length

        // Calculate unapproved reviews (total - approved)
        const unapprovedReviews = reviews - approvedReviews
        // Calculate unviewed support requests (total - viewed)
        const unviewedSupport = supportRequests - viewedSupport
        // Calculate unviewed forms (total - viewed)
        const unviewedForms = contacts - viewedForms

        setStats({
          projects,
          services,
          reviews,
          courses,
          contacts,
          activeServices,
          inactiveServices,
          approvedReviews,
          unapprovedReviews,
          supportRequests,
          pendingSupport,
          viewedSupport,
          unviewedSupport,
          viewedForms,
          unviewedForms
        })
        setLoading(false)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
        console.error('Error loading stats:', error)
        }
        setLoading(false)
      }
    }

    const loadActivity = async () => {
      try {
        // Fetch recent activity in parallel - optimized with error handling
        const activities: Activity[] = []
        
        // Fetch each table via API
        const [projectsResult, servicesResult, reviewsResult, coursesResult] = await Promise.all([
          landingApi.getProjects().catch(() => ({ data: [] as any[] })),
          landingApi.getServices().catch(() => ({ data: [] as any[] })),
          landingApi.getReviews().catch(() => ({ data: [] as any[] })),
          coursesApi.getAllCourses().catch(() => ({ data: [] as any[] }))
        ])

        // Get recent items (sorted by id descending, limit 2)
        const recentProjects = Array.isArray(projectsResult.data) 
          ? projectsResult.data.sort((a: any, b: any) => (b.id || 0) - (a.id || 0)).slice(0, 2)
          : []
        const recentServices = Array.isArray(servicesResult.data)
          ? servicesResult.data.sort((a: any, b: any) => (b.id || 0) - (a.id || 0)).slice(0, 2)
          : []
        const recentReviews = Array.isArray(reviewsResult.data)
          ? reviewsResult.data.sort((a: any, b: any) => (b.id || 0) - (a.id || 0)).slice(0, 2)
          : []
        const recentCourses = Array.isArray(coursesResult.data)
          ? coursesResult.data.sort((a: any, b: any) => (b.id || 0) - (a.id || 0)).slice(0, 2)
          : []

        // Process projects
        if (recentProjects && Array.isArray(recentProjects)) {
          for (let i = 0; i < recentProjects.length; i++) {
            const p: any = recentProjects[i];
            try {
              if (p && typeof p === 'object' && p.id !== undefined && p.title !== undefined) {
                activities.push({
                  id: String(p.id),
                  type: 'project' as const,
                  title: String(p.title) || 'Untitled Project',
                  timestamp: new Date().toISOString(),
                  action: 'created'
                })
              }
            } catch (e) {
              // Skip invalid items
            }
          }
        }

        // Process services
        if (recentServices && Array.isArray(recentServices)) {
          for (let i = 0; i < recentServices.length; i++) {
            const s: any = recentServices[i];
            try {
              if (s && typeof s === 'object' && s.id !== undefined && s.title !== undefined) {
                activities.push({
                  id: String(s.id),
                  type: 'service' as const,
                  title: String(s.title) || 'Untitled Service',
                  timestamp: new Date().toISOString(),
                  action: 'created'
                })
              }
            } catch (e) {
              // Skip invalid items
            }
          }
        }

        // Process reviews
        if (recentReviews && Array.isArray(recentReviews)) {
          for (let i = 0; i < recentReviews.length; i++) {
            const r: any = recentReviews[i];
            try {
              if (r && typeof r === 'object' && r.id !== undefined && r.name !== undefined) {
                activities.push({
                  id: String(r.id),
                  type: 'review' as const,
                  title: `${String(r.name) || 'Anonymous'}'s review`,
                  timestamp: new Date().toISOString(),
                  action: 'submitted'
                })
              }
            } catch (e) {
              // Skip invalid items
            }
          }
        }

        // Process courses
        if (recentCourses && Array.isArray(recentCourses)) {
          for (let i = 0; i < recentCourses.length; i++) {
            const c: any = recentCourses[i];
            try {
              if (c && typeof c === 'object' && c.id !== undefined && c.title !== undefined) {
                activities.push({
                  id: String(c.id),
                  type: 'course' as const,
                  title: String(c.title) || 'Untitled Course',
                  timestamp: new Date().toISOString(),
                  action: 'created'
                })
              }
            } catch (e) {
              // Skip invalid items
            }
          }
        }

        // Process support requests via API
        try {
          const supportResult = await landingApi.getSupportRequests()
          const allSupport = Array.isArray(supportResult.data) ? supportResult.data : []
          const recentSupport = allSupport
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5)
          
          if (recentSupport && Array.isArray(recentSupport)) {
            for (let i = 0; i < recentSupport.length; i++) {
              const s: any = recentSupport[i];
              try {
                if (s && typeof s === 'object' && s.id !== undefined && s.email !== undefined) {
                  activities.push({
                    id: String(s.id),
                    type: 'support' as const,
                    title: `Support request from ${String(s.email) || 'Unknown'}`,
                    timestamp: String(s.created_at) || new Date().toISOString(),
                    action: String(s.reason) || 'submitted'
                  })
                }
              } catch (e) {
                // Skip invalid items
              }
            }
          }
        } catch (err) {
          // Ignore errors
          if (process.env.NODE_ENV === 'development') {
            console.warn('Error loading support requests:', err)
          }
        }

        // Sort by timestamp and take latest 5 only
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        setRecentActivity(activities.slice(0, 5))
        setActivityLoading(false)
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
        console.error('Error loading activity:', error)
        }
        setActivityLoading(false)
      }
    }

    // Load stats first (fast), then activity
    loadStats()
    loadActivity()
    // Note: Real-time subscriptions removed - using backend API
  }, [])

  const getActivityIcon = (type: Activity['type']): string => {
    switch (type) {
      case 'project': return '🛠️'
      case 'service': return '💼'
      case 'review': return '⭐'
      case 'course': return '🎓'
      case 'contact': return '📧'
      case 'support': return '💬'
      default: return '📝'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <h1 className="text-xl sm:text-2xl font-bold">Landing Admin Dashboard</h1>
          <p className="text-white/90 text-xs sm:text-sm mt-1">Overview of all landing page content and activities</p>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard 
              title="Projects" 
              value={stats.projects} 
              trend="" 
              icon="🛠️" 
              onClick={() => router.push('/adminlandingt4s/projects')}
            />
            <StatCard 
              title="Reviews" 
              value={stats.reviews} 
              icon="⭐" 
              onClick={() => router.push('/adminlandingt4s/reviews')}
              badges={[
                { label: 'Approved', value: stats.approvedReviews, color: 'green' },
                { label: 'Unapproved', value: stats.unapprovedReviews, color: 'red' }
              ]}
            />
            <StatCard 
              title="Services" 
              value={stats.services} 
              icon="💼" 
              onClick={() => router.push('/adminlandingt4s/services')}
              badges={[
                { label: 'Active', value: stats.activeServices, color: 'blue' },
                { label: 'Inactive', value: stats.inactiveServices, color: 'orange' }
              ]}
            />
            <StatCard 
              title="Courses" 
              value={stats.courses} 
              trend="" 
              icon="🎓" 
              onClick={() => router.push('/admincourset4s/manage')}
            />
            <StatCard 
              title="Admission Form" 
              value={stats.contacts} 
              icon="📧"
              onClick={() => router.push('/adminlandingt4s/forms')}
              badges={[
                { label: 'Viewed', value: stats.viewedForms, color: 'green' },
                { label: 'Unviewed', value: stats.unviewedForms, color: 'red' }
              ]}
            />
            <StatCard 
              title="Support Requests" 
              value={stats.supportRequests} 
              icon="💬" 
              onClick={() => router.push('/adminlandingt4s/support')}
              badges={[
                { label: 'Viewed', value: stats.viewedSupport, color: 'green' },
                { label: 'Unviewed', value: stats.unviewedSupport, color: 'red' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl p-4 sm:p-5 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-lg">
              <div className="text-xs sm:text-sm font-semibold text-white mb-4">Recent Activity</div>
              {activityLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-sm text-white/60">No recent activity yet.</div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((activity, index) => (
                    <div 
                      key={`${activity.type}-${activity.id}-${index}`} 
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/40 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-md group"
                      onClick={() => {
                        const routes: Partial<Record<Activity['type'], string>> = {
                          project: '/adminlandingt4s/projects',
                          service: '/adminlandingt4s/services',
                          review: '/adminlandingt4s/reviews',
                          course: '/admincourset4s/manage',
                          contact: '/adminlandingt4s/contact',
                          support: '/adminlandingt4s/support'
                        }
                        router.push(routes[activity.type] || '/adminlandingt4s')
                      }}
                    >
                      <div className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-semibold truncate group-hover:text-orange-400 transition-colors">{activity.title}</div>
                        <div className="text-xs text-white/60 mt-0.5">
                          {activity.action} • {formatTime(activity.timestamp)}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <QuickActions />
          </div>

        </>
      )}
    </div>
  )
}

export default DashboardPage



