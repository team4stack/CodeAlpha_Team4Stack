'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { landingApi } from '@/lib/api'

const StackStoreAdminSidebar: React.FC = () => {
  const pathname = usePathname()
  const [labels, setLabels] = useState<Record<string,string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const result = await landingApi.getSiteSettings(['tab_label_stackstore'])
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
    { to: '/adminstackt4s', label: labels.tab_label_stackstore || 'Dashboard', icon: '🧩' },
    { to: '/adminstackt4s/products', label: 'Products', icon: '📦' },
    { to: '/adminstackt4s/categories', label: 'Categories', icon: '🏷️' },
    { to: '/adminstackt4s/orders', label: 'Orders', icon: '🛒' },
    { to: '/adminstackt4s/sellers', label: 'Sellers', icon: '👤' },
    { to: '/adminstackt4s/settings', label: 'Settings', icon: '⚙️' },
  ]

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session')
    window.location.href = '/adminstackt4s/login'
  }

  return (
    <aside className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-700/60 h-full flex flex-col relative shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(100px_60px_at_20%_10%,#7c3aed_0,transparent_60%),radial-gradient(120px_80px_at_80%_30%,#06b6d4_0,transparent_60%)]"></div>
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">StackStore Admin</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Marketplace Management</div>
        </div>
        <nav>
          <ul className="space-y-2">
            {links.map(link => {
              const isActive = pathname === link.to || (link.to !== '/adminstackt4s' && pathname?.startsWith(link.to))
              const isDashboard = link.to === '/adminstackt4s'
              return (
                <li key={link.to}>
                  <Link
                    href={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group ${
                      isActive
                        ? isDashboard
                          ? 'bg-gradient-to-r from-purple-500 via-emerald-600 to-cyan-600 text-white shadow-lg shadow-purple-500/40 scale-105 border-2 border-purple-400/50'
                          : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:scale-105 hover:shadow-md'
                    }`}
                  >
                    <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{link.icon}</span>
                    <span className="flex-1">{link.label}</span>
                    {isActive && (
                      <div className={`absolute right-2 w-2 h-2 rounded-full animate-pulse ${isDashboard ? 'bg-purple-300 ring-2 ring-purple-500' : 'bg-white'}`}></div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
      
      {/* Logout Button at Bottom */}
      <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60 relative z-10">
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

export default StackStoreAdminSidebar

