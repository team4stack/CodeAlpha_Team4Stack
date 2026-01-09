'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const CoursesAdminSidebar: React.FC = () => {
  const pathname = usePathname()
  const [labels, setLabels] = useState<Record<string,string>>({})

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key,value')
        .in('key', ['tab_label_courses'])
      const map: Record<string,string> = {}
      data?.forEach(r => { map[r.key] = r.value })
      setLabels(map)
    }
    load()
  }, [])

  const links = [
    { to: '/admincourset4s', label: labels.tab_label_courses || 'Dashboard', icon: '🎓' },
    { to: '/admincourset4s/manage', label: 'Manage Courses', icon: '📚' },
    { to: '/admincourset4s/videos', label: 'Videos', icon: '🎥' },
    { to: '/admincourset4s/progress', label: 'Student Progress', icon: '📊' },
    { to: '/admincourset4s/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <aside className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-700/60 min-h-screen p-4 relative shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(100px_60px_at_20%_10%,#7c3aed_0,transparent_60%),radial-gradient(120px_80px_at_80%_30%,#06b6d4_0,transparent_60%)]"></div>
      <div className="mb-6 relative z-10">
        <div className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">Courses Admin</div>
        <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Course Management</div>
      </div>
      <nav className="relative z-10">
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
    </aside>
  )
}

export default CoursesAdminSidebar

