'use client'

import Link from 'next/link'
import ProjectCard from '../components/ProjectCard'
import WorkspaceRouteGuard from '../components/WorkspaceRouteGuard'
import WorkspaceNotificationsBell from '../components/WorkspaceNotificationsBell'
import { useMyProjects } from '../hooks/useMyProjects'
import '../workspace.css'

export default function MyProjectsPage() {
  const { projects, loading, error } = useMyProjects()

  return (
    <WorkspaceRouteGuard>
      <div className="ws-page">
        <div className="ws-page__inner">
          <div className="ws-page__toolbar">
            <span />
            <WorkspaceNotificationsBell />
          </div>
          <h1 className="ws-page__title">My Projects</h1>
          <p className="ws-page__sub">
            Track your Team4Stack projects, milestones, deliverables, and messages.
          </p>
          <Link href="/workspace/my-tasks" className="ws-btn ws-btn--ghost ws-page__sub-link">
            View my assigned tasks →
          </Link>

          {loading ? <p className="ws-empty">Loading projects…</p> : null}
          {error ? <p className="ws-error">{error}</p> : null}

          {!loading && !error && projects.length === 0 ? (
            <p className="ws-empty">No projects assigned yet. Team4Stack will add your workspace soon.</p>
          ) : null}

          <div className="ws-grid">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} href={`/workspace/${p.id}`} />
            ))}
          </div>
        </div>
      </div>
    </WorkspaceRouteGuard>
  )
}
