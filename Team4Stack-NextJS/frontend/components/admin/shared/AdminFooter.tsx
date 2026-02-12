'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'

const AdminFooter: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (footerRef.current) {
      footerRef.current.style.opacity = '0'
      footerRef.current.style.transform = 'translateY(8px)'
      const t = setTimeout(() => {
        if (footerRef.current) {
          footerRef.current.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out'
          footerRef.current.style.opacity = '1'
          footerRef.current.style.transform = 'translateY(0)'
        }
      }, 50)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <footer
      ref={footerRef}
      className="flex-shrink-0 shrink-0 border-t border-white/5 bg-slate-900/60 backdrop-blur-sm"
      data-admin-footer
    >
      <div className="px-4 py-3 sm:px-6 sm:py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <p className="text-white/50 text-xs sm:text-sm order-2 sm:order-1">
            © {currentYear} Team4Stack. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-xs order-1 sm:order-2">
            <Link
              href="https://team4stack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-cyan-400 transition-colors whitespace-nowrap"
            >
              Team4Stack
            </Link>
            <span className="text-white/20 hidden sm:inline" aria-hidden>|</span>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-cyan-400 transition-colors whitespace-nowrap"
            >
              View Site
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default AdminFooter
