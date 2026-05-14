'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Roles/positions for the public site are configured via Landing admin (team section). */
export default function RolesRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/adminlandingt4s/team_members')
  }, [router])
  return (
    <div className="p-6 text-center text-white/80">
      <p className="text-sm">Team roles are managed from Landing admin. Redirecting…</p>
    </div>
  )
}
