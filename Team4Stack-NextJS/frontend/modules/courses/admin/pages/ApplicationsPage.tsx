'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { loadApplicationsData } from './applications-page/loadApplicationsData'
import { getApplicationRowBackgroundClass, getApplicationStatusBadge } from './applications-page/applicationRowViewState'
import type { ApplicationFilter, ApplicationRow } from './applications-page/types'

const ApplicationsPage: React.FC = () => {
  const [rows, setRows] = useState<ApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<ApplicationFilter>('all')
  const router = useRouter()

  const load = async () => {
    try {
      setError(null)

      const result = await loadApplicationsData(filter)
      if (result.error) {
        setError(result.error)
        setRows([])
        setLoading(false)
        return
      }
      setRows(result.data)
    } catch (err: unknown) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading applications:', err)
      }
      const errorMsg = err instanceof Error ? err.message : 'Failed to load applications'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const pendingCount = rows.filter((r) => r.approved === null || r.approved === false).length
  const approvedCount = rows.filter((r) => r.approved === true).length

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-4 sm:p-5 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Course Applications</h1>
            <p className="text-white/90 text-xs sm:text-sm">Review and manage student admission applications</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-white/30 text-white backdrop-blur-sm border border-white/30 shadow-md'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/20'
              }`}
            >
              All ({rows.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'pending'
                  ? 'bg-yellow-500/80 text-white backdrop-blur-sm border border-yellow-400/50 shadow-md'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/20'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                filter === 'approved'
                  ? 'bg-green-500/80 text-white backdrop-blur-sm border border-green-400/50 shadow-md'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/20'
              }`}
            >
              Approved ({approvedCount})
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No applications found.</p>
          <p className="text-sm">Applications will appear here when users submit them.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Course</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((application) => {
              const statusBadge = getApplicationStatusBadge(application)
              return (
                <div key={application.id}>
                  <div
                    className={`grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${getApplicationRowBackgroundClass(application)}`}
                  >
                    <div className="col-span-2">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {application.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {application.father_name}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <div className="truncate">{application.course_name}</div>
                        {application.course_name_2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            + {application.course_name_2}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {application.phone}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {application.email}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                        {application.image_attached && (
                          <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500 text-white">
                            Payment
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(application.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(application.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/admincourset4s/applications/view?id=${application.id}`)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationsPage
