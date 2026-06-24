'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { developerProfilesApi } from '@/lib/api'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'

const inputClass = (hasError?: boolean) =>
  `w-full px-4 py-3 rounded-xl bg-white/5 border ${
    hasError ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 hover:bg-white/10'
  } text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all backdrop-blur-sm`

const DeveloperApplyForm: React.FC = () => {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Full Stack Developer',
    skills: '',
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
    if (user?.email) setForm((f) => ({ ...f, email: user.email || f.email }))
  }, [user?.name, user?.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await developerProfilesApi.submitApplication({
        ...form,
        email: user?.email || form.email,
        name: user?.name || form.name,
      })
      if (!res.success) throw new Error(res.error || 'Could not submit application')
      setDone(true)
    } catch (err: unknown) {
      setError(getUserFriendlyMessage(err, 'Could not submit application. Please try again.'))
    } finally {
      setSending(false)
    }
  }

  if (done) {
    return (
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
        <p className="text-emerald-400 font-semibold text-lg mb-2">Application submitted!</p>
        <p className="text-gray-300 text-sm">
          Team admin will review your profile. You will be contacted by email when approved.
        </p>
      </div>
    )
  }

  return (
    <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 overflow-hidden w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-gray-300">
          Tell us about your skills. After approval, your profile will appear on the Team page and you can
          manage it from /developer/profile.
        </p>

        {!user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Full Name *</label>
              <input
                className={inputClass()}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Email *</label>
              <input
                type="email"
                className={inputClass()}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@email.com"
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-cyan-200/90 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2">
            Applying as <strong>{user.name || user.email}</strong>
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Role *</label>
            <input
              className={inputClass()}
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
              placeholder="e.g. Full Stack Developer"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Skills *</label>
            <input
              className={inputClass()}
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              required
              placeholder="React, Node.js, PostgreSQL"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">Portfolio URL</label>
            <input
              className={inputClass()}
              value={form.portfolio_url}
              onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">GitHub URL</label>
            <input
              className={inputClass()}
              value={form.github_url}
              onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              placeholder="https://github.com/..."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">About you *</label>
          <textarea
            className={inputClass()}
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            required
            minLength={20}
            placeholder="Your experience, projects, and what you build best..."
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-semibold text-white/90 mb-2">
            Why join Team4Stack? (optional)
          </label>
          <textarea
            className={inputClass()}
            rows={2}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Optional message to the team"
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="submit"
          disabled={sending}
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 disabled:opacity-60 transition"
        >
          {sending ? 'Submitting…' : 'Submit developer application'}
        </button>
      </form>
    </div>
  )
}

export default DeveloperApplyForm
