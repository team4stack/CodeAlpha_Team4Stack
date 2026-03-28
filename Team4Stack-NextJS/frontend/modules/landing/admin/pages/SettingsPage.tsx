'use client'

import React, { useEffect, useState } from 'react'
import { seedDemoData, migrateWebsiteData, migrateMentorProfile } from '@/lib/utils/seedSupabase'
import { retryWithBackoff } from '@/lib/utils/retry'

type KV = { key: string; value: string }

const DEFAULT_KEYS: Array<{ key: string; label: string; placeholder?: string }> = [
  // Core
  // Admin appearances (links only)
  { key: 'admin_avatar_url', label: 'Admin Avatar Image URL', placeholder: 'https://github.com/.../avatar.png?raw=1' },
  // SEO / Social basics
  // Add more admin-only options here in future
]

const SettingsPage: React.FC = () => {
  const [rows, setRows] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [tabKey, setTabKey] = useState<string>('dashboard')
  const [tabLabel, setTabLabel] = useState<string>('')
  const [seeding, setSeeding] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migratingMentor, setMigratingMentor] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { landingApi } = await import('@/lib/api')
      const result = await retryWithBackoff(async () => {
        return await landingApi.getSiteSettings()
      }) as { data?: KV[]; error?: string }
      const data = result.data || null
      const map: Record<string, string> = {}
      ;(data as KV[] | null)?.forEach(r => { map[r.key] = r.value })
      setRows(map)
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    setMsg(null)
    const payload = DEFAULT_KEYS.map(k => ({ key: k.key, value: rows[k.key] || '' }))
    const { landingApi } = await import('@/lib/api')
    const result = await retryWithBackoff(async () => {
      return await landingApi.upsertSiteSettings(payload)
    }) as { error?: string }
    const error = result.error ? { message: result.error } : null
    setSaving(false)
    setMsg(error ? error.message : 'Saved!')
  }

  const seedAll = async () => {
    setSeeding(true)
    setMsg(null)
    const res = await seedDemoData()
    const summary = res.map(r => `${r.table}: ${r.skipped ? 'skipped' : `inserted ${r.inserted}`}${r.error ? ` (error: ${r.error})` : ''}`).join(' | ')
    setMsg(`Seed: ${summary}`)
    setSeeding(false)
  }

  const migrateAll = async () => {
    setMigrating(true)
    setMsg(null)
    const res = await migrateWebsiteData()
    const summary = res.map(r => `${r.table}: upserted ${r.inserted}${r.error ? ` (error: ${r.error})` : ''}`).join(' | ')
    setMsg(`Migrate: ${summary}`)
    setMigrating(false)
  }

  const migrateMentor = async () => {
    setMigratingMentor(true)
    setMsg(null)
    const r = await migrateMentorProfile()
    setMsg(`Mentor: ${r.error ? 'error: ' + r.error : 'upserted ' + r.inserted}`)
    setMigratingMentor(false)
  }

  const changePassword = async () => {
    setPasswordMsg(null)
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg('Please fill in all password fields.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('New password and confirm password do not match.')
      return
    }
    if (newPassword === currentPassword) {
      setPasswordMsg('New password must be different from the current password.')
      return
    }

    setPasswordSaving(true)
    try {
      const { superadminApi } = await import('@/lib/api')
      const result = await superadminApi.changeAdminPassword(currentPassword, newPassword)
      if (result.error || result.success === false) {
        setPasswordMsg(result.error || 'Unable to update password.')
      } else {
        setPasswordMsg('Password updated successfully.')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error: any) {
      setPasswordMsg(error?.message || 'Unable to update password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-5 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-white/90 text-sm mt-1">Configure landing page settings and preferences</p>
        </div>
      </div>

      <div className="rounded-xl p-4 bg-slate-900/80 backdrop-blur border border-white/10 shadow">
        {loading ? (
          <div className="text-sm text-white/60">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_KEYS.map(item => (
              <div key={item.key} className="space-y-1">
                <label className="text-xs font-semibold text-white/80">{item.label}</label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/20"
                  placeholder={item.placeholder}
                  value={rows[item.key] || ''}
                  onChange={(e) => setRows(s => ({ ...s, [item.key]: e.target.value }))}
                />
              </div>
            ))}
            {/* Single control to rename any admin tab */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-white/80">Rename Admin Tab</label>
              <div className="flex gap-2">
                <select className="px-4 py-3 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/20" value={tabKey} onChange={(e) => setTabKey(e.target.value)}>
                  <option value="hero">Hero Section</option>
                  <option value="dashboard">Dashboard</option>
                  <option value="projects">Projects</option>
                  <option value="services">Services</option>
                  <option value="reviews">Reviews</option>
                  <option value="courses">Courses</option>
                  <option value="team">Team</option>
                  <option value="mentor">Mentor</option>
                  <option value="contact">Contact</option>
                  <option value="footer">Footer</option>
                  <option value="settings">Settings</option>
                </select>
                <input className="flex-1 px-4 py-3 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-white/20" placeholder="New tab label (e.g., Portfolio)" value={tabLabel} onChange={(e) => setTabLabel(e.target.value)} />
                <button type="button" className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20" onClick={async () => {
                  const key = `tab_label_${tabKey}`
                  const payload = [{ key, value: tabLabel }]
                  setSaving(true)
                  const { landingApi } = await import('@/lib/api')
                  const result = await retryWithBackoff(async () => await landingApi.upsertSiteSettings(payload)) as { error?: string }
                  setSaving(false)
                  setMsg(result.error ? result.error : `Renamed ${tabKey} -> ${tabLabel}`)
                }}>Apply</button>
              </div>
              <p className="text-xs text-white/50">Pick one tab, type a new name, click Apply. Sidebar updates on refresh.</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <button disabled={saving} onClick={save} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">{saving ? 'Saving...' : 'Save Settings'}</button>
          {/* Removed migrate/seed buttons per request */}
          {msg && <div className="text-sm text-white/70">{msg}</div>}
        </div>
      </div>

      <div className="rounded-xl p-4 bg-slate-900/80 backdrop-blur border border-white/10 shadow">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Change Password</h2>
            <p className="text-xs text-white/50">Use at least 8 characters. This updates your admin login password.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswords(v => !v)}
            className="self-start sm:self-auto px-4 py-2 rounded-lg border border-white/10 text-white/80 text-xs font-semibold hover:text-white hover:border-white/20 transition-all"
          >
            {showPasswords ? 'Hide Passwords' : 'Show Passwords'}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/80">Current Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-white/20"
              placeholder="Current password"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/80">New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-white/20"
              placeholder="New password"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/80">Confirm Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900/70 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 hover:border-white/20"
              placeholder="Confirm password"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={changePassword}
            disabled={passwordSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
          {passwordMsg && <div className="text-sm text-white/70">{passwordMsg}</div>}
        </div>
      </div>
    </div>
  )
}
export default SettingsPage






