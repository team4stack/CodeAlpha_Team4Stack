'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { developerProfilesApi } from '@/lib/api'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'
import type { TeamPageDeveloper } from '../data/teamPageDevelopers'

type ChatMessage = {
  id: string | number
  role: 'client' | 'developer'
  text: string
  time: string
}

type Props = {
  developer: TeamPageDeveloper
}

function formatTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function greeting(dev: TeamPageDeveloper): string {
  const first = dev.name.split(' ')[0]
  return `Hi! I'm ${first}. Tell me what you need built — scope, timeline, and budget if you have one.`
}

const ProfileMessageChat: React.FC<Props> = ({ developer }) => {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const isLoggedIn = Boolean(user?.email)

  const goToLogin = () => {
    const returnTo = `${globalThis.window.location.pathname}${globalThis.window.location.search}`
    router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`)
  }

  useEffect(() => {
    setMessages([
      {
        id: 'greeting',
        role: 'developer',
        text: greeting(developer),
        time: formatTime(),
      },
    ])
    setConversationId(null)
    setDraft('')
    setError('')
  }, [developer.slug])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const availabilityLabel =
    developer.availability === 'Available'
      ? 'Online · Typically replies within 24h'
      : developer.availability === 'Limited'
        ? 'Limited availability'
        : 'Busy · May take longer to reply'

  const sendMessage = async () => {
    if (!isLoggedIn || !user?.email) {
      goToLogin()
      return
    }

    const trimmed = draft.trim()
    if (!trimmed) return

    setError('')
    setSending(true)

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'client',
      text: trimmed,
      time: formatTime(),
    }
    setMessages((prev) => [...prev, userMsg])
    setDraft('')

    try {
      if (conversationId) {
        const result = await developerProfilesApi.reply(conversationId, trimmed)
        if (!result.success) throw new Error(result.error || 'Could not send message')
      } else {
        const result = await developerProfilesApi.startConversation(developer.slug, {
          email: user.email,
          name: user.name || undefined,
          message: trimmed,
          subject: `Project inquiry for ${developer.name}`,
        })
        if (!result.success) throw new Error(result.error || 'Could not send message')
        const convId = result.data?.conversation?.id
        if (convId) setConversationId(convId)
      }
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : String(err)
      if (/sign in|login|unauthorized|401/i.test(rawMessage)) {
        goToLogin()
      }
      const message = getUserFriendlyMessage(err, 'Failed to send message')
      setError(message)
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
      setDraft(trimmed)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    void sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <aside className="wa-chat" aria-label={`Chat with ${developer.name}`}>
      <header className="wa-chat__header">
        <div className="wa-chat__header-info">
          <img src={developer.image} alt="" className="wa-chat__header-avatar" />
          <div>
            <p className="wa-chat__header-name">{developer.name}</p>
            <p className="wa-chat__header-status">{availabilityLabel}</p>
          </div>
        </div>
      </header>

      <div ref={listRef} className="wa-chat__messages">
        <div className="wa-chat__date-pill">Today</div>
        {!authLoading && !isLoggedIn ? (
          <div className="wa-chat__login-gate">
            <p className="wa-chat__login-title">Sign in to message</p>
            <p className="wa-chat__login-text">
              Only logged-in Team4Stack clients can chat with developers.
            </p>
            <button type="button" className="wa-chat__login-btn" onClick={goToLogin}>
              Go to sign in
            </button>
          </div>
        ) : (
          <p className="wa-chat__hint">
            Describe your project — website, app, features, deadline, and budget if you have one.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`wa-chat__row wa-chat__row--${msg.role === 'client' ? 'out' : 'in'}`}
          >
            {msg.role === 'developer' ? (
              <img src={developer.image} alt="" className="wa-chat__msg-avatar" />
            ) : null}
            <div
              className={`wa-chat__bubble wa-chat__bubble--${msg.role === 'client' ? 'out' : 'in'}`}
            >
              <p>{msg.text}</p>
              <span className="wa-chat__time">{msg.time}</span>
            </div>
          </div>
        ))}
      </div>

      {error ? <p className="wa-chat__error">{error}</p> : null}

      {authLoading ? (
        <div className="wa-chat__composer wa-chat__composer--disabled">
          <p className="wa-chat__composer-status">Checking sign-in…</p>
        </div>
      ) : isLoggedIn ? (
        <form className="wa-chat__composer" onSubmit={handleSend}>
          <textarea
            ref={inputRef}
            className="wa-chat__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            rows={2}
            maxLength={3000}
            disabled={sending}
            aria-label="Message"
          />
          <button
            type="submit"
            className="wa-chat__send"
            disabled={sending || !draft.trim()}
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      ) : (
        <div className="wa-chat__composer wa-chat__composer--disabled">
          <button type="button" className="wa-chat__login-btn wa-chat__login-btn--full" onClick={goToLogin}>
            Sign in to send a message
          </button>
        </div>
      )}
    </aside>
  )
}

export default ProfileMessageChat
