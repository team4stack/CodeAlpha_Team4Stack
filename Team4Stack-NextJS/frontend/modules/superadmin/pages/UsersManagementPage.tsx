'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTheme } from '@/contexts/ThemeContext'

type User = {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  is_blocked: boolean | null
  created_at: string
  role?: string | null
}

const UsersManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'blocked' | 'active'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const usersPerPage = 10

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`email.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
      }

      // Apply status filter
      if (filterStatus === 'blocked') {
        query = query.eq('is_blocked', true)
      } else if (filterStatus === 'active') {
        query = query.eq('is_blocked', false)
      }

      // Get total count first
      const { count } = await query
      setTotalUsers(count || 0)

      // Apply pagination and ordering
      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * usersPerPage, currentPage * usersPerPage - 1)

      if (fetchError) throw fetchError
      setUsers(data || [])
    } catch (err: any) {
      setError('Failed to load users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterStatus, currentPage])

  useEffect(() => {
    loadUsers()
    // Note: Real-time subscriptions removed - using backend API
  }, [loadUsers])

  const handleBlockToggle = async (userId: string, currentStatus: boolean) => {
    try {
      setError(null)
      setSuccess(null)

      const { error: updateError } = await supabase
        .from('users')
        .update({ is_blocked: !currentStatus })
        .eq('id', userId)

      if (updateError) throw updateError

      setSuccess(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully!`)
      loadUsers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to update user status: ' + err.message)
    }
  }

  const handleDeleteUser = async (userId: string, userEmail: string | null) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail || userId}? This action cannot be undone.`)) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (deleteError) throw deleteError

      setSuccess('User deleted successfully!')
      loadUsers()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to delete user: ' + err.message)
    }
  }

  const totalPages = Math.ceil(totalUsers / usersPerPage)

  if (loading && users.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">👥 Users Management</h1>
        <p className="text-white/90">Manage all users, block/unblock accounts, and view user activity</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl p-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl p-4">
          {success}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilterStatus('all')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All ({totalUsers})
            </button>
            <button
              onClick={() => {
                setFilterStatus('active')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setFilterStatus('blocked')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filterStatus === 'blocked'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Blocked
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {loading ? 'Loading...' : 'No users found'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={user.avatar_url}
                              alt={user.name || 'User'}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                              {(user.name || user.email || 'U')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{user.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_blocked
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {user.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleBlockToggle(user.id, user.is_blocked || false)}
                          className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                            user.is_blocked
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          {user.is_blocked ? 'Unblock' : 'Block'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="px-3 py-1 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersManagementPage

