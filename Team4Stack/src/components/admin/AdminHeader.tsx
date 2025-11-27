import React, { useEffect, useState } from 'react'
import ProfileAvatar from '../ProfileAvatar'
import { supabase } from '../../utils/supabaseClient'
import { useLocation, useNavigate } from 'react-router-dom'

const AdminHeader: React.FC = () => {
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [now, setNow] = useState<string>('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const sanitize = (u?: string): string => {
      if (!u) return ''
      let url = String(u).trim()
      if (url.includes('github.com') && url.includes('/blob/') && !url.includes('?raw=')) {
        url += (url.includes('?') ? '&' : '?') + 'raw=1'
      }
      return url
    }
    const load = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key,value')
        .eq('key', 'admin_avatar_url')
        .maybeSingle()
      if (data?.value) setAvatarUrl(sanitize(data.value))
    }
    load()
    const t = setInterval(() => setNow(new Date().toLocaleString()), 1000)
    // Realtime update on settings change
    const ch = supabase
      .channel('admin_header_avatar')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings', filter: 'key=eq.admin_avatar_url' }, (payload) => {
        const v = (payload.new as any)?.value as string | undefined
        if (v) setAvatarUrl(sanitize(v))
      })
      .subscribe()
    return () => { try { supabase.removeChannel(ch) } catch {} ; clearInterval(t) }
  }, [])

  const prettyTitle = () => {
    const p = location.pathname.replace('/adminsami', '') || '/'
    if (p === '/' || p === '') return 'Dashboard'
    const seg = p.split('/')[1]
    const map: Record<string,string> = { hero: 'Hero Section', projects: 'Projects', services: 'Services', reviews: 'Reviews', courses: 'Courses', team_members: 'Team', mentor_profile: 'Mentor', contact: 'Contact', footer: 'Footer', forms: 'Admission Form', support: 'Support', settings: 'Settings' }
    return map[seg] || seg
  }

  const handleLogout = async () => {
    // Remove custom admin session (NOT Supabase Auth session)
    // Admin login is completely separate from normal website login
    sessionStorage.removeItem('admin_session')
    window.location.href = '/adminsami/login'
  }

  return (
    <header className="sticky top-0 z-20">
      {/* Animated gradient background with multiple layers */}
      <div className="h-[74px] relative overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 via-fuchsia-600 to-pink-600"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 via-indigo-500 to-purple-500 opacity-60 animate-[gradient_8s_ease_infinite] bg-[length:200%_200%]"></div>
        
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(90deg,transparent,transparent_8px,rgba(255,255,255,.2)_8px,rgba(255,255,255,.2)_9px)]" style={{animation: 'shimmer 3s linear infinite'}}></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-cyan-400 rounded-full blur-3xl opacity-40 animate-[float_6s_ease_infinite]" style={{animation: 'float 6s ease-in-out infinite'}}></div>
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-pink-400 rounded-full blur-3xl opacity-40 animate-[float_8s_ease_infinite]" style={{animation: 'floatReverse 8s ease-in-out infinite'}}></div>
        <div className="absolute bottom-0 left-1/2 w-36 h-36 bg-purple-400 rounded-full blur-3xl opacity-30 animate-[float_7s_ease_infinite]" style={{animation: 'float 7s ease-in-out infinite'}}></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)] [background-size:20px_20px] animate-[gridMove_20s_linear_infinite]"></div>
      </div>
      
      {/* Main header content */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/80 border-b border-white/30 dark:border-white/20 -mt-[50px] h-[78px] flex items-center justify-between px-6 rounded-b-2xl shadow-2xl relative overflow-hidden">
        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-b-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 opacity-50 animate-[pulse_3s_ease_infinite]"></div>
        
        <div className="flex items-center gap-2 md:gap-4 relative z-10 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            {/* Glowing background for title */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg blur opacity-30 animate-[pulse_2s_ease_infinite]"></div>
            <div className="relative">
              <div className="text-xs uppercase tracking-widest font-bold text-white/90 drop-shadow-lg animate-[glow_2s_ease_infinite]">
                TEAM4STACK ADMIN
              </div>
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 via-pink-400 to-rose-400 animate-[gradient_3s_ease_infinite] bg-[length:200%_200%] drop-shadow-lg">
                {prettyTitle()}
              </h1>
            </div>
          </div>
          
          {/* Quick Stats Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border-2 border-cyan-400/30 dark:border-purple-400/30 shadow-lg backdrop-blur-sm">
            <svg className="w-5 h-5 text-cyan-500 dark:text-purple-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Admin Panel</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          {/* Animated time display */}
          <div className="hidden md:block text-xs font-semibold text-white/90 drop-shadow-lg bg-black/20 dark:bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
            {now}
          </div>
          
          {/* Enhanced logout button */}
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shadow-lg hover:shadow-red-500/50 hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Logout</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          {/* Avatar with glow */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full blur opacity-50 animate-[pulse_2s_ease_infinite]"></div>
            <ProfileAvatar src={avatarUrl || '/Team4stack_Logo.png?v=8'} alt="Admin Avatar" size="sm" />
          </div>
        </div>
      </div>
      
      {/* Enhanced action bar */}
      <div className="px-6 py-3 flex items-center gap-3 bg-gradient-to-r from-white/60 via-purple-50/50 to-transparent dark:from-gray-900/60 dark:via-purple-900/20 dark:to-transparent border-b border-white/20 dark:border-white/10 relative overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10 [background:repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(147,51,234,.3)_10px,rgba(147,51,234,.3)_20px)]"></div>
        
        <button 
          onClick={() => window.open('/', '_blank')} 
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/80 to-blue-500/80 dark:from-cyan-600/80 dark:to-blue-600/80 text-white border border-cyan-400/30 shadow-md hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all duration-300 relative z-10"
        >
          View Site
        </button>
        <button 
          onClick={() => window.location.reload()} 
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 dark:from-purple-600/80 dark:to-pink-600/80 text-white border border-purple-400/30 shadow-md hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-300 relative z-10"
        >
          Refresh
        </button>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 ml-auto bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg border border-white/20 dark:border-white/10 relative z-10">
          ✨ Signed in
        </span>
      </div>
      
      {/* Add CSS animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-10px); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(20px) translateX(-10px); }
          66% { transform: translateY(-10px) translateX(10px); }
        }
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(20px, 20px); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 5px rgba(255,255,255,0.5), 0 0 10px rgba(255,255,255,0.3); }
          50% { text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5), 0 0 30px rgba(255,255,255,0.3); }
        }
      `}</style>
    </header>
  )
}

export default AdminHeader


