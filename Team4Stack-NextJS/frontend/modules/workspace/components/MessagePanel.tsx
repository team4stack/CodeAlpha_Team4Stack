'use client'

import { useState } from 'react'
import type { WorkspaceMessage } from '../types'

type Props = {
  messages: WorkspaceMessage[]
  onSend: (body: string, isInternal?: boolean) => Promise<void>
  allowInternal?: boolean
}

export default function MessagePanel({ messages, onSend, allowInternal }: Props) {
  const [body, setBody] = useState('')
  const [internal, setInternal] = useState(false)
  const [sending, setSending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text) return
    setSending(true)
    try {
      await onSend(text, allowInternal ? internal : false)
      setBody('')
      setInternal(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="ws-messages">
      <ul className="ws-messages__list">
        {messages.length === 0 ? (
          <li className="ws-empty">No messages yet. Start the conversation.</li>
        ) : (
          messages.map((m) => (
            <li key={m.id} className={`ws-message ws-message--${m.sender_kind}`}>
              <div className="ws-message__head">
                <span>{m.sender_email}</span>
                {m.is_internal ? <span className="ws-message__tag">Internal</span> : null}
              </div>
              <p>{m.body}</p>
            </li>
          ))
        )}
      </ul>
      <form className="ws-messages__form" onSubmit={submit}>
        <textarea
          className="ws-input"
          rows={3}
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {allowInternal ? (
          <label className="ws-check">
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
            Internal note (team only)
          </label>
        ) : null}
        <button type="submit" className="ws-btn ws-btn--primary" disabled={sending}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
