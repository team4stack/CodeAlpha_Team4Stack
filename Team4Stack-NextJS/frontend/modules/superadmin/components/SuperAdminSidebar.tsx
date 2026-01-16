'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { landingApi } from '@/lib/api'

const SuperAdminSidebar: React.FC = () => {
  const pathname = usePathname()
  const [labels, setLabels] = useState<Record<string,string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const result = await landingApi.getSiteSettings([
          'tab_label_hero','tab_label_dashboard','tab_label_projects','tab_label_services','tab_label_reviews','tab_label_courses','tab_label_team','tab_label_mentor','tab_label_contact','tab_label_footer','tab_label_support','tab_label_stackstore','tab_label_settings'
        ])
        if (result.data) {
          const map: Record<string,string> = {}
          result.data.forEach((r: any) => { map[r.key] = r.value })
          setLabels(map)
        }
      } catch (error) {
        console.error('Failed to load tab labels:', error)
      }
    }
    load()
  }, [])

  const links = [
    { to: '/supadmin', label: 'Super Admin Dashboard', icon: '👑', isSuper: true },
    { to: '/supadmin/roles', label: 'Role Management', icon: '🔐', isSuper: true },
    { to: '/supadmin/users', label: 'All Users', icon: '👥', isSuper: true },
    { to: '/supadmin/admins', label: 'Admin Management', icon: '🛡️', isSuper: true },
    { to: '/supadmin/system', label: 'System Settings', icon: '⚙️', isSuper: true },
    { to: '/supadmin/audit', label: 'Audit Logs', icon: '📋', isSuper: true },
    { to: '/adminlandingt4s', label: 'Landing Page Admin', icon: '📊', isSuper: false },
    { to: '/admincourset4s', label: 'Courses Admin', icon: '🎓', isSuper: false },
    { to: '/adminteamt4s', label: 'Team Admin', icon: '👥', isSuper: false },
    { to: '/adminstackt4s', label: 'StackStore Admin', icon: '🧩', isSuper: false },
  ]

  return (
    <aside className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-700/60 min-h-screen p-4 relative shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(100px_60px_at_20%_10%,#7c3aed_0,transparent_60%),radial-gradient(120px_80px_at_80%_30%,#06b6d4_0,transparent_60%)]"></div>
      <div className="mb-6 relative z-10">
        <div className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">Super Admin</div>
        <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Complete Access</div>
      </div>
      <nav className="relative z-10">
        <ul className="space-y-2">
          {links.map(link => {
            const isActive = pathname === link.to || (link.to !== '/supadmin' && pathname?.startsWith(link.to))
            const isDashboard = link.to === '/supadmin'
            return (
              <li key={link.to}>
                <Link
                  href={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group ${
                    isActive
                      ? isDashboard
                        ? 'bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 text-white shadow-lg shadow-yellow-500/40 scale-105 border-2 border-yellow-400/50'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{link.icon}</span>
                  <span className="flex-1">{link.label}</span>
                  {link.isSuper && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-bold">SUPER</span>
                  )}
                  {isActive && (
                    <div className={`absolute right-2 w-2 h-2 rounded-full animate-pulse ${isDashboard ? 'bg-yellow-300 ring-2 ring-yellow-500' : 'bg-white'}`}></div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default SuperAdminSidebar

