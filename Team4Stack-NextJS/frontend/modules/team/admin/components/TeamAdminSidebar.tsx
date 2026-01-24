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

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session')
    window.location.href = '/adminteamt4s/login'
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-green-500 to-emerald-600 backdrop-blur-xl border-r border-green-400/60 h-full flex flex-col relative shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(100px_60px_at_20%_10%,#22c55e_0,transparent_60%),radial-gradient(120px_80px_at_80%_30%,#10b981_0,transparent_60%)]"></div>
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest font-bold text-white/90 mb-2">Team Admin</div>
          <div className="text-sm text-white/90 font-semibold">Team Management</div>
        </div>
        <nav>
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
                          ? 'bg-white/30 text-white shadow-lg shadow-white/40 scale-105 border-2 border-white/50 backdrop-blur-sm'
                          : 'bg-white/25 text-white shadow-lg shadow-white/30 scale-105 backdrop-blur-sm'
                        : 'text-white/90 hover:bg-white/20 hover:scale-105 hover:shadow-md backdrop-blur-sm'
                    }`}
                  >
                    <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{link.icon}</span>
                    <span className="flex-1">{link.label}</span>
                    {isActive && (
                      <div className={`absolute right-2 w-2 h-2 rounded-full animate-pulse ${isDashboard ? 'bg-white ring-2 ring-white/50' : 'bg-white'}`}></div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      
      {/* Logout Button at Bottom */}
      <div className="p-4 border-t border-white/30 relative z-10">
        <button 
          onClick={handleLogout} 
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group font-semibold text-sm"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span>🚪</span>
            <span>Logout</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </aside>
  )
}

export default TeamAdminSidebar

