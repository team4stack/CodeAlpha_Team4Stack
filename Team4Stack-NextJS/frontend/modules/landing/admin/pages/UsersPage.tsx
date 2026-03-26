'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { superadminApi } from '@/lib/api'

type Row = { id: string; name: string | null; email: string | null; avatar_url: string | null; is_blocked: boolean | null; created_at: string }

const UsersPage: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isDarkMode } = useTheme()

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const result = await superadminApi.getUsers()
      if (result.error || result.success === false) {
        setError(result.error || 'Failed to load users')
      } else {
        const sortedData = (Array.isArray(result.data) ? result.data : []).sort((a: any, b: any) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        )
        setRows(sortedData)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Note: Real-time subscriptions removed - using backend API
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-5 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-white/90 text-sm mt-1">Manage all registered users and their accounts</p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-lg p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-semibold">{error}</div>
      ) : (
        <div className="rounded-xl overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-2 border-white/30 dark:border-white/20 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b-2 border-white/20">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Avatar</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-red-50/50 dark:hover:from-orange-900/10 dark:hover:to-red-900/10 transition-colors duration-200">
                    <td className="px-4 py-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!r.avatar_url && !isDarkMode ? 'bg-black p-1' : ''} ring-2 ring-orange-200 dark:ring-orange-800 hover:ring-orange-400 dark:hover:ring-orange-600 transition-all duration-300`}>
                        <img 
                          src={r.avatar_url || '/Team4stack_Logo.png?v=8'} 
                          alt="avatar" 
                          className={`w-full h-full ${!r.avatar_url ? 'object-contain' : 'object-cover'} ${!r.avatar_url && !isDarkMode ? 'rounded-lg' : 'rounded-full'} transition-all duration-300`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{r.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.email || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          const newBlockedStatus = !r.is_blocked
                          const action = newBlockedStatus ? 'block' : 'unblock'
                          const ok = window.confirm(`Are you sure you want to ${action} this user?`)
                          if (!ok) return
                          try {
                            const result = newBlockedStatus
                              ? await superadminApi.blockUser(r.id)
                              : await superadminApi.unblockUser(r.id)
                            if (result.error || result.success === false) {
                              setError(result.error || `Failed to ${action} user`)
                            } else {
                              setError(null)
                              load()
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to update user')
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ${
                          r.is_blocked
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                            : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white'
                        }`}
                      >
                        {r.is_blocked ? '✓ Unblock' : '✗ Block'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button 
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300" 
                        onClick={async () => {
                          const ok = window.confirm('Delete this user?')
                          if (!ok) return
                          try {
                            const result = await superadminApi.deleteUser(r.id)
                            if (result.error || result.success === false) {
                              setError(result.error || 'Failed to delete user')
                            } else {
                              load()
                            }
                          } catch (err: any) {
                            setError(err.message || 'Failed to delete user')
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage


