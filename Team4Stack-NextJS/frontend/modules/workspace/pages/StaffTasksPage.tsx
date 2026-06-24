'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import WorkspaceRouteGuard from '../components/WorkspaceRouteGuard'
import WorkspaceNotificationsBell from '../components/WorkspaceNotificationsBell'
import StatusBadge from '../components/StatusBadge'
import type { WorkspaceTaskWithProject, TaskStatus } from '../types'
import '../workspace.css'

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState<WorkspaceTaskWithProject[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { workspaceApi } = await import('@/lib/api')
    const res = await workspaceApi.listMyTasks()
    setTasks(Array.isArray(res.data) ? res.data : [])
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const updateStatus = async (taskId: number, status: TaskStatus) => {
    const { workspaceApi } = await import('@/lib/api')
    const res = await workspaceApi.updateTask(taskId, { status }, 'user-only')
    if (!res.error) await load()
  }

  return (
    <WorkspaceRouteGuard>
      <div className="ws-page">
        <div className="ws-page__inner">
          <div className="ws-page__toolbar">
            <Link href="/workspace" className="ws-btn ws-btn--ghost">
              ← Projects
            </Link>
            <WorkspaceNotificationsBell />
          </div>
          <h1 className="ws-page__title">My tasks</h1>
          <p className="ws-page__sub">Tasks assigned to you across all client projects.</p>

          {loading ? <p className="ws-empty">Loading…</p> : null}
          {!loading && tasks.length === 0 ? <p className="ws-empty">No assigned tasks.</p> : null}

          <ul className="ws-grid">
            {tasks.map((t) => (
              <li key={t.id} className="ws-card">
                <div className="ws-card__head">
                  <h2 className="ws-card__title">{t.title}</h2>
                  <StatusBadge kind="task" status={t.status} />
                </div>
                <p className="ws-card__meta">{t.project_title || `Project #${t.project_id}`}</p>
                <Link href={`/workspace/${t.project_id}`} className="ws-btn ws-btn--ghost">
                  Open project
                </Link>
                <select
                  className="ws-select mt-2"
                  value={t.status}
                  onChange={(e) => updateStatus(t.id, e.target.value as TaskStatus)}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="blocked">Blocked</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                </select>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WorkspaceRouteGuard>
  )
}
