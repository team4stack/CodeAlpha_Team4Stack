'use client'

import { useState } from 'react'

type Props = {
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

export default function TaskCreateForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeEmail, setAssigneeEmail] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        assignee_email: assigneeEmail.trim() || null,
        due_date: dueDate || null,
      })
      setTitle('')
      setDescription('')
      setAssigneeEmail('')
      setDueDate('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="ws-form" onSubmit={submit}>
      <h3 className="ws-section__title">Add task</h3>
      <div>
        <label className="ws-label">Title *</label>
        <input className="ws-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="ws-label">Description</label>
        <textarea className="ws-input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="ws-form__row ws-form__row--2">
        <div>
          <label className="ws-label">Assignee email</label>
          <input className="ws-input" type="email" value={assigneeEmail} onChange={(e) => setAssigneeEmail(e.target.value)} />
        </div>
        <div>
          <label className="ws-label">Due date</label>
          <input className="ws-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      <button type="submit" className="ws-btn ws-btn--primary" disabled={saving}>
        {saving ? 'Saving…' : 'Add task'}
      </button>
    </form>
  )
}
