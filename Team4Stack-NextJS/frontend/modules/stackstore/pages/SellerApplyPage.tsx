'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { stackstoreApi } from '@/lib/api'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'
import { STACK_PLATFORMS } from '../types'
import '../stackstore.css'

const SellerApplyPage: React.FC = () => {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [form, setForm] = useState({
    name: '',
    store_name: '',
    primary_platform: 'MERN Stack',
    portfolio_url: '',
    github_url: '',
    bio: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (user?.name) setForm((f) => ({ ...f, name: user.name || f.name }))
  }, [user?.name])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace(`/login?returnTo=${encodeURIComponent('/stackstore/seller/apply')}`)
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await stackstoreApi.submitSellerApplication(form)
      if (!res.success) throw new Error(res.error || 'Could not submit application')
      setDone(true)
    } catch (err: unknown) {
      setError(getUserFriendlyMessage(err, 'Could not submit application. Please try again.'))
    } finally {
      setSending(false)
    }
  }

  if (authLoading || !user) {
    return <div className="min-h-screen bg-slate-950 pt-28 text-center text-slate-400">Loading…</div>
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-950 pt-28 pb-16">
        <div className="container-custom max-w-xl text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Application submitted</h1>
          <p className="text-slate-400 mb-6">
            StackStore admin will review your seller application. You will get seller access after approval.
          </p>
          <Link href="/stackstore" className="stackstore-btn">
            Back to StackStore
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-16">
      <div className="container-custom max-w-2xl">
        <Link href="/stackstore" className="text-sm text-purple-300 hover:text-purple-200">
          ← Back to StackStore
        </Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2">Become a StackStore seller</h1>
        <p className="text-slate-400 mb-8">
          Sell verified pre-made stack projects. Team4Stack reviews your profile, verifies each listing, and handles
          buyer payments securely.
        </p>

        <form onSubmit={handleSubmit} className="stackstore-form rounded-2xl border border-slate-700/60 bg-slate-900/50 p-6">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full name *</label>
            <input
              className="stackstore-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Store name *</label>
            <input
              className="stackstore-input"
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              placeholder="e.g. Sami Projects"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Primary stack / platform *</label>
            <select
              className="stackstore-select"
              value={form.primary_platform}
              onChange={(e) => setForm({ ...form, primary_platform: e.target.value })}
            >
              {STACK_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">GitHub profile URL</label>
            <input
              className="stackstore-input"
              value={form.github_url}
              onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              placeholder="https://github.com/username"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Portfolio URL</label>
            <input
              className="stackstore-input"
              value={form.portfolio_url}
              onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">About you & your projects *</label>
            <textarea
              className="stackstore-textarea min-h-28"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="What kind of pre-made projects do you sell? MERN apps, Next.js dashboards, etc."
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Message to admin</label>
            <textarea
              className="stackstore-textarea min-h-20"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          {error ? <p className="text-red-400 text-sm">{error}</p> : null}

          <button type="submit" disabled={sending} className="stackstore-btn w-full">
            {sending ? 'Submitting…' : 'Submit seller application'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SellerApplyPage
