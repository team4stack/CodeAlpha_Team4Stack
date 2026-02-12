'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import NotificationBell from './NotificationBell'

const AdminHeader: React.FC = () => {
  const pathname = usePathname()
  const router = useRouter()

  const getAdminName = () => {
    if (pathname?.startsWith('/supadmin')) {
      return 'Super Admin'
    } else if (pathname?.startsWith('/adminlandingt4s')) {
      return 'Landing Admin'
    } else if (pathname?.startsWith('/admincourset4s')) {
      return 'Courses Admin'
    } else if (pathname?.startsWith('/adminteamt4s')) {
      return 'Team Admin'
    } else if (pathname?.startsWith('/adminstackt4s')) {
      return 'StackStore Admin'
    }
    return 'Admin'
  }

  const getDashboardPath = () => {
    if (pathname?.startsWith('/supadmin')) {
      return '/supadmin'
    } else if (pathname?.startsWith('/adminlandingt4s')) {
      return '/adminlandingt4s'
    } else if (pathname?.startsWith('/admincourset4s')) {
      return '/admincourset4s'
    } else if (pathname?.startsWith('/adminteamt4s')) {
      return '/adminteamt4s'
    } else if (pathname?.startsWith('/adminstackt4s')) {
      return '/adminstackt4s'
    }
    return '/adminlandingt4s' // Default fallback
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push(getDashboardPath())
  }

  return (
    <header className="sticky top-0 z-20 flex-shrink-0 overflow-visible relative">
      {/* Static Gradient Background - No Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
      
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 backdrop-blur-xl bg-black/30"></div>
      
      {/* Subtle Accent Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-orange-500/5"></div>
      
      {/* Animated Grid Pattern - Same as Main Site */}
      <div className="pointer-events-none absolute inset-0 opacity-20 overflow-hidden">
        <div 
          className="navbar-grid-animate absolute left-1/2 top-1/2 w-[140%] h-[140%]" 
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, rgba(148,163,184,0.25) 0, rgba(148,163,184,0.25) 1px, transparent 1px, transparent 30px),
                              repeating-linear-gradient(90deg, rgba(148,163,184,0.22) 0, rgba(148,163,184,0.22) 1px, transparent 1px, transparent 30px)`,
            maskImage: 'radial-gradient(ellipse 80% 50% at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
            transition: 'none',
            willChange: 'transform',
            animation: 'gridSlide 3s ease-in-out infinite'
          }} 
        />
      </div>
      
      <div className="h-20 flex items-center justify-between px-6 relative z-10">
        {/* Left Side - Logo and Text (Clickable) */}
        <Link 
          href={getDashboardPath()}
          onClick={handleLogoClick}
          className="flex items-center gap-4 group cursor-pointer"
        >
          {/* Logo with Subtle Glow */}
          <div className="relative flex-shrink-0">
            {/* Subtle Glowing Background */}
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-2xl group-hover:bg-cyan-400/30 transition-all duration-300"></div>
            
            <div className="relative w-20 h-20 flex items-center justify-center overflow-hidden">
              <img
                src="/Team4Stack_Transparant.svg"
                alt="Team4Stack Logo"
                className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                style={{
                  filter: 'drop-shadow(0 0 15px rgba(6, 182, 212, 0.4))'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (!target.src.includes('fallback')) {
                    target.src = '/Team4Stack_Transparant.svg?fallback=1'
                  }
                }}
              />
            </div>
          </div>
          
          {/* Text Section */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white drop-shadow-md tracking-tight group-hover:text-cyan-300 transition-colors duration-300 cursor-pointer">
              Team4Stack
            </h1>
            <p className="text-sm text-white/80 font-medium tracking-wide">
              {getAdminName()}
            </p>
          </div>
        </Link>

        {/* Right Side - Notification Bell and Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <NotificationBell />
          
          <button 
            onClick={() => window.open('/', '_blank')} 
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
          >
            <span className="relative z-10">View Site</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:border-orange-400/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
          >
            <span className="relative z-10">Refresh</span>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>

      {/* Bottom Edge - Covered by Navbar Design */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
    </header>
  )
}

export default AdminHeader


