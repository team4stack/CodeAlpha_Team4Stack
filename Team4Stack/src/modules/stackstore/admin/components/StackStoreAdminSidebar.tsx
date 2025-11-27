import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { supabase } from '../../../../utils/supabaseClient'

const StackStoreAdminSidebar: React.FC = () => {
  const [labels, setLabels] = useState<Record<string,string>>({})

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key,value')
        .in('key', ['tab_label_stackstore'])
      const map: Record<string,string> = {}
      data?.forEach(r => { map[r.key] = r.value })
      setLabels(map)
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

  return (
    <aside className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/60 dark:border-gray-700/60 min-h-screen p-4 relative shadow-lg">
      <div className="pointer-events-none absolute inset-0 opacity-10 [background:radial-gradient(100px_60px_at_20%_10%,#7c3aed_0,transparent_60%),radial-gradient(120px_80px_at_80%_30%,#06b6d4_0,transparent_60%)]"></div>
      <div className="mb-6 relative z-10">
        <div className="text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-2">StackStore Admin</div>
        <div className="text-sm text-gray-600 dark:text-gray-300 font-semibold">Marketplace Management</div>
      </div>
      <nav className="relative z-10">
        <ul className="space-y-2">
          {links.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => {
                  const isDashboard = link.to === '/adminstackt4s'
                  return `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative group ${
                    isActive
                      ? isDashboard
                        ? 'bg-gradient-to-r from-purple-500 via-emerald-600 to-cyan-600 text-white shadow-lg shadow-purple-500/40 scale-105 border-2 border-purple-400/50'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:scale-105 hover:shadow-md'
                  }`
                }}
              >
                {({ isActive }) => {
                  const isDashboard = link.to === '/adminstackt4s'
                  return (
                    <>
                      <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{link.icon}</span>
                      <span className="flex-1">{link.label}</span>
                      {isActive && (
                        <div className={`absolute right-2 w-2 h-2 rounded-full animate-pulse ${isDashboard ? 'bg-purple-300 ring-2 ring-purple-500' : 'bg-white'}`}></div>
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

export default StackStoreAdminSidebar

