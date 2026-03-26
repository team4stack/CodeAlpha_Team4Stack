'use client'

import React, { useEffect, useState } from 'react'
import { landingApi } from '@/lib/api'
import toast from 'react-hot-toast'

type CourseSupportRequest = {
  id: number
  email: string
  reason: string
  subject: string
  message: string
  viewed?: boolean
  status?: string
  screenshot_url?: string | null
  created_at?: string
}

const CourseSupportPage: React.FC = () => {
  const [rows, setRows] = useState<CourseSupportRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      const result = await landingApi.getSupportRequests({ target_area: 'course' })
      if (result.success !== true) {
        throw new Error(result.error || 'Failed to load course support requests')
      }
      const data = Array.isArray(result.data) ? (result.data as CourseSupportRequest[]) : []
      setRows(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load course support requests'
      setError(msg)
      toast.error(msg)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const markViewed = async (id: number) => {
    try {
      const result = await landingApi.updateSupportRequest(id, { viewed: true })
      if (!result.success) {
        throw new Error(result.error || 'Could not mark request as viewed')
      }
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, viewed: true } : row)))
      toast.success('Marked as viewed')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not update support request'
      toast.error(msg)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-cyan-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/20 bg-linear-to-r from-cyan-500/90 to-blue-600/90 p-5 text-white shadow-xl">
        <h1 className="text-2xl font-bold">Course Support</h1>
        <p className="mt-1 text-sm text-white/90">
          Requests submitted with <strong>Related To = Course</strong> appear here.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          No course-related support requests yet.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <article
              key={row.id}
              className={`rounded-xl border p-5 shadow-sm ${
                row.viewed
                  ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  : 'border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-900/20'
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{row.email}</h2>
                  {row.viewed === true ? (
                    <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                      Viewed
                    </span>
                  ) : (
                    <span className="rounded-full bg-cyan-500 px-2.5 py-0.5 text-[11px] font-bold text-white">New</span>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {row.created_at ? new Date(row.created_at).toLocaleString() : ''}
                </span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Issue Type:</span> {row.reason || 'N/A'}
              </p>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Subject:</span> {row.subject || 'N/A'}
              </p>
              <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-800 dark:bg-gray-900/50 dark:text-gray-200">
                {row.message || 'No message provided'}
              </div>

              {row.screenshot_url ? (
                <div className="mt-3">
                  <a
                    href={row.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-300"
                  >
                    Open screenshot
                  </a>
                  <img
                    src={row.screenshot_url}
                    alt="Course support screenshot"
                    className="mt-2 max-h-56 w-full rounded-lg border border-gray-200 bg-black/5 object-contain dark:border-gray-700 dark:bg-white/5"
                    loading="lazy"
                  />
                </div>
              ) : null}

              {row.viewed === true ? null : (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => void markViewed(row.id)}
                    className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-700"
                  >
                    Mark Viewed
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseSupportPage
