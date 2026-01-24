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
    <aside className="w-64 bg-black/40 backdrop-blur-2xl border-r border-cyan-500/20 flex flex-col relative shadow-2xl shadow-cyan-500/10 min-h-[calc(100vh-80px)]">
      {/* Dark Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-black/80 to-slate-900/90"></div>
      
      {/* Subtle Neon Accents */}
      <div className="pointer-events-none absolute inset-0 opacity-20 [background:radial-gradient(200px_100px_at_20%_10%,rgba(6,182,212,0.4)_0,transparent_60%),radial-gradient(250px_120px_at_80%_30%,rgba(249,115,22,0.3)_0,transparent_60%)]"></div>
      
      {/* Glowing Border Effect */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent"></div>
      
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <nav>
          <ul className="space-y-2">
            {links.map(link => {
              const isActive = pathname === link.to || (link.to !== '/adminteamt4s' && pathname?.startsWith(link.to))
              const isDashboard = link.to === '/adminteamt4s'
              return (
                <li key={link.to}>
                  <Link
                    href={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-orange-500/20 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40'
                        : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {/* Active Glow Effect */}
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-orange-500/10 opacity-50"></div>
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-orange-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                      </>
                    )}
                    
                    {/* Icon with Glow */}
                    <span 
                      className={`text-lg transition-all duration-300 relative z-10 ${
                        isActive 
                          ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' 
                          : 'group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                      }`}
                    >
                      {link.icon}
                    </span>
                    
                    <span className="flex-1 relative z-10">{link.label}</span>
                    
                    {/* Active Indicator */}
                    {isActive && (
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
      </div>
      
      {/* Logout Button at Bottom */}
      <div className="mt-auto px-4 pt-4 pb-4 border-t border-cyan-500/20 relative z-10 flex-shrink-0">
        <button 
          onClick={handleLogout} 
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-md text-white border border-red-500/30 hover:border-red-400/50 hover:bg-gradient-to-r hover:from-red-600/30 hover:to-orange-600/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-300 relative overflow-hidden group font-medium text-sm"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-base">🚪</span>
            <span>Logout</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
        </button>
      </div>
    </aside>
  )
}

export default TeamAdminSidebar

