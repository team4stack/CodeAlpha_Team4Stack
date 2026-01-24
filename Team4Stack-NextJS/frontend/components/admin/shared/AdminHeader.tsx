'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

const AdminHeader: React.FC = () => {
  const pathname = usePathname()

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

  return (
    <header className="sticky top-0 z-20 flex-shrink-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-lg overflow-x-hidden">
      <div className="h-32 flex items-center justify-between px-8 relative">
        {/* Left Side - Logo and Text */}
        <div className="flex items-center gap-6">
          {/* Logo - Big with Black Shadow */}
          <div className="relative flex-shrink-0">
            {/* Black shadow layers for depth - can extend up/down but not left/right */}
            <div className="absolute inset-0 bg-black/40 rounded-full blur-3xl"></div>
            <div className="absolute inset-0 bg-black/30 rounded-full blur-2xl"></div>
            <div className="absolute inset-0 bg-black/20 rounded-full blur-xl"></div>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <img
                src="/Team4Stack_Transparant.svg"
                alt="Team4Stack Logo"
                className="w-full h-full object-contain drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6)) drop-shadow(0 8px 16px rgba(0,0,0,0.5)) drop-shadow(0 12px 24px rgba(0,0,0,0.4)) drop-shadow(0 16px 32px rgba(0,0,0,0.3))'
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
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              Team4Stack
            </h1>
            <p className="text-base text-white/90 font-semibold mt-1">
              {getAdminName()}
            </p>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.open('/', '_blank')} 
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          >
            View Site
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          >
            Refresh
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader


