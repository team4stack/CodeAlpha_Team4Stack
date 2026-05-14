'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Mentor profiles are managed in Landing admin only (`/adminlandingt4s/mentor_profiles`). */
export default function MentorRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/adminlandingt4s/mentor_profiles')
  }, [router])
  return (
    <div className="p-6 text-center text-white/80">
      <p className="text-sm">Mentor content is edited in Landing admin. Redirecting…</p>
    </div>
  )
}
