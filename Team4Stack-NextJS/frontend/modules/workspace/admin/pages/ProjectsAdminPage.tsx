'use client'

import Link from 'next/link'
import ProjectCard from '../../components/ProjectCard'
import ProjectCreateForm from '../components/ProjectCreateForm'
import { useMyProjects } from '../../hooks/useMyProjects'
import '../../workspace.css'

export default function ProjectsAdminPage() {
  const { projects, loading, error, reload } = useMyProjects('default')

  const createProject = async (payload: Record<string, unknown>) => {
    const { workspaceApi } = await import('@/lib/api')
    const res = await workspaceApi.createProject(payload)
    if (res.error) throw new Error(res.error)
    await reload()
  }

  return (
    <div className="p-4 md:p-6 text-white">
      <h1 className="text-2xl font-bold mb-1">Client Projects</h1>
      <p className="text-white/60 text-sm mb-6">
        Create projects, assign team, and let clients track work in their workspace.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <ProjectCreateForm onSubmit={createProject} />
        <div>
          <h2 className="text-lg font-semibold mb-3">All projects</h2>
          {loading ? <p className="ws-empty">Loading…</p> : null}
          {error ? <p className="ws-error">{error}</p> : null}
          <div className="ws-grid">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} href={`/adminteamt4s/projects/${p.id}`} />
            ))}
          </div>
        </div>
      </div>

      <p className="text-white/50 text-xs mt-6">
        Clients use the same login and open <Link href="/workspace" className="text-cyan-300 underline">/workspace</Link>.
      </p>
    </div>
  )
}
