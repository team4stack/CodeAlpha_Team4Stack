'use client'

import React, { useEffect, useState } from 'react'
import { coursesApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { collectApprovedApplications } from '@/modules/courses/admin/pages/student-progress/admissionsData'
import { normalizeEmail } from '@/modules/courses/admin/pages/student-progress/shared'

export default function CourseStudentNotificationsPage() {
  const [adminEmail, setAdminEmail] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [recipientMode, setRecipientMode] = useState<'all' | 'single' | 'custom'>('all')
  const [emailsRaw, setEmailsRaw] = useState('')
  const [selectedEmail, setSelectedEmail] = useState('')
  const [students, setStudents] = useState<Array<{ email: string; name: string; rollNumber?: string }>>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('admin_session')
      if (raw) {
        const s = JSON.parse(raw) as { email?: string }
        if (s.email) setAdminEmail(s.email)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoadingStudents(true)
        const res = await coursesApi.getAdmissionForms()
        if (res.error) {
          throw new Error(res.error)
        }
        const rows = Array.isArray(res.data) ? res.data : []
        const approved = collectApprovedApplications(rows as unknown[])
        const uniqueByEmail = new Map<string, { email: string; name: string; rollNumber?: string }>()
        approved.forEach((row) => {
          const email = normalizeEmail(row.email)
          if (!email) return
          if (!uniqueByEmail.has(email)) {
            uniqueByEmail.set(email, {
              email,
              name: (row as { name?: string }).name || 'Student',
              rollNumber: row.roll_number || undefined
            })
          }
        })
        const list = Array.from(uniqueByEmail.values()).sort((a, b) => a.name.localeCompare(b.name))
        setStudents(list)
        if (!selectedEmail && list.length > 0) {
          setSelectedEmail(list[0].email)
        }
      } catch {
        setStudents([])
      } finally {
        setLoadingStudents(false)
      }
    }
    void loadStudents()
  }, [selectedEmail])

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminEmail) {
      toast.error('Admin session missing. Please log in again.')
      return
    }
    if (!title.trim()) {
      toast.error('Title is required.')
      return
    }
    let emails: string[] | undefined
    if (recipientMode === 'single') {
      const chosen = selectedEmail.trim().toLowerCase()
      if (!chosen) {
        toast.error('Select a student first.')
        return
      }
      emails = [chosen]
    } else if (recipientMode === 'custom') {
      emails = emailsRaw
        .split(/[\n,;]+/)
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean)
      if (emails.length === 0) {
        toast.error('Add at least one email for custom audience.')
        return
      }
    }
    setSending(true)
    try {
      const audience = recipientMode === 'all' ? 'all_approved' : 'emails'
      const res = await coursesApi.sendStudentNotifications({
        adminEmail,
        title: title.trim(),
        body: body.trim(),
        audience,
        emails
      })
      if (res.success && res.data) {
        const d = res.data as { sent?: number; recipientCount?: number }
        toast.success(`Sent to ${d.sent ?? 0} student(s).`)
        setTitle('')
        setBody('')
        setEmailsRaw('')
      } else {
        toast.error(res.error || 'Failed to send notifications.')
      }
    } catch {
      toast.error('Failed to send notifications.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-slate-900/70 p-5 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">Student Notifications</h1>
            <p className="mt-1 text-sm text-white/70">
              Messages appear in the <span className="text-cyan-300 font-semibold">notification bell</span> on the Courses navbar.
            </p>
          </div>
          <div className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            Approved students only
          </div>
        </div>
      </div>

      <form onSubmit={onSend} className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-white/90">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g. Class moved to Saturday 6 PM"
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-white/90">Message (optional)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Details for students..."
              maxLength={4000}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div>
            <span className="block text-sm font-semibold text-white/90 mb-2">Send to</span>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-2 text-sm text-white/85">
                <input
                  type="radio"
                  name="aud"
                  checked={recipientMode === 'all'}
                  onChange={() => setRecipientMode('all')}
                  className="mt-1"
                />
                <span>
                  <strong>All approved students</strong>
                  <span className="block text-xs text-white/55">Every unique email with at least one approved course.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-white/85">
                <input
                  type="radio"
                  name="aud"
                  checked={recipientMode === 'single'}
                  onChange={() => setRecipientMode('single')}
                  className="mt-1"
                />
                <span>
                  <strong>Single student</strong>
                  <span className="block text-xs text-white/55">Pick one approved student.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-white/85">
                <input
                  type="radio"
                  name="aud"
                  checked={recipientMode === 'custom'}
                  onChange={() => setRecipientMode('custom')}
                  className="mt-1"
                />
                <span>
                  <strong>Custom emails</strong>
                  <span className="block text-xs text-white/55">Comma or newline separated.</span>
                </span>
              </label>
            </div>
          </div>

          {recipientMode === 'single' && (
            <div>
              <label className="block text-xs font-semibold text-white/70">Select student</label>
              <select
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white"
                disabled={loadingStudents}
              >
                {students.map((student) => (
                  <option key={student.email} value={student.email} className="bg-slate-900">
                    {student.name} {student.rollNumber ? `(${student.rollNumber})` : ''} - {student.email}
                  </option>
                ))}
              </select>
              {loadingStudents && (
                <p className="mt-2 text-xs text-white/50">Loading approved students...</p>
              )}
            </div>
          )}

          {recipientMode === 'custom' && (
            <div>
              <label className="block text-xs font-semibold text-white/70">Emails</label>
              <textarea
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="student1@gmail.com, student2@gmail.com"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send notification'}
          </button>
        </div>
      </form>
    </div>
  )
}
