'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Team member CMS lives under Landing admin only (`/adminlandingt4s/team_members`). */
export default function TeamMembersRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/adminlandingt4s/team_members')
  }, [router])
  return (
    <div className="p-6 text-center text-white/80">
      <p className="text-sm">Team members are edited in Landing admin. Redirecting…</p>
    </div>
  )
}
