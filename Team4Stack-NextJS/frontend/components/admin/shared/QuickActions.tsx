'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

const QuickActions: React.FC = () => {
  const router = useRouter()

  return (
    <div className="rounded-xl p-5 bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-lg">
      <div className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <span>Quick Actions</span>
      </div>
      <div className="space-y-3">
        <button 
          onClick={() => router.push('/adminlandingt4s/projects')} 
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group border border-white/20"
        >
          <span className="relative z-10">Add Project</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        <button 
          onClick={() => router.push('/adminlandingt4s/services')} 
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group border border-white/20"
        >
          <span className="relative z-10">Add Service</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
        <button 
          onClick={() => router.push('/admincourset4s/manage')} 
          className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group border border-white/20"
        >
          <span className="relative z-10">Add Course</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>
    </div>
  )
}

export default QuickActions








