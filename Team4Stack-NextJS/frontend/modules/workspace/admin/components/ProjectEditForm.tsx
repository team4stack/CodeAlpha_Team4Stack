'use client'

import React, { useState } from 'react'

type Props = {
  initial: { status: string; deadline?: string | null; description?: string | null }
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

const ProjectEditForm: React.FC<Props> = ({ initial, onSubmit }) => {
  const [status, setStatus] = useState(initial.status)
  const [deadline, setDeadline] = useState(initial.deadline?.slice(0, 10) || '')
  const [description, setDescription] = useState(initial.description || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ status, deadline: deadline || null, description })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="ws-form" onSubmit={handleSubmit}>
      <h3 className="ws-section__title">Edit project</h3>
      <label>
        Status
        <select className="ws-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="scoped">Scoped</option>
          <option value="in_progress">In Progress</option>
          <option value="client_review">Client Review</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <label>
        Deadline
        <input className="ws-input" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </label>
      <label>
        Description
        <textarea className="ws-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <button type="submit" className="ws-btn ws-btn--primary" disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}

export default ProjectEditForm
