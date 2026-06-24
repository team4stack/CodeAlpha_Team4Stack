'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { landingApi } from '@/lib/api'
import {
  FiLayout,
  FiPackage,
  FiTag,
  FiShoppingCart,
  FiUser,
  FiSettings,
  FiLogOut,
  FiClipboard
} from 'react-icons/fi'
import SidebarPinButton from '@/components/admin/shared/SidebarPinButton'
import NotificationBadge from '@/components/admin/shared/NotificationBadge'

const StackStoreAdminSidebar: React.FC = () => {
  const pathname = usePathname()
  const [labels, setLabels] = useState<Record<string, string>>({})
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [pendingOrders, setPendingOrders] = useState(0)
  useEffect(() => {
    const load = async () => {
      try {
        const result = await landingApi.getSiteSettings(['tab_label_stackstore'])
        if (result.data && Array.isArray(result.data)) {
          const map: Record<string, string> = {}
          result.data.forEach((r: any) => { map[r.key] = r.value })
          setLabels(map)
        }
      } catch (error) {
        console.error('Failed to load tab labels:', error)
      }
    }
    load()
  }, [])

  // Load pending orders count for notification badge
  useEffect(() => {
    const loadPendingOrders = async () => {
      try {
        const { stackstoreApi } = await import('@/lib/api')
        const result = await stackstoreApi.getOrders({ status: 'pending' })
        const pending = Array.isArray(result.data) ? result.data : []
        setPendingOrders(pending.length)
      } catch (error) {
        console.error('Failed to load pending orders:', error)
      }
    }

    loadPendingOrders()

    // Auto-refresh every 30 seconds when tab is visible
    let intervalId: NodeJS.Timeout | null = null

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadPendingOrders()
        intervalId = setInterval(() => {
          loadPendingOrders()
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
        loadPendingOrders()
      }, 30000)
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [])


  const links = [
    { to: '/adminstackt4s', label: labels.tab_label_stackstore || 'StackStore', icon: FiLayout },
    { to: '/adminstackt4s/products', label: 'Products', icon: FiPackage },
    { to: '/adminstackt4s/categories', label: 'Categories', icon: FiTag },
    { to: '/adminstackt4s/orders', label: 'Orders', icon: FiShoppingCart },
    { to: '/adminstackt4s/applications', label: 'Seller Apps', icon: FiClipboard },
    { to: '/adminstackt4s/sellers', label: 'Sellers', icon: FiUser },
    { to: '/adminstackt4s/settings', label: 'Settings', icon: FiSettings },
  ]

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session')
    window.location.href = '/adminstackt4s/login'
  }

  const handleLinkMouseEnter = (linkTo: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect()
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8
      })
    }
    setHoveredLink(linkTo)
  }

  const handleLinkMouseLeave = () => {
    setHoveredLink(null)
    setTooltipPosition(null)
  }

  return (
    <div
      className="relative flex h-full w-fit min-w-0 overflow-visible"
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
    >
      <aside
        className={`admin-sidebar-panel ${isCollapsed ? 'w-20' : 'w-64'} relative flex h-full flex-col overflow-visible border-r border-cyan-500/20 bg-black/40 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900/90 via-black/80 to-slate-900/90"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(200px_100px_at_20%_10%,rgba(6,182,212,0.4)_0,transparent_60%),radial-gradient(250px_120px_at_80%_30%,rgba(249,115,22,0.3)_0,transparent_60%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"
          aria-hidden
        />

        <SidebarPinButton
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isSidebarHovered={isSidebarHovered}
        />

        <div
          className={`admin-sidebar-scrollbar relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-visible pb-4 pt-3 ${isCollapsed ? 'px-2' : 'px-4'}`}
        >
          <nav>
            <ul className="space-y-2">
              {links.map((link) => {
                const isActive = pathname === link.to || (link.to !== '/adminstackt4s' && pathname?.startsWith(link.to))
                const IconComponent = link.icon
                return (
                  <li key={link.to} className="relative">
                    <Link
                      href={link.to}
                      className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-[440ms] ease-[cubic-bezier(0.22,1,0.36,1)] relative group overflow-visible ${
                        isActive
                          ? isCollapsed
                            ? 'border border-transparent bg-transparent text-cyan-100 shadow-none hover:bg-white/[0.06]'
                            : 'border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-orange-500/20 text-white shadow-lg shadow-cyan-500/30'
                          : 'border border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                      onMouseEnter={(e) => handleLinkMouseEnter(link.to, e)}
                      onMouseLeave={handleLinkMouseLeave}
                    >
                      {isActive && !isCollapsed && (
                        <>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-orange-500/10 opacity-50"></div>
                          <div className="absolute bottom-0 left-0 top-0 w-1 rounded-l-xl bg-gradient-to-b from-cyan-400 to-orange-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                        </>
                      )}

                      <div className="relative flex min-h-10 min-w-10 shrink-0 items-center justify-center">
                        {isActive && isCollapsed && (
                          <span
                            aria-hidden
                            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-br from-cyan-500/65 via-cyan-600/45 to-orange-500/50 shadow-[0_0_24px_rgba(34,211,238,0.72),0_0_48px_rgba(6,182,212,0.38),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-cyan-200/35"
                          />
                        )}
                        <IconComponent
                          className={`relative z-10 h-5 w-5 transition-all duration-[440ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isActive
                              ? isCollapsed
                                ? 'admin-sidebar-collapsed-active-icon scale-110'
                                : 'scale-110 text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                              : 'group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                            }`}
                          strokeWidth={isActive && isCollapsed ? 2.75 : 2}
                        />
                        {/* Notification Badge for Orders */}
                        {link.to === '/adminstackt4s/orders' && (
                          <NotificationBadge count={pendingOrders} className="z-20" />
                        )}
                      </div>

                      {!isCollapsed && (
                        <span className="flex-1 relative z-10">{link.label}</span>
                      )}

                      {/* Active Indicator */}
                      {isActive && !isCollapsed && (
                        <div className="absolute right-3 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)] animate-pulse"></div>
                      )}

                      {/* Hover Glow */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-orange-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-orange-500/5 group-hover:to-cyan-500/5 transition-all duration-[440ms] ease-[cubic-bezier(0.22,1,0.36,1)]"></div>
                      )}
                    </Link>

                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Logout Button at Bottom (inside scroll area) */}
          <div className="mt-auto pt-4 pb-4 border-t border-cyan-500/20 flex-shrink-0">
            <div className="relative">
              <button
                onClick={handleLogout}
                className={`w-full ${isCollapsed ? 'px-2 justify-center' : 'px-4'} py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 backdrop-blur-md text-white border border-red-500/30 hover:border-red-400/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-[440ms] ease-[cubic-bezier(0.22,1,0.36,1)] relative overflow-hidden group font-medium text-sm flex items-center justify-center gap-2`}
                onMouseEnter={(e) => {
                  if (isCollapsed) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltipPosition({
                      top: rect.top + rect.height / 2,
                      left: rect.right + 8
                    })
                  }
                  setHoveredLink('logout')
                }}
                onMouseLeave={handleLinkMouseLeave}
              >
                <FiLogOut className="w-5 h-5" />
                {!isCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Tooltip - Fixed Position Outside Sidebar */}
      {isCollapsed && hoveredLink && tooltipPosition && (
        <div
          className="fixed z-[9999] px-3 py-2 rounded-lg bg-black/90 backdrop-blur-md text-white text-sm font-medium whitespace-nowrap shadow-xl border border-cyan-500/30 pointer-events-auto"
          style={{
            left: `${tooltipPosition.left}px`,
            top: `${tooltipPosition.top}px`,
            transform: 'translateY(-50%)'
          }}
          onMouseEnter={() => {
            // Keep tooltip visible when hovering over it
          }}
          onMouseLeave={handleLinkMouseLeave}
        >
          {hoveredLink === 'logout' ? (
            <button
              onClick={handleLogout}
              className="block hover:text-red-400 transition-colors w-full text-left"
            >
              Logout
            </button>
          ) : (
            <Link
              href={hoveredLink}
              className="block hover:text-cyan-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {links.find(l => l.to === hoveredLink)?.label}
            </Link>
          )}
          {/* Arrow pointing to icon */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-black/90"></div>
        </div>
      )}
    </div>
  )
}

export default StackStoreAdminSidebar
