'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { FiRefreshCw, FiSave, FiSettings } from 'react-icons/fi'
import { landingApi } from '@/lib/api'

type SettingsForm = {
  tab_label_stackstore: string
  stackstore_public_enabled: boolean
  stackstore_hero_title: string
  stackstore_hero_subtitle: string
  stackstore_launch_status: string
  stackstore_contact_email: string
}

const SETTINGS_KEYS = [
  'tab_label_stackstore',
  'stackstore_public_enabled',
  'stackstore_hero_title',
  'stackstore_hero_subtitle',
  'stackstore_launch_status',
  'stackstore_contact_email',
] as const

const defaults: SettingsForm = {
  tab_label_stackstore: 'StackStore',
  stackstore_public_enabled: false,
  stackstore_hero_title: 'StackStore',
  stackstore_hero_subtitle: 'A marketplace where students can showcase, share, and sell their projects.',
  stackstore_launch_status: 'beta',
  stackstore_contact_email: '',
}

export default function StackStoreSettingsPage() {
  const [formData, setFormData] = useState<SettingsForm>(defaults)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await landingApi.getSiteSettings([...SETTINGS_KEYS])
      if (result.error) throw new Error(result.error)

      const rows = Array.isArray(result.data) ? result.data : []
      const values = rows.reduce<Record<string, string>>((acc, row: any) => {
        if (row?.key) acc[row.key] = String(row.value ?? '')
        return acc
      }, {})

      setFormData({
        tab_label_stackstore: values.tab_label_stackstore || defaults.tab_label_stackstore,
        stackstore_public_enabled:
          values.stackstore_public_enabled === 'true' || defaults.stackstore_public_enabled,
        stackstore_hero_title: values.stackstore_hero_title || defaults.stackstore_hero_title,
        stackstore_hero_subtitle: values.stackstore_hero_subtitle || defaults.stackstore_hero_subtitle,
        stackstore_launch_status: values.stackstore_launch_status || defaults.stackstore_launch_status,
        stackstore_contact_email: values.stackstore_contact_email || defaults.stackstore_contact_email,
      })
    } catch (err: any) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'loadStackStoreSettings')
      setError(sanitizeError(err).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const entries = [
        { key: 'tab_label_stackstore', value: formData.tab_label_stackstore.trim() || defaults.tab_label_stackstore },
        { key: 'stackstore_public_enabled', value: String(formData.stackstore_public_enabled) },
        { key: 'stackstore_hero_title', value: formData.stackstore_hero_title.trim() || defaults.stackstore_hero_title },
        { key: 'stackstore_hero_subtitle', value: formData.stackstore_hero_subtitle.trim() || defaults.stackstore_hero_subtitle },
        { key: 'stackstore_launch_status', value: formData.stackstore_launch_status.trim() || defaults.stackstore_launch_status },
        { key: 'stackstore_contact_email', value: formData.stackstore_contact_email.trim() },
      ]

      const result = await landingApi.upsertSiteSettings(entries)
      if (result.error) throw new Error(result.error)
      setSuccess('StackStore settings saved successfully.')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      const { sanitizeError, logErrorSecurely } = await import('@/lib/utils/errorHandler')
      logErrorSecurely(err, 'saveStackStoreSettings')
      setError(sanitizeError(err).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r from-orange-500/90 to-red-500/80 p-5 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/20 bg-black/15 p-3">
            <FiSettings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">StackStore Settings</h1>
            <p className="mt-1 text-sm text-white/85">Configure storefront labels, launch state, and public marketplace copy.</p>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/15 p-4 text-sm text-red-200">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-sm text-emerald-200">{success}</div>}

      <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-slate-950/80 p-5 shadow-lg">
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-300">Admin tab label</span>
            <input
              value={formData.tab_label_stackstore}
              onChange={(event) => setFormData({ ...formData, tab_label_stackstore: event.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-300">Launch status</span>
            <select
              value={formData.stackstore_launch_status}
              onChange={(event) => setFormData({ ...formData, stackstore_launch_status: event.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
            >
              <option value="draft">Draft</option>
              <option value="beta">Beta</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-300">Public hero title</span>
            <input
              value={formData.stackstore_hero_title}
              onChange={(event) => setFormData({ ...formData, stackstore_hero_title: event.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium text-slate-300">Contact email</span>
            <input
              type="email"
              value={formData.stackstore_contact_email}
              onChange={(event) => setFormData({ ...formData, stackstore_contact_email: event.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
            />
          </label>
        </div>

        <label className="mt-5 block space-y-1">
          <span className="text-sm font-medium text-slate-300">Public hero subtitle</span>
          <textarea
            value={formData.stackstore_hero_subtitle}
            onChange={(event) => setFormData({ ...formData, stackstore_hero_subtitle: event.target.value })}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-orange-400"
          />
        </label>

        <label className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={formData.stackstore_public_enabled}
            onChange={(event) => setFormData({ ...formData, stackstore_public_enabled: event.target.checked })}
            className="h-4 w-4 rounded border-white/20 text-orange-500 focus:ring-orange-500"
          />
          Enable public StackStore marketplace
        </label>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            type="button"
            onClick={loadSettings}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <FiRefreshCw className="h-4 w-4" />
            Reload
          </button>
        </div>
      </form>
    </div>
  )
}
