'use client'

import React, { useEffect, useState, useRef } from 'react'
import { FiBell, FiX } from 'react-icons/fi'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface NotificationBellProps {
  onClick?: () => void
}

interface Notification {
  id: number | string
  title: string
  message: string
  type: 'application' | 'support' | 'order'
  viewed?: boolean
  createdAt?: string
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [notificationCount, setNotificationCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const loadNotificationsRef = useRef<(loadFullData?: boolean) => Promise<void>>(async () => {})
  const prevShowPopupRef = useRef(false)

  const loadNotifications = async (loadFullData = false) => {
    try {
      let count = 0
      let notifs: Notification[] = []

      // Load notifications based on admin type
      if (pathname?.startsWith('/admincourset4s')) {
        // Courses Admin — show unseen pending applications + unseen course support requests.
        const { coursesApi, landingApi } = await import('@/lib/api')
        const [applicationsResult, supportResult] = await Promise.all([
          coursesApi.getAdmissionForms(),
          landingApi.getSupportRequests({ viewed: false, target_area: 'course' })
        ])
        const allApps = Array.isArray(applicationsResult.data) ? applicationsResult.data : []
        const pendingApps = allApps.filter((app: any) => app.approved === null || app.approved === false)
        const unseenPending = pendingApps.filter((app: any) => app.viewed !== true)
        const unviewedCourseSupport = Array.isArray(supportResult.data) ? supportResult.data : []
        count = unseenPending.length + unviewedCourseSupport.length

        if (loadFullData) {
          notifs = [
            ...unseenPending.slice(0, 7).map((app: any) => ({
              id: app.id,
              title: 'New Application',
              message: `${app.name || app.email} applied for ${app.course_name || 'a course'}`,
              type: 'application' as const,
              viewed: app.viewed || false,
              createdAt: app.created_at
            })),
            ...unviewedCourseSupport.slice(0, 7).map((req: any) => ({
              id: `support-${req.id}`,
              title: 'Course Support',
              message: req.message?.substring(0, 55) + (req.message?.length > 55 ? '...' : '') || 'New course support request',
              type: 'support' as const,
              viewed: req.viewed || false,
              createdAt: req.created_at
            }))
          ].slice(0, 10)
        }
      } else if (pathname?.startsWith('/adminlandingt4s')) {
        // Landing Admin - Unviewed site support only
        const { landingApi } = await import('@/lib/api')
        const result = await landingApi.getSupportRequests({ viewed: false, target_area: 'site' })
        const unviewed = Array.isArray(result.data) ? result.data : []
        count = unviewed.length
        
        if (loadFullData) {
          notifs = unviewed.slice(0, 10).map((req: any) => ({
            id: req.id,
            title: 'Support Request',
            message: req.message?.substring(0, 60) + (req.message?.length > 60 ? '...' : '') || 'New support request',
            type: 'support' as const,
            viewed: req.viewed || false,
            createdAt: req.created_at
          }))
        }
      } else if (pathname?.startsWith('/adminstackt4s')) {
        // StackStore Admin - Pending Orders
        const { stackstoreApi } = await import('@/lib/api')
        const result = await stackstoreApi.getOrders({ status: 'pending' })
        const pending = Array.isArray(result.data) ? result.data : []
        count = pending.length
        
        if (loadFullData) {
          notifs = pending.slice(0, 10).map((order: any) => ({
            id: order.id,
            title: 'Pending Order',
            message: `Order #${order.id} - ${order.total_amount || '0'} PKR`,
            type: 'order' as const,
            viewed: false,
            createdAt: order.created_at
          }))
        }
      } else if (pathname?.startsWith('/supadmin')) {
        // Super Admin - Combine all notifications
        const [coursesApi, landingApi, stackstoreApi] = await Promise.all([
          import('@/lib/api').then(m => m.coursesApi),
          import('@/lib/api').then(m => m.landingApi),
          import('@/lib/api').then(m => m.stackstoreApi)
        ])
        
        const [apps, support, orders] = await Promise.all([
          coursesApi.getAdmissionForms().catch(() => ({ data: [] })),
          landingApi.getSupportRequests({ viewed: false }).catch(() => ({ data: [] })),
          stackstoreApi.getOrders({ status: 'pending' }).catch(() => ({ data: [] }))
        ])
        
        const pendingApps = (Array.isArray(apps.data) ? apps.data : []).filter((app: any) => app.approved === null || app.approved === false)
        const unseenPendingApps = pendingApps.filter((app: any) => app.viewed !== true)
        const unviewedSupport = Array.isArray(support.data) ? support.data : []
        const pendingOrders = Array.isArray(orders.data) ? orders.data : []

        count = unseenPendingApps.length + unviewedSupport.length + pendingOrders.length

        if (loadFullData) {
          notifs = [
            ...unseenPendingApps.slice(0, 5).map((app: any) => ({
              id: `app-${app.id}`,
              title: 'New Application',
              message: `${app.name || app.email} applied for ${app.course_name || 'a course'}`,
              type: 'application' as const,
              viewed: app.viewed || false,
              createdAt: app.created_at
            })),
            ...unviewedSupport.slice(0, 3).map((req: any) => ({
              id: `support-${req.id}`,
              title: 'Support Request',
              message: req.message?.substring(0, 50) + (req.message?.length > 50 ? '...' : '') || 'New support request',
              type: 'support' as const,
              viewed: req.viewed || false,
              createdAt: req.created_at
            })),
            ...pendingOrders.slice(0, 2).map((order: any) => ({
              id: `order-${order.id}`,
              title: 'Pending Order',
              message: `Order #${order.id} - ${order.total_amount || '0'} PKR`,
              type: 'order' as const,
              viewed: false,
              createdAt: order.created_at
            }))
          ].slice(0, 10)
        }
      }

      setNotificationCount(count)
      if (loadFullData) {
        setNotifications(notifs.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        }))
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  loadNotificationsRef.current = loadNotifications

  // Refresh badge count when popup closes (e.g. after mark-as-read / navigation)
  useEffect(() => {
    if (prevShowPopupRef.current && !showPopup) {
      void loadNotificationsRef.current(false)
    }
    prevShowPopupRef.current = showPopup
  }, [showPopup])

  useEffect(() => {
    loadNotifications(false)

    // Auto-refresh every 30 seconds when tab is visible
    let intervalId: NodeJS.Timeout | null = null

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadNotifications(false)
        intervalId = setInterval(() => {
          loadNotifications(false)
        }, 30000)
      } else {
        if (intervalId) {
          clearInterval(intervalId)
          intervalId = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    if (document.visibilityState === 'visible') {
      intervalId = setInterval(() => {
        loadNotifications(false)
      }, 30000)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [pathname])

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        buttonRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false)
      }
    }

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showPopup])

  const handleBellClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (showPopup) {
      setShowPopup(false)
    } else {
      setLoading(true)
      await loadNotifications(true)
      setLoading(false)
      setShowPopup(true)
    }
  }

  const markAsRead = async (notification: Notification) => {
    try {
      if (notification.viewed) {
        // Already viewed, just navigate
        navigateToNotification(notification)
        return
      }

      // Extract actual ID (handle prefixed IDs for superadmin)
      let actualId: number
      if (typeof notification.id === 'string' && notification.id.includes('-')) {
        actualId = Number(notification.id.split('-')[1])
      } else {
        actualId = Number(notification.id)
      }

      if (notification.type === 'application') {
        const { coursesApi } = await import('@/lib/api')
        await coursesApi.updateAdmissionForm(actualId, { viewed: true })
        toast.success('Application marked as viewed!')
      } else if (notification.type === 'support') {
        const { landingApi } = await import('@/lib/api')
        await landingApi.updateSupportRequest(actualId, { viewed: true })
        toast.success('Support request marked as viewed!')
      } else if (notification.type === 'order') {
        // Orders don't have viewed field, just navigate
        toast.success('Opening order details...')
      }

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, viewed: true } : n
      ))
      setNotificationCount(prev => Math.max(0, prev - 1))
      
      // Reload notifications to refresh count
      await loadNotifications(false)
      
      // Navigate to relevant page
      navigateToNotification(notification)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error('Failed to mark notification as read')
      // Still navigate even if marking fails
      navigateToNotification(notification)
    }
  }

  const navigateToNotification = (notification: Notification) => {
    setShowPopup(false)
    if (notification.type === 'application') {
      router.push('/admincourset4s/applications')
    } else if (notification.type === 'support') {
      if (pathname?.startsWith('/admincourset4s')) {
        router.push('/admincourset4s/support')
      } else {
        router.push('/adminlandingt4s/support')
      }
    } else if (notification.type === 'order') {
      router.push('/adminstackt4s/orders')
    }
  }

  return (
    <div className="relative inline-flex shrink-0 overflow-visible" style={{ zIndex: 1000 }}>
      <button
        ref={buttonRef}
        onClick={handleBellClick}
        className="relative p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300 transform hover:scale-105 group"
        title="Notifications"
      >
        <FiBell className="w-5 h-5 group-hover:scale-110 transition-transform" />
      </button>
      {/* Badge: thora aur andar – zyada hissa button ke under */}
      {notificationCount > 0 && (
        <span
          className="absolute min-w-[20px] h-5 flex items-center justify-center px-1.5 rounded-full bg-linear-to-r from-red-500 to-pink-500 text-white text-xs font-bold shadow-lg shadow-red-500/50 border-2 border-white dark:border-gray-900 animate-pulse pointer-events-none"
          style={{
            top: 0,
            right: 0,
            transform: 'translate(40%, -40%)',
          }}
        >
          {notificationCount > 99 ? '99+' : notificationCount}
        </span>
      )}

      {/* Notification Popup */}
      {showPopup && (
        <div
          ref={popupRef}
          className="fixed right-6 w-80 bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-xl rounded-xl shadow-2xl border border-cyan-500/30 overflow-hidden flex flex-col"
          style={{ 
            top: '90px',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 9999,
            animation: 'fadeInUp 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-linear-to-r from-cyan-500/10 to-transparent shrink-0">
            <h3 className="text-white font-bold text-sm">Notifications</h3>
            <button
              onClick={() => setShowPopup(false)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full p-1 transition-all duration-200"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="text-gray-400 text-sm mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <FiBell className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification)}
                  className={`p-4 border-b border-gray-700/50 cursor-pointer transition-all duration-200 hover:bg-cyan-500/10 ${
                    !notification.viewed ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-2 h-2 rounded-full mt-2 ${
                      !notification.viewed ? 'bg-cyan-400 animate-pulse' : 'bg-gray-600'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-semibold text-sm truncate">
                          {notification.title}
                        </h4>
                        {!notification.viewed && (
                          <span className="shrink-0 ml-2 w-2 h-2 bg-cyan-400 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-2 mb-1">
                        {notification.message}
                      </p>
                      {notification.createdAt && (
                        <p className="text-gray-500 text-[10px] mt-1">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700/50 bg-linear-to-r from-transparent via-cyan-500/5 to-transparent shrink-0">
              <button
                onClick={() => {
                  if (pathname?.startsWith('/admincourset4s')) {
                    router.push('/admincourset4s/applications')
                  } else if (pathname?.startsWith('/adminlandingt4s')) {
                    router.push('/adminlandingt4s/support')
                  } else if (pathname?.startsWith('/adminstackt4s')) {
                    router.push('/adminstackt4s/orders')
                  } else if (pathname?.startsWith('/supadmin')) {
                    router.push('/supadmin')
                  }
                  setShowPopup(false)
                }}
                className="w-full text-center text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition-colors"
              >
                View All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
