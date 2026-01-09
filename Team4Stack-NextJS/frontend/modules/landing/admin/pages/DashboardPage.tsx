'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '../../../../components/admin/shared/StatCard'
import QuickActions from '../../../../components/admin/shared/QuickActions'
import { supabase } from '@/lib/supabase/client'

type Activity = {
  id: string
  type: 'project' | 'service' | 'review' | 'course' | 'contact' | 'user' | 'support'
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
    users: 0,
    activeServices: 0,
    inactiveServices: 0,
    approvedReviews: 0,
    unapprovedReviews: 0,
    supportRequests: 0,
    pendingSupport: 0,
    viewedSupport: 0,
    unviewedSupport: 0,
    blockedUsers: 0,
    regularUsers: 0,
    viewedForms: 0,
    unviewedForms: 0
  })
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Fetch all counts in parallel with error handling
        const fetchCount = async (table: string, filter?: { column: string; value: any }) => {
          try {
            let query = supabase.from(table).select('id', { count: 'exact', head: true })
            if (filter) {
              query = query.eq(filter.column, filter.value)
            }
            const { count, error } = await query
            if (error) {
              if (process.env.NODE_ENV === 'development') {
              console.warn(`Error counting ${table}:`, error.message)
              }
              return 0
            }
            return count || 0
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
            console.warn(`Exception counting ${table}:`, err)
            }
            return 0
          }
        }

        const [projects, services, reviews, courses, contacts, users, activeServices, inactiveServices, approvedReviews, supportRequests, pendingSupport, viewedSupport, blockedUsers, viewedForms] = await Promise.all([
          fetchCount('projects'),
          fetchCount('services'),
          fetchCount('reviews'),
          fetchCount('courses'),
          fetchCount('admission_form'),
          fetchCount('users'),
          fetchCount('services', { column: 'active', value: true }),
          fetchCount('services', { column: 'active', value: false }),
          fetchCount('reviews', { column: 'status', value: 'approved' }),
          fetchCount('support_requests'),
          fetchCount('support_requests', { column: 'status', value: 'pending' }),
          fetchCount('support_requests', { column: 'viewed', value: true }),
          fetchCount('users', { column: 'is_blocked', value: true }),
          fetchCount('admission_form', { column: 'viewed', value: true })
        ])

        // Calculate unapproved reviews (total - approved)
        const unapprovedReviews = reviews - approvedReviews
        // Calculate unviewed support requests (total - viewed)
        const unviewedSupport = supportRequests - viewedSupport
        // Calculate regular users (total - blocked)
        const regularUsers = users - blockedUsers
        // Calculate unviewed forms (total - viewed)
        const unviewedForms = contacts - viewedForms

        setStats({
          projects,
          services,
          reviews,
          courses,
          contacts,
          users,
          activeServices,
          inactiveServices,
          approvedReviews,
          unapprovedReviews,
          supportRequests,
          pendingSupport,
          viewedSupport,
          unviewedSupport,
          blockedUsers,
          regularUsers,
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
        
        // Fetch each table separately with error handling
        const fetchWithErrorHandling = async (table: string, select: string, orderBy: string, limit: number): Promise<any[] | null> => {
          try {
            const query = supabase.from(table).select(select).order(orderBy, { ascending: false }).limit(limit)
            const result = await query
            
            if (result.error) {
              // Log error but don't throw - allow other queries to continue
              if (process.env.NODE_ENV === 'development') {
              console.warn(`Error fetching ${table}:`, result.error.message)
              }
              return null
            }
            
            const data = result.data as any;
            return Array.isArray(data) ? data : null
          } catch (err) {
            if (process.env.NODE_ENV === 'development') {
            console.warn(`Exception fetching ${table}:`, err)
            }
            return null
          }
        }

        const [recentProjects, recentServices, recentReviews, recentCourses]: (any[] | null)[] = await Promise.all([
          fetchWithErrorHandling('projects', 'id, title', 'id', 2),
          fetchWithErrorHandling('services', 'id, title', 'id', 2),
          fetchWithErrorHandling('reviews', 'id, name', 'id', 2),
          fetchWithErrorHandling('courses', 'id, title', 'id', 2)
        ])

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

        // Process support requests
        try {
          const { data: recentSupport } = await supabase
            .from('support_requests')
            .select('id,email,reason,created_at')
            .order('created_at', { ascending: false })
            .limit(5)
          
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
          // Table might not exist yet, ignore
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

    // Set up real-time subscriptions - optimized single channel
    const dashboardChannel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        loadStats()
        loadActivity()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        loadStats()
        loadActivity()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
        loadStats()
        loadActivity()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => {
        loadStats()
        loadActivity()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_requests' }, () => {
        loadStats()
        loadActivity()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        loadStats()
        loadActivity()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admission_form' }, () => {
        loadStats()
        loadActivity()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(dashboardChannel)
    }
  }, [])

  const getActivityIcon = (type: Activity['type']): string => {
    switch (type) {
      case 'project': return '🛠️'
      case 'service': return '💼'
      case 'review': return '⭐'
      case 'course': return '🎓'
      case 'contact': return '📧'
      case 'user': return '👤'
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
      <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Dashboard</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              onClick={() => router.push('/adminlandingt4s/courses')}
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
              title="Total Users" 
              value={stats.users} 
              icon="👤"
              onClick={() => router.push('/adminlandingt4s/users')}
              badges={[
                { label: 'Regular', value: stats.regularUsers, color: 'blue' },
                { label: 'Blocked', value: stats.blockedUsers, color: 'red' }
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl p-5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-white/30 dark:border-white/20 shadow-lg">
              <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</div>
              {activityLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">No recent activity yet.</div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((activity, index) => (
                    <div 
                      key={`${activity.type}-${activity.id}-${index}`} 
                      className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-white/50 to-transparent dark:from-gray-700/30 dark:to-transparent hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 border border-white/20 dark:border-white/10 hover:border-purple-300/50 dark:hover:border-purple-600/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-md group"
                      onClick={() => {
                        const routes: Partial<Record<Activity['type'], string>> = {
                          project: '/adminlandingt4s/projects',
                          service: '/adminlandingt4s/services',
                          review: '/adminlandingt4s/reviews',
                          course: '/adminlandingt4s/courses',
                          contact: '/adminlandingt4s/contact',
                          user: '/adminlandingt4s/users',
                          support: '/adminlandingt4s/support'
                        }
                        router.push(routes[activity.type] || '/adminlandingt4s')
                      }}
                    >
                      <div className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 dark:text-white font-semibold truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{activity.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {activity.action} • {formatTime(activity.timestamp)}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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


