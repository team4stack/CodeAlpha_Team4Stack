'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { stackstoreApi } from '@/lib/api'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'
import StackStoreAdminLayout from '../components/StackStoreAdminLayout'

type Application = {
  id: number
  name: string
  email: string
  store_name: string
  primary_platform: string
  github_url?: string
  bio: string
  status: string
  created_at?: string
}

const SellerApplicationsAdminPage: React.FC = () => {
  const [rows, setRows] = useState<Application[]>([])
  const [filter, setFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await stackstoreApi.listSellerApplications(filter === 'all' ? undefined : filter)
      if (!res.success) throw new Error(res.error || 'Failed to load applications')
      setRows(Array.isArray(res.data) ? res.data : [])
    } catch (err: unknown) {
      setError(getUserFriendlyMessage(err, 'Failed to load applications.'))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    void load()
  }, [load])

  const review = async (id: number, decision: 'approved' | 'rejected') => {
    setBusyId(id)
    try {
      const res = await stackstoreApi.reviewSellerApplication(id, decision)
      if (!res.success) throw new Error(res.error || 'Review failed')
      await load()
    } catch (err: unknown) {
      setError(getUserFriendlyMessage(err, 'Review failed.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <StackStoreAdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Seller applications</h1>
        <p className="text-slate-400 text-sm mb-6">Approve sellers before they can list verified projects.</p>

        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected', 'all'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                filter === s ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {error ? <p className="text-red-400 mb-4">{error}</p> : null}
        {loading ? <p className="text-slate-400">Loading…</p> : null}

        <div className="space-y-4">
          {rows.map((app) => (
            <article key={app.id} className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">{app.store_name}</h2>
                  <p className="text-sm text-slate-400">
                    {app.name} · {app.email} · {app.primary_platform}
                  </p>
                </div>
                <span className="text-xs uppercase tracking-wide text-amber-300">{app.status}</span>
              </div>
              <p className="text-sm text-slate-300 mt-3 line-clamp-3">{app.bio}</p>
              {app.github_url ? (
                <a href={app.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-300 mt-2 inline-block">
                  GitHub
                </a>
              ) : null}
              {app.status === 'pending' ? (
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    disabled={busyId === app.id}
                    onClick={() => review(app.id, 'approved')}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === app.id}
                    onClick={() => review(app.id, 'rejected')}
                    className="px-4 py-2 rounded-lg bg-red-600/80 text-white text-sm font-medium"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </StackStoreAdminLayout>
  )
}

export default SellerApplicationsAdminPage
