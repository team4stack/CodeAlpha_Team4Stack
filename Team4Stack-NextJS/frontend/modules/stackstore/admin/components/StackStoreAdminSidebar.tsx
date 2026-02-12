'use client'

import React, { useEffect, useState, useRef } from 'react'
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
  FiLogOut
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
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const dashboardLinkRef = useRef<HTMLAnchorElement | null>(null)
  const topSectionRef = useRef<HTMLDivElement | null>(null)

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
        const pending = result.data || []
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
    { to: '/adminstackt4s', label: labels.tab_label_stackstore || 'Dashboard', icon: FiLayout },
    { to: '/adminstackt4s/products', label: 'Products', icon: FiPackage },
    { to: '/adminstackt4s/categories', label: 'Categories', icon: FiTag },
    { to: '/adminstackt4s/orders', label: 'Orders', icon: FiShoppingCart },
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
      className="relative h-full flex overflow-visible w-fit min-w-0"
      onMouseEnter={() => setIsSidebarHovered(true)}
      onMouseLeave={() => setIsSidebarHovered(false)}
    >
      <aside
        className={`${isCollapsed ? 'w-20' : 'w-64'} bg-black/40 backdrop-blur-2xl border-r border-cyan-500/20 flex flex-col relative shadow-2xl shadow-cyan-500/10 transition-all duration-300 ease-in-out h-full overflow-hidden`}
      >
        {/* Dark Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-black/80 to-slate-900/90"></div>

        {/* Subtle Neon Accents */}
        <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(200px_100px_at_20%_10%,rgba(6,182,212,0.4)_0,transparent_60%),radial-gradient(250px_120px_at_80%_30%,rgba(249,115,22,0.3)_0,transparent_60%)]"></div>

        {/* Glowing Border Effect */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"></div>

        {/* Fixed top section: Pin button only – no scroll, always visible */}
        <div ref={topSectionRef} className="flex-shrink-0 h-8 relative z-10" aria-hidden />

        <SidebarPinButton
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isSidebarHovered={isSidebarHovered}
          dashboardLinkRef={dashboardLinkRef}
          sidebarWidth={isCollapsed ? 80 : 256}
          topSectionRef={topSectionRef}
        />

        {/* Scrollable area: nav + logout only */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-visible p-4 relative z-10 admin-custom-scrollbar">
          <nav>
            <ul className="space-y-2">
              {links.map((link, index) => {
                const isActive = pathname === link.to || (link.to !== '/adminstackt4s' && pathname?.startsWith(link.to))
                const IconComponent = link.icon
                const isHovered = hoveredLink === link.to
                const isDashboard = link.to === '/adminstackt4s'
                return (
                  <li key={link.to} className="relative">
                    <Link
                      ref={(el) => {
                        linkRefs.current[link.to] = el
                        if (isDashboard) {
                          dashboardLinkRef.current = el
                        }
                      }}
                      href={link.to}
                      className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-visible ${isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-orange-500/20 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40'
                          : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                      onMouseEnter={(e) => handleLinkMouseEnter(link.to, e)}
                      onMouseLeave={handleLinkMouseLeave}
                    >
                      {/* Active Glow Effect */}
                      {isActive && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-orange-500/10 opacity-50"></div>
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-orange-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                        </>
                      )}

                      {/* Icon with Glow */}
                      <div className="relative">
                        <IconComponent
                          className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} transition-all duration-300 relative z-10 ${isActive
                              ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                              : 'group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                            }`}
                        />
                        {/* Notification Badge for Orders */}
                        {link.to === '/adminstackt4s/orders' && (
                          <NotificationBadge count={pendingOrders} />
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
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-orange-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:via-orange-500/5 group-hover:to-cyan-500/5 transition-all duration-300"></div>
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
                className={`w-full ${isCollapsed ? 'px-2 justify-center' : 'px-4'} py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 backdrop-blur-md text-white border border-red-500/30 hover:border-red-400/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300 relative overflow-hidden group font-medium text-sm flex items-center justify-center gap-2`}
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
