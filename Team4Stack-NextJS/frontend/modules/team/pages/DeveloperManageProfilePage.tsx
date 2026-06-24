'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { developerProfilesApi } from '@/lib/api'
import { mapApiProfile } from '../data/teamPageDevelopers'
import type { TeamPageDeveloper } from '../data/teamPageDevelopers'
import '../styles/account-profile.css'

const DeveloperManageProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<TeamPageDeveloper | null>(null)
  const [form, setForm] = useState({ role: '', bio: '', longBio: '', skills: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (authLoading || !user) return
    ;(async () => {
      try {
        const res = await developerProfilesApi.getMyProfile()
        if (res.success && res.data) {
          const mapped = mapApiProfile(res.data as Record<string, unknown>)
          setProfile(mapped)
          setForm({
            role: mapped.role,
            bio: mapped.bio,
            longBio: mapped.longBio || '',
            skills: mapped.skills.join(', '),
          })
        }
      } catch {
        setError('No developer profile assigned. Contact team admin.')
      } finally {
        setLoading(false)
      }
    })()
  }, [authLoading, user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const skills = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const res = await developerProfilesApi.updateMyProfile({
        role: form.role,
        bio: form.bio,
        long_bio: form.longBio,
        skills,
      })
      if (!res.success) throw new Error(res.error || 'Save failed')
      setSaved(true)
      if (res.data) setProfile(mapApiProfile(res.data as Record<string, unknown>))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="account-profile">
        <p className="account-profile__muted">Loading…</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="account-profile container-custom">
        <p className="account-profile__muted">Sign in to manage your developer profile.</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="account-profile container-custom">
        <span className="account-profile__badge">Developer</span>
        <h1 className="account-profile__title">Developer Profile</h1>
        <p className="account-profile__error">{error || 'No developer profile assigned yet.'}</p>
        <p className="account-profile__hint">
          Team admin must assign your account as a developer before you can manage a public profile.
        </p>
        <Link href="/profile" className="account-profile__link">
          Back to client profile
        </Link>
      </div>
    )
  }

  return (
    <div className="account-profile container-custom">
      <span className="account-profile__badge account-profile__badge--dev">Developer Profile</span>
      <h1 className="account-profile__title">Manage your profile</h1>
      <p className="account-profile__hint">
        Public page:{' '}
        <Link href={`/team/${profile.slug}`} className="account-profile__link">
          /team/{profile.slug}
        </Link>
      </p>

      <form className="account-profile__form" onSubmit={handleSave}>
        <label>
          Role
          <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        </label>
        <label>
          Short bio
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} />
        </label>
        <label>
          About (long)
          <textarea value={form.longBio} onChange={(e) => setForm({ ...form, longBio: e.target.value })} rows={4} />
        </label>
        <label>
          Skills (comma separated)
          <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </label>

        {error ? <p className="account-profile__error">{error}</p> : null}
        {saved ? <p className="account-profile__success">Profile saved.</p> : null}

        <button type="submit" className="account-profile__cta" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      <Link href="/developer/inbox" className="account-profile__link account-profile__link--block">
        Open inbox →
      </Link>
    </div>
  )
}

export default DeveloperManageProfilePage
