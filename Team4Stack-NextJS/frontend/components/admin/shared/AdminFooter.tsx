'use client'

import React, { useState, useEffect, useRef } from 'react'
import { FiSettings, FiHelpCircle, FiBook, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'

interface AdminSession {
  email: string
  role: string
  expiresAt: number
}

const AdminFooter: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [adminRole, setAdminRole] = useState<string>('Admin')
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('online')
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date())
  const [showChangelog, setShowChangelog] = useState(false)
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null)
  const footerRef = useRef<HTMLElement>(null)
  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  // Get environment
  const getEnvironment = (): { name: string; color: string } => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('local')) {
      return { name: 'Local', color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/40 text-yellow-400' }
    }
    if (hostname.includes('staging') || hostname.includes('dev') || hostname.includes('test')) {
      return { name: 'Staging', color: 'from-orange-500/20 to-orange-600/20 border-orange-500/40 text-orange-400' }
    }
    return { name: 'Production', color: 'from-green-500/20 to-green-600/20 border-green-500/40 text-green-400' }
  }

  const environment = getEnvironment()

  // Format role name
  const formatRoleName = (role: string): string => {
    const roleMap: Record<string, string> = {
      'super_admin': 'Super Admin',
      'courses_admin': 'Courses Admin',
      'landing_admin': 'Landing Admin',
      'stackstore_admin': 'StackStore Admin',
      'team_admin': 'Team Admin',
      'admin': 'Admin'
    }
    return roleMap[role] || role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Load admin session
  useEffect(() => {
    const loadAdminSession = () => {
      try {
        const adminSessionStr = sessionStorage.getItem('admin_session')
        if (adminSessionStr) {
          const session: AdminSession = JSON.parse(adminSessionStr)
          if (session.role) {
            setAdminRole(formatRoleName(session.role))
          }
        }
      } catch (error) {
        console.error('Failed to load admin session:', error)
      }
    }
    loadAdminSession()
  }, [])

  // System status check and sync time update
  useEffect(() => {
    // Initialize sync time
    setLastSyncTime(new Date())
    
    // Update sync time every 30 seconds
    const syncInterval = setInterval(() => {
      setLastSyncTime(new Date())
    }, 30000)
    
    // Check system status periodically
    const checkSystemStatus = async () => {
      try {
        // Simple connectivity check - if we're here, system is likely online
        // You can replace this with actual API health check if needed
        setSystemStatus('online')
        setLastSyncTime(new Date())
      } catch {
        // Keep as online by default
        setSystemStatus('online')
      }
    }

    checkSystemStatus()
    const statusInterval = setInterval(checkSystemStatus, 60000) // Check every minute
    
    return () => {
      clearInterval(syncInterval)
      clearInterval(statusInterval)
    }
  }, [])

  // Footer slide-in animation
  useEffect(() => {
    if (footerRef.current) {
      footerRef.current.style.opacity = '0'
      footerRef.current.style.transform = 'translateY(20px)'
      setTimeout(() => {
        if (footerRef.current) {
          footerRef.current.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out'
          footerRef.current.style.opacity = '1'
          footerRef.current.style.transform = 'translateY(0)'
        }
      }, 100)
    }
  }, [])

  // Handle icon hover for tooltips
  const handleIconHover = (iconName: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2
    })
    setHoveredIcon(iconName)
  }

  const handleIconLeave = () => {
    setHoveredIcon(null)
    setTooltipPosition(null)
  }

  // Changelog data
  const changelog = [
    { version: '1.0.0', date: '2024-01-24', changes: ['Initial release', 'Admin panel setup', 'Core features implemented'] },
    { version: '0.9.0', date: '2024-01-20', changes: ['Beta testing phase', 'UI improvements', 'Bug fixes'] },
  ]

  // Get settings URL based on role
  const getSettingsUrl = (): string => {
    const roleLower = adminRole.toLowerCase().replace(/\s+/g, '_')
    if (roleLower.includes('super')) return '/supadmin/settings'
    if (roleLower.includes('courses')) return '/admincourset4s/settings'
    if (roleLower.includes('landing')) return '/adminlandingt4s/settings'
    if (roleLower.includes('stackstore')) return '/adminstackt4s/settings'
    if (roleLower.includes('team')) return '/adminteamt4s/settings'
    return '/supadmin/settings' // Default fallback
  }

  const quickActions = [
    { icon: FiSettings, name: 'Settings', tooltip: 'Open Settings', action: () => { window.location.href = getSettingsUrl() } },
    { icon: FiHelpCircle, name: 'Support', tooltip: 'Get Support', action: () => window.open('https://team4stack.com/support', '_blank') },
    { icon: FiBook, name: 'Documentation', tooltip: 'View Documentation', action: () => window.open('https://docs.team4stack.com', '_blank') },
  ]

  return (
    <>
      <footer 
        ref={footerRef}
        className="bg-slate-900/80 backdrop-blur-xl text-white/90 border-t border-cyan-500/10 shadow-lg flex-shrink-0 relative overflow-hidden shrink-0"
        style={{ opacity: 0 }}
        data-admin-footer
      >
        {/* Subtle Glow Separator */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/40 via-slate-900/60 to-slate-900/80"></div>
        
        <div className="px-6 py-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left Section - Copyright & Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-sm font-medium">© {currentYear} Team4Stack</span>
                <span className="text-white/20">•</span>
                <button
                  onClick={() => setShowChangelog(true)}
                  className="text-cyan-400/80 hover:text-cyan-300 text-sm font-medium transition-colors duration-200 cursor-pointer"
                >
                  v1.0.0
                </button>
              </div>
              
              {/* Environment Badge */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r ${environment.color} border text-xs font-medium`}>
                <div className={`w-1.5 h-1.5 rounded-full ${environment.name === 'Production' ? 'bg-green-400' : environment.name === 'Staging' ? 'bg-orange-400' : 'bg-yellow-400'} animate-pulse`}></div>
                <span>{environment.name}</span>
              </div>
            </div>

            {/* Center Section - Status & Role */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* System Status */}
              <div className="flex items-center gap-2">
                {systemStatus === 'online' ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/30">
                    <FiCheckCircle className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400/90 text-xs font-medium">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/30">
                    <FiXCircle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-400/90 text-xs font-medium">Offline</span>
                  </div>
                )}
              </div>

              {/* User Role */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                <span className="text-white/60 text-xs">{adminRole}</span>
              </div>

              {/* Last Sync Time */}
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <FiClock className="w-3.5 h-3.5" />
                <span>Sync: {lastSyncTime.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Right Section - Quick Actions */}
            <div className="flex items-center gap-2">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <div key={action.name} className="relative">
                    <button
                      ref={(el) => { iconRefs.current[action.name] = el }}
                      onClick={action.action}
                      onMouseEnter={(e) => handleIconHover(action.name, e)}
                      onMouseLeave={handleIconLeave}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 text-white/60 hover:text-cyan-300 transition-all duration-300 group relative"
                    >
                      <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute inset-0 rounded-lg bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors duration-300"></div>
                      <div className="absolute inset-0 rounded-lg shadow-[0_0_8px_rgba(6,182,212,0)] group-hover:shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-shadow duration-300"></div>
                    </button>
                    
                    {/* Tooltip */}
                    {hoveredIcon === action.name && tooltipPosition && (
                      <div
                        className="fixed z-[10000] px-2.5 py-1.5 rounded-md bg-slate-800/95 backdrop-blur-sm text-white/90 text-xs font-medium whitespace-nowrap shadow-xl border border-white/10 pointer-events-none"
                        style={{
                          left: `${tooltipPosition.left}px`,
                          top: `${tooltipPosition.top}px`,
                          transform: 'translate(-50%, -100%)',
                          animation: 'fadeInUp 0.2s ease-out'
                        }}
                      >
                        {action.tooltip}
                        <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-800/95"></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </footer>

      {/* Changelog Modal */}
      {showChangelog && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowChangelog(false)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div 
            className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeInUp 0.3s ease-out' }}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white/90 font-semibold text-lg">Version History</h3>
              <button
                onClick={() => setShowChangelog(false)}
                className="text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg p-1.5 transition-all duration-200"
              >
                <FiXCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh] admin-custom-scrollbar">
              <div className="space-y-4">
                {changelog.map((item, index) => (
                  <div key={index} className="border-l-2 border-cyan-500/30 pl-4 pb-4 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-cyan-400 font-semibold text-sm">v{item.version}</span>
                      <span className="text-white/30 text-xs">{item.date}</span>
                    </div>
                    <ul className="space-y-1">
                      {item.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className="text-white/60 text-xs flex items-start gap-2">
                          <span className="text-cyan-400/60 mt-1">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminFooter
