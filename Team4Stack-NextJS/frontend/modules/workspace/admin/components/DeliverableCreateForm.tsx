'use client'

import React, { useState } from 'react'

type Props = {
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

const DeliverableCreateForm: React.FC<Props> = ({ onSubmit }) => {
  const [title, setTitle] = useState('')
  const [stagingUrl, setStagingUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [visible, setVisible] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSubmit({
        title,
        staging_url: stagingUrl || null,
        file_url: fileUrl || null,
        visible_to_client: visible,
      })
      setTitle('')
      setStagingUrl('')
      setFileUrl('')
      setVisible(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="ws-form" onSubmit={handleSubmit}>
      <h3 className="ws-section__title">Add deliverable</h3>
      <input className="ws-input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className="ws-input" placeholder="Staging / preview URL" value={stagingUrl} onChange={(e) => setStagingUrl(e.target.value)} />
      <input className="ws-input" placeholder="File / download URL" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
      <label className="ws-checkbox">
        <input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
        Share with client now
      </label>
      <button type="submit" className="ws-btn ws-btn--primary" disabled={saving}>
        {saving ? 'Adding…' : 'Add deliverable'}
      </button>
    </form>
  )
}

export default DeliverableCreateForm
