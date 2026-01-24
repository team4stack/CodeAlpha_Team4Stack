'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { landingApi } from '@/lib/api'

const CoursesAdminSidebar: React.FC = () => {
  const pathname = usePathname()
  const [labels, setLabels] = useState<Record<string,string>>({})

  useEffect(() => {
    const load = async () => {
      try {
        const result = await landingApi.getSiteSettings(['tab_label_courses'])
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
    { to: '/admincourset4s', label: labels.tab_label_courses || 'Dashboard', icon: '🎓' },
    { to: '/admincourset4s/manage', label: 'Manage Courses', icon: '📚' },
    { to: '/admincourset4s/videos', label: 'Videos', icon: '🎥' },
    { to: '/admincourset4s/progress', label: 'Student Progress', icon: '📊' },
    { to: '/admincourset4s/applications', label: 'Applications', icon: '📝' },
    { to: '/admincourset4s/settings', label: 'Settings', icon: '⚙️' },
  ]

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session')
    window.location.href = '/admincourset4s/login'
  }

  return (
    <aside className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-700/60 h-full flex flex-col relative shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(100px_60px_at_20%_10%,#7c3aed_0,transparent_60%),radial-gradient(120px_80px_at_80%_30%,#06b6d4_0,transparent_60%)]"></div>
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">Courses Admin</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Course Management</div>
        </div>
        <nav>
          <ul className="space-y-2">
            {links.map(link => {
              const isActive = pathname === link.to || (link.to !== '/admincourset4s' && pathname?.startsWith(link.to))
              return (
                <li key={link.to}>
                  <Link
                    href={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
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

export default CoursesAdminSidebar

