'use client'

import React from 'react'
import Link from 'next/link'

const TeamAdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-6 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="text-4xl">👥</div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Team Admin</h1>
              <p className="text-white/90 text-sm">
                This panel is separate from website content. Team members, mentor profiles, and related
                landing content are managed only in{' '}
                <span className="font-semibold text-white">Landing admin</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/adminlandingt4s/team_members"
          className="block rounded-xl border border-white/10 bg-white/5 p-5 text-white transition hover:bg-white/10 hover:border-cyan-400/30"
        >
          <div className="text-2xl mb-2">👤</div>
          <div className="font-bold text-lg mb-1">Team members</div>
          <p className="text-sm text-white/75">Edit in Landing admin (requires landing admin access).</p>
        </Link>
        <Link
          href="/adminlandingt4s/mentor_profiles"
          className="block rounded-xl border border-white/10 bg-white/5 p-5 text-white transition hover:bg-white/10 hover:border-cyan-400/30"
        >
          <div className="text-2xl mb-2">🎓</div>
          <div className="font-bold text-lg mb-1">Mentor profiles</div>
          <p className="text-sm text-white/75">Edit in Landing admin (requires landing admin access).</p>
        </Link>
      </div>

      <div className="rounded-xl border border-orange-200/40 bg-orange-950/20 p-5 text-sm text-orange-50/95">
        <p className="font-medium text-orange-100 mb-1">Team admin vs landing admin</p>
        <p className="text-orange-100/85">
          <strong>Team admin</strong> stays for its own scope (for example settings on this route). It does not
          grant or replace <strong>landing admin</strong> permissions for site team or mentor content.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/adminteamt4s/settings"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-orange-600 hover:to-red-700"
        >
          Open team admin settings
        </Link>
        <Link
          href="/adminlandingt4s"
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10"
        >
          Go to Landing admin home
        </Link>
      </div>
    </div>
  )
}

export default TeamAdminDashboard
