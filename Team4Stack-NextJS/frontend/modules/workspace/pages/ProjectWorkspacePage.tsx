'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import ActivityFeed from '../components/ActivityFeed'
import DeliverablesPanel from '../components/DeliverablesPanel'
import MessagePanel from '../components/MessagePanel'
import MilestonesPanel from '../components/MilestonesPanel'
import StatusBadge from '../components/StatusBadge'
import TaskList from '../components/TaskList'
import WorkspaceRouteGuard from '../components/WorkspaceRouteGuard'
import WorkspaceNotificationsBell from '../components/WorkspaceNotificationsBell'
import { useProjectWorkspace } from '../hooks/useProjectWorkspace'
import type { MilestoneStatus, TaskStatus } from '../types'
import { formatShortDate } from '../utils/labels'
import '../workspace.css'

export default function ProjectWorkspacePage() {
  const params = useParams()
  const projectId = Number(params?.id)
  const { project, tasks, messages, activity, milestones, deliverables, loading, error, reload } =
    useProjectWorkspace(projectId)

  const onSendMessage = async (body: string) => {
    const { workspaceApi } = await import('@/lib/api')
    const res = await workspaceApi.sendMessage(projectId, { body }, 'user-only')
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const onTaskStatus = async (taskId: number, status: TaskStatus) => {
    const { workspaceApi } = await import('@/lib/api')
    const res = await workspaceApi.updateTask(taskId, { status }, 'user-only')
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const onMilestoneRespond = async (id: number, approved: boolean) => {
    const { workspaceApi } = await import('@/lib/api')
    const res = await workspaceApi.respondMilestone(id, approved)
    if (res.error) throw new Error(res.error)
    await reload()
  }

  return (
    <WorkspaceRouteGuard>
      <div className="ws-page">
        <div className="ws-page__inner">
          <div className="ws-page__toolbar">
            <Link href="/workspace" className="ws-btn ws-btn--ghost">
              ← Back
            </Link>
            <WorkspaceNotificationsBell />
          </div>

          {loading ? <p className="ws-empty">Loading…</p> : null}
          {error ? <p className="ws-error">{error}</p> : null}

          {project ? (
            <>
              <div className="ws-card">
                <div className="ws-card__head">
                  <h1 className="ws-page__title">{project.title}</h1>
                  <StatusBadge kind="project" status={project.status} />
                </div>
                {project.description ? <p className="ws-card__desc">{project.description}</p> : null}
                <p className="ws-card__meta">
                  Client: {project.client_name || project.client_email || '—'} · Deadline{' '}
                  {formatShortDate(project.deadline)}
                </p>
              </div>

              <section className="ws-section ws-card">
                <h2 className="ws-section__title">Milestones</h2>
                <MilestonesPanel milestones={milestones} onClientRespond={onMilestoneRespond} />
              </section>

              <section className="ws-section ws-card">
                <h2 className="ws-section__title">Deliverables</h2>
                <DeliverablesPanel deliverables={deliverables} />
              </section>

              <section className="ws-section ws-card">
                <h2 className="ws-section__title">Tasks</h2>
                <TaskList tasks={tasks} onStatusChange={onTaskStatus} />
              </section>

              <section className="ws-section ws-card">
                <h2 className="ws-section__title">Messages</h2>
                <MessagePanel messages={messages} onSend={onSendMessage} />
              </section>

              <section className="ws-section ws-card">
                <h2 className="ws-section__title">Activity</h2>
                <ActivityFeed items={activity} />
              </section>
            </>
          ) : null}
        </div>
      </div>
    </WorkspaceRouteGuard>
  )
}
