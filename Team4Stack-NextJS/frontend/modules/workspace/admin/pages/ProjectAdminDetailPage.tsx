'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import ActivityFeed from '../../components/ActivityFeed'
import DeliverablesPanel from '../../components/DeliverablesPanel'
import MessagePanel from '../../components/MessagePanel'
import MilestonesPanel from '../../components/MilestonesPanel'
import StatusBadge from '../../components/StatusBadge'
import TaskList from '../../components/TaskList'
import DeliverableCreateForm from '../components/DeliverableCreateForm'
import MilestoneCreateForm from '../components/MilestoneCreateForm'
import ProjectEditForm from '../components/ProjectEditForm'
import StaffAssignForm from '../components/StaffAssignForm'
import TaskCreateForm from '../components/TaskCreateForm'
import { useProjectWorkspace } from '../../hooks/useProjectWorkspace'
import type { MilestoneStatus, TaskStatus } from '../../types'
import { formatShortDate } from '../../utils/labels'
import '../../workspace.css'

export default function ProjectAdminDetailPage() {
  const params = useParams()
  const projectId = Number(params?.id)
  const { project, tasks, messages, activity, milestones, deliverables, loading, error, reload } =
    useProjectWorkspace(projectId, 'default')

  const api = async () => (await import('@/lib/api')).workspaceApi

  const addStaff = async (payload: Record<string, unknown>) => {
    const res = await (await api()).addStaff(projectId, payload)
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const addTask = async (payload: Record<string, unknown>) => {
    const res = await (await api()).createTask(projectId, payload)
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const sendMessage = async (body: string, isInternal?: boolean) => {
    const res = await (await api()).sendMessage(projectId, { body, is_internal: isInternal })
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const onTaskStatus = async (taskId: number, status: TaskStatus) => {
    const res = await (await api()).updateTask(taskId, { status })
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const removeStaff = async (staffId: number) => {
    const res = await (await api()).removeStaff(projectId, staffId)
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const saveProject = async (payload: Record<string, unknown>) => {
    const res = await (await api()).updateProject(projectId, payload)
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const addMilestone = async (payload: Record<string, unknown>) => {
    const res = await (await api()).createMilestone(projectId, payload)
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const onMilestoneStatus = async (id: number, status: MilestoneStatus) => {
    const res = await (await api()).updateMilestone(id, { status })
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const addDeliverable = async (payload: Record<string, unknown>) => {
    const res = await (await api()).createDeliverable(projectId, payload)
    if (res.error) throw new Error(res.error)
    await reload()
  }

  const toggleDeliverable = async (id: number, visible: boolean) => {
    const res = await (await api()).updateDeliverable(id, { visible_to_client: visible, status: visible ? 'submitted' : 'draft' })
    if (res.error) throw new Error(res.error)
    await reload()
  }

  return (
    <div className="p-4 md:p-6 text-white">
      <Link href="/adminteamt4s/projects" className="ws-btn ws-btn--ghost mb-4">
        ← Projects
      </Link>

      {loading ? <p className="ws-empty">Loading…</p> : null}
      {error ? <p className="ws-error">{error}</p> : null}

      {project ? (
        <div className="grid gap-4">
          <div className="ws-card">
            <div className="ws-card__head">
              <h1 className="text-xl font-bold">{project.title}</h1>
              <StatusBadge kind="project" status={project.status} />
            </div>
            {project.description ? <p className="ws-card__desc">{project.description}</p> : null}
            <p className="ws-card__meta">
              {project.client_name} · {project.client_email} · Due {formatShortDate(project.deadline)}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="ws-card">
              <ProjectEditForm
                initial={{
                  status: project.status,
                  deadline: project.deadline,
                  description: project.description,
                }}
                onSubmit={saveProject}
              />
            </div>
            <div className="ws-card">
              <StaffAssignForm onSubmit={addStaff} />
              <ul className="ws-staff-list mt-4">
                {project.staff?.map((s) => (
                  <li key={s.id}>
                    <span>
                      {s.staff_name || s.staff_email} ({s.role})
                    </span>
                    <button type="button" className="ws-btn ws-btn--ghost" onClick={() => removeStaff(s.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="ws-card">
              <MilestoneCreateForm onSubmit={addMilestone} />
            </div>
            <div className="ws-card">
              <DeliverableCreateForm onSubmit={addDeliverable} />
            </div>
          </div>

          <div className="ws-card">
            <TaskCreateForm onSubmit={addTask} />
          </div>

          <div className="ws-card">
            <h2 className="ws-section__title">Milestones</h2>
            <MilestonesPanel milestones={milestones} canManage onStatusChange={onMilestoneStatus} />
          </div>

          <div className="ws-card">
            <h2 className="ws-section__title">Deliverables</h2>
            <DeliverablesPanel deliverables={deliverables} canManage onToggleVisible={toggleDeliverable} />
          </div>

          <div className="ws-card">
            <h2 className="ws-section__title">Tasks</h2>
            <TaskList tasks={tasks} canManage onStatusChange={onTaskStatus} />
          </div>

          <div className="ws-card">
            <h2 className="ws-section__title">Messages</h2>
            <MessagePanel messages={messages} onSend={sendMessage} allowInternal />
          </div>

          <div className="ws-card">
            <h2 className="ws-section__title">Activity</h2>
            <ActivityFeed items={activity} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
