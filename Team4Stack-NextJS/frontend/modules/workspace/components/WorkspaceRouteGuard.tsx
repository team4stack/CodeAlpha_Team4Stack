'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '@/lib/auth/components/AuthModal'

type Props = { children: React.ReactNode }

const WorkspaceRouteGuard: React.FC<Props> = ({ children }) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    if (!loading && !user) setShowAuth(true)
  }, [loading, user])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-400">
        Loading workspace…
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-gray-300">Sign in to access your Team4Stack project workspace.</p>
          <button
            type="button"
            className="ws-btn ws-btn--primary"
            onClick={() => setShowAuth(true)}
          >
            Sign in
          </button>
        </div>
        <AuthModal
          isOpen={showAuth}
          onClose={() => {
            setShowAuth(false)
            router.push('/')
          }}
        />
      </>
    )
  }

  return <>{children}</>
}

export default WorkspaceRouteGuard
