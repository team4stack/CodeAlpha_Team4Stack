'use client'

import React, { useState, useEffect } from 'react'

const AdminFooter: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <footer className="bg-black/60 backdrop-blur-xl text-white border-t border-cyan-500/20 shadow-2xl shadow-cyan-500/10 flex-shrink-0 relative overflow-hidden">
      {/* Dark Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-black/80 to-slate-900/90"></div>
      
      {/* Subtle Neon Accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      
      <div className="px-6 py-6 relative z-10">
        {/* Main Footer Content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          {/* Left Side */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-white/90 font-semibold text-base">© {currentYear} Team4Stack</span>
              <span className="text-white/30">|</span>
              <span className="text-white/60 text-sm">Admin Panel</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <span className="text-cyan-400">🕐</span>
                <span>{currentTime}</span>
              </span>
              <span className="text-white/30">•</span>
              <span>Version 1.0.0</span>
              <span className="text-white/30">•</span>
              <span>All Rights Reserved</span>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300">
              <span className="text-cyan-400 text-sm drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]">⚡</span>
              <span className="text-white/80 text-sm font-medium">Powered by Team4Stack</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm rounded-lg border border-green-500/20 hover:border-green-400/40 transition-all duration-300">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              <span className="text-white/80 text-sm font-medium">System Active</span>
            </div>
          </div>
        </div>

        {/* Bottom Row - Additional Admin Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/50 border-t border-cyan-500/10 pt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="text-cyan-400">🔒</span>
              <span>Secure Admin Access</span>
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span>
              <span>Audit Logged</span>
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-white/40">Last Updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default AdminFooter
