'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { developerProfilesApi } from '@/lib/api'
import '../styles/account-profile.css'

type Conversation = {
  id: number
  subject?: string
  client_email: string
  developer?: { name: string; slug: string }
  last_message?: string
}

const DeveloperInboxPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [messages, setMessages] = useState<{ id: number; sender_kind: string; body: string }[]>([])
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (authLoading || !user) return
    ;(async () => {
      try {
        const res = await developerProfilesApi.listConversations()
        if (res.success && Array.isArray(res.data)) {
          setConversations(res.data)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [authLoading, user])

  useEffect(() => {
    if (!selectedId) return
    ;(async () => {
      const res = await developerProfilesApi.listMessages(selectedId)
      if (res.success && Array.isArray(res.data)) setMessages(res.data)
    })()
  }, [selectedId])

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId || !reply.trim()) return
    setSending(true)
    try {
      const res = await developerProfilesApi.reply(selectedId, reply.trim())
      if (res.success) {
        setReply('')
        const list = await developerProfilesApi.listMessages(selectedId)
        if (list.success && Array.isArray(list.data)) setMessages(list.data)
      }
    } finally {
      setSending(false)
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
        <p className="account-profile__muted">Sign in to view messages.</p>
      </div>
    )
  }

  return (
    <div className="account-profile container-custom account-profile--inbox">
      <Link href="/profile" className="account-profile__link">
        ← Your profile
      </Link>
      <h1 className="account-profile__title">Messages</h1>

      <div className="account-profile__inbox">
        <ul className="account-profile__conv-list">
          {conversations.length === 0 ? (
            <li className="account-profile__muted">No conversations yet.</li>
          ) : (
            conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`account-profile__conv${selectedId === c.id ? ' account-profile__conv--active' : ''}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <strong>{c.developer?.name || c.subject || 'Conversation'}</strong>
                  <span>{c.last_message?.slice(0, 60) || c.client_email}</span>
                </button>
              </li>
            ))
          )}
        </ul>

        {selectedId ? (
          <div className="account-profile__thread">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`account-profile__msg account-profile__msg--${m.sender_kind}`}
              >
                {m.body}
              </div>
            ))}
            <form onSubmit={handleReply} className="account-profile__reply">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a reply…"
                rows={2}
              />
              <button type="submit" disabled={sending}>
                {sending ? 'Sending…' : 'Reply'}
              </button>
            </form>
          </div>
        ) : (
          <p className="account-profile__muted">Select a conversation.</p>
        )}
      </div>
    </div>
  )
}

export default DeveloperInboxPage
