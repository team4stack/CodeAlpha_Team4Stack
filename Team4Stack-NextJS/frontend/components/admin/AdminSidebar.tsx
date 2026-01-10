import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../../utils/supabaseClient'

const AdminSidebar: React.FC = () => {
  const [labels, setLabels] = useState<Record<string,string>>({})

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key,value')
        .in('key', [
          'tab_label_hero','tab_label_dashboard','tab_label_projects','tab_label_services','tab_label_reviews','tab_label_courses','tab_label_team','tab_label_mentor','tab_label_contact','tab_label_footer','tab_label_support','tab_label_stackstore','tab_label_settings'
        ])
      const map: Record<string,string> = {}
      data?.forEach(r => { map[r.key] = r.value })
      setLabels(map)
    }
    load()
  }, [])

  const links = [
    { to: '/adminsami', label: labels.tab_label_dashboard || 'Dashboard', icon: '📊' },
    { to: '/adminsami/users', label: 'Users', icon: '👤' },
    { to: '/adminsami/hero', label: labels.tab_label_hero || 'Hero Section', icon: '🚀' },
    { to: '/adminsami/projects', label: labels.tab_label_projects || 'Projects', icon: '🛠️' },
    { to: '/adminsami/services', label: labels.tab_label_services || 'Services', icon: '💼' },
    { to: '/adminsami/reviews', label: labels.tab_label_reviews || 'Reviews', icon: '⭐' },
    { to: '/adminsami/courses', label: labels.tab_label_courses || 'Courses', icon: '🎓' },
    { to: '/adminsami/team_members', label: labels.tab_label_team || 'Team', icon: '👥' },
    { to: '/adminsami/mentor_profile', label: labels.tab_label_mentor || 'Mentor', icon: '🎓' },
    { to: '/adminsami/contact', label: labels.tab_label_contact || 'Contact', icon: '☎️' },
    { to: '/adminsami/footer', label: labels.tab_label_footer || 'Footer', icon: '🦶' },
    { to: '/adminsami/support', label: labels.tab_label_support || 'Support', icon: '💬' },
    { to: '/adminsami/stackstore', label: labels.tab_label_stackstore || 'StackStore', icon: '🧩' },
    { to: '/adminsami/settings', label: labels.tab_label_settings || 'Settings', icon: '⚙️' }
  ]

  return (
    <aside className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-700/60 min-h-screen p-4 relative shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(100px_60px_at_20%_10%,#7c3aed_0,transparent_60%),radial-gradient(120px_80px_at_80%_30%,#06b6d4_0,transparent_60%)]"></div>
      <div className="mb-6 relative z-10">
        <div className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Navigation</div>
      </div>
      <nav className="relative z-10">
        <ul className="space-y-2">
          {links.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => {
                  const isDashboard = link.to === '/adminsami'
                  return `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group ${
                    isActive
                      ? isDashboard
                        ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/40 scale-105 border-2 border-cyan-400/50'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:scale-105 hover:shadow-md'
                  }`
                }}
              >
                {({ isActive }) => {
                  const isDashboard = link.to === '/adminsami'
                  return (
                    <>
                      <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{link.icon}</span>
                      <span className="flex-1">{link.label}</span>
                      {isActive && (
                        <div className={`absolute right-2 w-2 h-2 rounded-full animate-pulse ${isDashboard ? 'bg-cyan-300 ring-2 ring-cyan-500' : 'bg-white'}`}></div>
                      )}
                    </>
                  )
                }}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default AdminSidebar


