'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import type { WorkspaceNotification } from '../types'
import '../workspace.css'

const WorkspaceNotificationsBell: React.FC = () => {
  const { user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<WorkspaceNotification[]>([])

  const load = useCallback(async () => {
    if (!user) return
    const { workspaceApi } = await import('@/lib/api')
    const res = await workspaceApi.listNotifications()
    if (res.success && Array.isArray(res.data)) setItems(res.data)
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  if (!user) return null

  const unread = items.filter((n) => !n.read_at).length

  const openItem = async (n: WorkspaceNotification) => {
    const { workspaceApi } = await import('@/lib/api')
    await workspaceApi.markNotificationRead(n.id)
    setOpen(false)
    if (n.link_path) router.push(n.link_path)
    void load()
  }

  return (
    <div className="ws-notif">
      <button
        type="button"
        className="ws-notif__btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Workspace notifications"
      >
        🔔
        {unread > 0 ? <span className="ws-notif__badge">{unread}</span> : null}
      </button>
      {open ? (
        <div className="ws-notif__panel">
          <p className="ws-notif__title">Updates</p>
          {items.length === 0 ? (
            <p className="ws-empty">No notifications yet.</p>
          ) : (
            <ul className="ws-notif__list">
              {items.map((n) => (
                <li key={n.id}>
                  <button type="button" className={`ws-notif__item${n.read_at ? '' : ' ws-notif__item--unread'}`} onClick={() => openItem(n)}>
                    <strong>{n.title}</strong>
                    {n.body ? <span>{n.body}</span> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link href="/workspace/my-tasks" className="ws-notif__link" onClick={() => setOpen(false)}>
            My tasks →
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export default WorkspaceNotificationsBell
