'use client'

import { useState } from 'react'

type Props = {
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}

export default function StaffAssignForm({ onSubmit }: Props) {
  const [staffName, setStaffName] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [role, setRole] = useState('developer')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        staff_name: staffName.trim() || null,
        staff_email: staffEmail.trim(),
        role,
      })
      setStaffName('')
      setStaffEmail('')
      setRole('developer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="ws-form" onSubmit={submit}>
      <h3 className="ws-section__title">Assign team member</h3>
      <div className="ws-form__row ws-form__row--2">
        <div>
          <label className="ws-label">Name</label>
          <input className="ws-input" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
        </div>
        <div>
          <label className="ws-label">Email *</label>
          <input className="ws-input" type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="ws-label">Role</label>
        <select className="ws-input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="developer">Developer</option>
          <option value="qa">QA</option>
          <option value="pm">PM</option>
        </select>
      </div>
      <button type="submit" className="ws-btn ws-btn--primary" disabled={saving}>
        {saving ? 'Assigning…' : 'Assign'}
      </button>
    </form>
  )
}
