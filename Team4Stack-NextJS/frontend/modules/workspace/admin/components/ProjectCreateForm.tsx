'use client'

import { useState } from 'react'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'
import type { ProjectStatus } from '../../types'

type Props = {
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

const STATUSES: ProjectStatus[] = ['scoped', 'in_progress', 'client_review', 'completed', 'archived']

export default function ProjectCreateForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('scoped')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        client_name: clientName.trim() || null,
        client_email: clientEmail.trim() || null,
        deadline: deadline || null,
        status,
      })
      setTitle('')
      setDescription('')
      setClientName('')
      setClientEmail('')
      setDeadline('')
      setStatus('scoped')
    } catch (err) {
      setError(getUserFriendlyMessage(err, 'Failed to create project.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="ws-form ws-card" onSubmit={submit}>
      <h3 className="ws-section__title">New client project</h3>
      {error ? <p className="ws-error">{error}</p> : null}
      <div>
        <label className="ws-label" htmlFor="ws-title">Title *</label>
        <input id="ws-title" className="ws-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="ws-label" htmlFor="ws-desc">Description</label>
        <textarea id="ws-desc" className="ws-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="ws-form__row ws-form__row--2">
        <div>
          <label className="ws-label" htmlFor="ws-client-name">Client name</label>
          <input id="ws-client-name" className="ws-input" value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>
        <div>
          <label className="ws-label" htmlFor="ws-client-email">Client email *</label>
          <input id="ws-client-email" type="email" className="ws-input" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} required />
        </div>
      </div>
      <div className="ws-form__row ws-form__row--2">
        <div>
          <label className="ws-label" htmlFor="ws-deadline">Deadline</label>
          <input id="ws-deadline" type="date" className="ws-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <div>
          <label className="ws-label" htmlFor="ws-status">Status</label>
          <select id="ws-status" className="ws-input" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="ws-btn ws-btn--primary" disabled={saving}>
        {saving ? 'Creating…' : 'Create project'}
      </button>
    </form>
  )
}
