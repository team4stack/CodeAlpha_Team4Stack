'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { landingApi } from '@/lib/api'

const TeamAdminSidebar: React.FC = () => {
  const pathname = usePathname()
  const [labels, setLabels] = useState<Record<string,string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const result = await landingApi.getSiteSettings(['tab_label_team'])
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
    { to: '/adminteamt4s', label: labels.tab_label_team || 'Dashboard', icon: '👥' },
    { to: '/adminteamt4s/members', label: 'Team Members', icon: '👤' },
    { to: '/adminteamt4s/mentor', label: 'Mentor Profile', icon: '🎓' },
    { to: '/adminteamt4s/roles', label: 'Roles & Positions', icon: '💼' },
    { to: '/adminteamt4s/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <aside className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-700/60 h-full p-4 relative shadow-lg overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(100px_60px_at_20%_10%,#3b82f6_0,transparent_60%),radial-gradient(120px_80px_at_80%_30%,#06b6d4_0,transparent_60%)]"></div>
      <div className="mb-6 relative z-10">
        <div className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">Team Admin</div>
        <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Team Management</div>
      </div>
      <nav className="relative z-10">
        <ul className="space-y-2">
          {links.map(link => {
            const isActive = pathname === link.to || (link.to !== '/adminteamt4s' && pathname?.startsWith(link.to))
            const isDashboard = link.to === '/adminteamt4s'
            return (
              <li key={link.to}>
                <Link
                  href={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group ${
                    isActive
                      ? isDashboard
                        ? 'bg-gradient-to-r from-blue-500 via-cyan-600 to-teal-600 text-white shadow-lg shadow-blue-500/40 scale-105 border-2 border-blue-400/50'
                        : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-900/20 dark:hover:to-cyan-900/20 hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{link.icon}</span>
                  <span className="flex-1">{link.label}</span>
                  {isActive && (
                    <div className={`absolute right-2 w-2 h-2 rounded-full animate-pulse ${isDashboard ? 'bg-blue-300 ring-2 ring-blue-500' : 'bg-white'}`}></div>
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

export default TeamAdminSidebar

