'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useTheme } from '@/contexts/ThemeContext'

type AuditLog = {
  id: string
  admin_email: string
  action: string
  resource_type: string
  resource_id?: string
  details?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

const AuditLogsPage: React.FC = () => {
  const { isDarkMode } = useTheme()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterResource, setFilterResource] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const logsPerPage = 20

  // Get unique actions and resource types for filters
  const [availableActions, setAvailableActions] = useState<string[]>([])
  const [availableResources, setAvailableResources] = useState<string[]>([])

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`admin_email.ilike.%${searchQuery}%,action.ilike.%${searchQuery}%,resource_type.ilike.%${searchQuery}%,details.ilike.%${searchQuery}%`)
      }

      // Apply action filter
      if (filterAction !== 'all') {
        query = query.eq('action', filterAction)
      }

      // Apply resource type filter
      if (filterResource !== 'all') {
        query = query.eq('resource_type', filterResource)
      }

      // Get total count
      const { count } = await query
      setTotalLogs(count || 0)

      // Apply pagination and ordering
      const { data, error: fetchError } = await query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * logsPerPage, currentPage * logsPerPage - 1)

      if (fetchError) {
        // If table doesn't exist, show empty state
        if (fetchError.code === 'PGRST116' || fetchError.message.includes('does not exist')) {
          setLogs([])
          setTotalLogs(0)
          return
        }
        throw fetchError
      }

      setLogs(data || [])

      // Extract unique actions and resource types
      if (data && data.length > 0) {
        const actions = [...new Set(data.map((log: AuditLog) => log.action))]
        const resources = [...new Set(data.map((log: AuditLog) => log.resource_type))]
        setAvailableActions(actions)
        setAvailableResources(resources)
      }
    } catch (err: any) {
      setError('Failed to load audit logs: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterAction, filterResource, currentPage])

  useEffect(() => {
    loadLogs()
    // Note: Real-time subscriptions removed - using backend API
  }, [loadLogs])

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase()
    if (actionLower.includes('create') || actionLower.includes('add')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    } else if (actionLower.includes('update') || actionLower.includes('edit')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    } else if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    } else if (actionLower.includes('login') || actionLower.includes('logout')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    } else if (actionLower.includes('block') || actionLower.includes('unblock')) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const totalPages = Math.ceil(totalLogs / logsPerPage)

  if (loading && logs.length === 0) {
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
        <h1 className="text-3xl font-bold mb-2">📋 Audit Logs</h1>
        <p className="text-white/90">Track all admin actions and system changes</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl p-4">
          <p className="font-semibold">Unable to load audit logs.</p>
          <p className="text-sm mt-1 text-red-300">
            {error.includes('does not exist') 
              ? 'Audit logging is not configured. Please contact the administrator.'
              : 'Please try again later or contact support if the problem persists.'}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by admin email, action, resource type, or details..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Actions</option>
            {availableActions.map((action) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          {/* Resource Type Filter */}
          <select
            value={filterResource}
            onChange={(e) => {
              setFilterResource(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Resources</option>
            {availableResources.map((resource) => (
              <option key={resource} value={resource}>{resource}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Admin
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Resource
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {loading ? 'Loading...' : 'No audit logs found. Create the audit_logs table in Supabase to start tracking actions.'}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{log.admin_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{log.resource_type}</div>
                      {log.resource_id && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">ID: {log.resource_id.slice(0, 8)}...</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.ip_address || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
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
              Showing {(currentPage - 1) * logsPerPage + 1} to {Math.min(currentPage * logsPerPage, totalLogs)} of {totalLogs} logs
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

export default AuditLogsPage

