'use client';

import React, { useEffect, useState } from 'react';
import { coursesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CourseStudentNotificationsPage() {
  const [adminEmail, setAdminEmail] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'all_approved' | 'emails'>('all_approved');
  const [emailsRaw, setEmailsRaw] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('admin_session');
      if (raw) {
        const s = JSON.parse(raw) as { email?: string };
        if (s.email) setAdminEmail(s.email);
      }
    } catch {
      // ignore
    }
  }, []);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) {
      toast.error('Admin session missing. Please log in again.');
      return;
    }
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }
    let emails: string[] | undefined;
    if (audience === 'emails') {
      emails = emailsRaw
        .split(/[\n,;]+/)
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean);
      if (emails.length === 0) {
        toast.error('Add at least one email for custom audience.');
        return;
      }
    }
    setSending(true);
    try {
      const res = await coursesApi.sendStudentNotifications({
        adminEmail,
        title: title.trim(),
        body: body.trim(),
        audience,
        emails
      });
      if (res.success && res.data) {
        const d = res.data as { sent?: number; recipientCount?: number };
        toast.success(`Sent to ${d.sent ?? 0} student(s).`);
        setTitle('');
        setBody('');
        setEmailsRaw('');
      } else {
        toast.error(res.error || 'Failed to send notifications.');
      }
    } catch {
      toast.error('Failed to send notifications.');
    } finally {
      setSending(false);
    }
  };

  return (
      <div className="max-w-2xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notify students</h1>
          <p className="mt-1 text-sm text-white/70">
            Messages appear in the <strong className="text-cyan-300">notification bell</strong> on the Courses navbar
            for logged-in students with an approved application.
          </p>
        </div>

        <form onSubmit={onSend} className="space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md">
          <div>
            <label className="block text-sm font-medium text-white/90">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="e.g. Class moved to Saturday 6 PM"
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/90">Message (optional)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white placeholder:text-white/40 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              placeholder="Details for students…"
              maxLength={4000}
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-white/90 mb-2">Send to</span>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-2 text-sm text-white/85">
                <input
                  type="radio"
                  name="aud"
                  checked={audience === 'all_approved'}
                  onChange={() => setAudience('all_approved')}
                  className="mt-1"
                />
                <span>
                  <strong>All approved students</strong>
                  <span className="block text-xs text-white/55">Every unique email with at least one approved course on an application.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-white/85">
                <input
                  type="radio"
                  name="aud"
                  checked={audience === 'emails'}
                  onChange={() => setAudience('emails')}
                  className="mt-1"
                />
                <span>
                  <strong>Specific emails</strong>
                  <span className="block text-xs text-white/55">Comma or newline separated.</span>
                </span>
              </label>
            </div>
            {audience === 'emails' && (
              <textarea
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                rows={3}
                className="mt-2 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                placeholder="student1@gmail.com, student2@gmail.com"
              />
            )}
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send notification'}
          </button>
        </form>
      </div>
  );
}
