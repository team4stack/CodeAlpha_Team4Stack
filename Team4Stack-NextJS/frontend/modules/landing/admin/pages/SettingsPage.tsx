'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await retryWithBackoff(async () => {
        return await supabase.from('site_settings').select('key,value')
      }) as { data: KV[] | null }
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
    const { error } = await retryWithBackoff(async () => {
      return await supabase.from('site_settings').upsert(payload)
    }) as { error: { message: string } | null }
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Settings</h1>
      <div className="rounded-xl p-4 bg-white/80 dark:bg-gray-800/70 backdrop-blur border border-white/20 dark:border-white/10 shadow">
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_KEYS.map(item => (
              <div key={item.key} className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.label}</label>
                <input
                  className="w-full px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600"
                  placeholder={item.placeholder}
                  value={rows[item.key] || ''}
                  onChange={(e) => setRows(s => ({ ...s, [item.key]: e.target.value }))}
                />
              </div>
            ))}
            {/* Single control to rename any admin tab */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rename Admin Tab</label>
              <div className="flex gap-2">
                <select className="px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" value={tabKey} onChange={(e) => setTabKey(e.target.value)}>
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
                  <option value="stackstore">StackStore</option>
                  <option value="settings">Settings</option>
                </select>
                <input className="flex-1 px-4 py-3 rounded-lg bg-white/90 dark:bg-gray-700/90 border-2 border-gray-200 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600" placeholder="New tab label (e.g., Portfolio)" value={tabLabel} onChange={(e) => setTabLabel(e.target.value)} />
                <button type="button" className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300" onClick={async () => {
                  const key = `tab_label_${tabKey}`
                  const payload = [{ key, value: tabLabel }]
                  setSaving(true)
                  const { error } = await retryWithBackoff(async () => await supabase.from('site_settings').upsert(payload)) as { error: { message: string } | null }
                  setSaving(false)
                  setMsg(error ? error.message : `Renamed ${tabKey} → ${tabLabel}`)
                }}>Apply</button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pick one tab, type a new name, click Apply. Sidebar updates on refresh.</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <button disabled={saving} onClick={save} className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">{saving ? 'Saving…' : 'Save Settings'}</button>
          {/* Removed migrate/seed buttons per request */}
          {msg && <div className="text-sm text-gray-600 dark:text-gray-300">{msg}</div>}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage


