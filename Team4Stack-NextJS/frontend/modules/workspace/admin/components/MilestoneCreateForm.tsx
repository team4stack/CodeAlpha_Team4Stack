'use client'

import React, { useState } from 'react'

type Props = {
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

const MilestoneCreateForm: React.FC<Props> = ({ onSubmit }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSubmit({ title, description, due_date: dueDate || null })
      setTitle('')
      setDescription('')
      setDueDate('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="ws-form" onSubmit={handleSubmit}>
      <h3 className="ws-section__title">Add milestone</h3>
      <input className="ws-input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea className="ws-input" placeholder="Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="ws-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <button type="submit" className="ws-btn ws-btn--primary" disabled={saving}>
        {saving ? 'Adding…' : 'Add milestone'}
      </button>
    </form>
  )
}

export default MilestoneCreateForm
