'use client'

import React, { useEffect, useState } from 'react'
import { developerProfilesApi } from '@/lib/api'

type ProfileRow = {
  id: number
  slug: string
  name: string
  user_email?: string
  role?: string
}

type ApplicationRow = {
  id: number
  name: string
  email: string
  role?: string
  skills?: string[]
  bio: string
  status: string
  created_at?: string
}

const AdminDevelopersPage: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [applications, setApplications] = useState<ApplicationRow[]>([])
  const [form, setForm] = useState({ slug: '', user_email: '', name: '', role: 'Developer' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [reviewingId, setReviewingId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [profRes, appRes] = await Promise.all([
        developerProfilesApi.adminList(),
        developerProfilesApi.adminListApplications(),
      ])
      if (profRes.success && Array.isArray(profRes.data)) setProfiles(profRes.data)
      if (appRes.success && Array.isArray(appRes.data)) setApplications(appRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await developerProfilesApi.adminAssign(form)
      if (!res.success) throw new Error(res.error || 'Assign failed')
      setMessage('Developer assigned successfully.')
      setForm({ slug: '', user_email: '', name: '', role: 'Developer' })
      await load()
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Assign failed')
    } finally {
      setSaving(false)
    }
  }

  const reviewApp = async (id: number, approved: boolean, slug?: string) => {
    setReviewingId(id)
    setMessage('')
    try {
      const res = await developerProfilesApi.adminReviewApplication(id, approved, slug)
      if (!res.success) throw new Error(res.error || 'Review failed')
      setMessage(approved ? 'Application approved — profile created.' : 'Application rejected.')
      await load()
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Review failed')
    } finally {
      setReviewingId(null)
    }
  }

  const pendingApps = applications.filter((a) => a.status === 'pending')

  return (
    <div className="p-6 max-w-3xl">
        <div className="bg-gradient-to-r from-cyan-600/90 to-orange-500/90 backdrop-blur-xl rounded-xl p-4 sm:p-5 text-white shadow-xl border border-white/10 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Developer applications</h1>
          <p className="text-white/90 text-xs sm:text-sm">
            Review Apply as Developer submissions from /courses/apply — approve to create a public team profile.
          </p>
        </div>

        <h2 className="text-lg font-semibold text-white mb-3">Pending ({pendingApps.length})</h2>
        {loading ? (
          <p className="text-gray-500 mb-8">Loading…</p>
        ) : pendingApps.length === 0 ? (
          <p className="text-gray-500 text-sm mb-8">No pending applications.</p>
        ) : (
          <ul className="space-y-3 mb-8">
            {pendingApps.map((a) => (
              <li key={a.id} className="p-4 rounded-xl border border-orange-500/20 bg-black/40 text-sm">
                <p className="text-white font-semibold">{a.name}</p>
                <p className="text-gray-400">{a.email} · {a.role}</p>
                <p className="text-gray-300 mt-2">{a.bio}</p>
                {a.skills?.length ? (
                  <p className="text-cyan-300/80 mt-1">{a.skills.join(', ')}</p>
                ) : null}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    disabled={reviewingId === a.id}
                    className="px-3 py-1.5 rounded-lg bg-green-600 text-white font-medium disabled:opacity-60"
                    onClick={() => reviewApp(a.id, true)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={reviewingId === a.id}
                    className="px-3 py-1.5 rounded-lg border border-slate-600 text-gray-300 disabled:opacity-60"
                    onClick={() => reviewApp(a.id, false)}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <h2 className="text-lg font-semibold text-white mb-3">Manual assign</h2>
        <form onSubmit={handleAssign} className="space-y-4 mb-8 p-4 rounded-xl border border-cyan-500/20 bg-black/40">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-gray-400">
              Profile slug
              <input
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. sami"
                required
              />
            </label>
            <label className="block text-sm text-gray-400">
              User email
              <input
                type="email"
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white"
                value={form.user_email}
                onChange={(e) => setForm({ ...form, user_email: e.target.value })}
                required
              />
            </label>
            <label className="block text-sm text-gray-400">
              Display name
              <input
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="block text-sm text-gray-400">
              Role
              <input
                className="mt-1 w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-white"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </label>
          </div>
          {message ? <p className="text-sm text-cyan-300">{message}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold disabled:opacity-60"
          >
            {saving ? 'Assigning…' : 'Assign developer'}
          </button>
        </form>

        <h2 className="text-lg font-semibold text-white mb-3">All profiles</h2>
        <ul className="space-y-2">
          {profiles.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap justify-between gap-2 p-3 rounded-lg border border-slate-700/60 bg-slate-900/40 text-sm"
            >
              <span className="text-white font-medium">{p.name}</span>
              <span className="text-cyan-300">/team/{p.slug}</span>
              <span className="text-gray-400">{p.user_email || 'Not assigned'}</span>
            </li>
          ))}
        </ul>
    </div>
  )
}

export default AdminDevelopersPage
