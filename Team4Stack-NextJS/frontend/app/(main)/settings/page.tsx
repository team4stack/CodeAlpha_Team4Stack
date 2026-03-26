'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import UserSettingsModal from '@/modals/UserSettingsModal'

const SettingsPage: React.FC = () => {
  const router = useRouter()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-950">
        <div className="max-w-md w-full rounded-xl border border-gray-700 bg-gray-900 p-6 text-center">
          <h1 className="text-xl font-semibold text-white">Login Required</h1>
          <p className="mt-2 text-sm text-gray-300">Please sign in to access account settings.</p>
          <button
            type="button"
            onClick={() => router.push('/courses')}
            className="mt-4 w-full rounded-lg bg-linear-to-r from-cyan-500 to-purple-600 px-4 py-2.5 text-white font-semibold hover:from-cyan-600 hover:to-purple-700 transition-colors"
          >
            Go to Courses
          </button>
        </div>
      </div>
    )
  }

  return <UserSettingsModal isOpen onClose={() => router.back()} asPage />
}

export default SettingsPage
