import type { DeliverableStatus, MilestoneStatus, ProjectStatus, TaskStatus } from '../types'

const PROJECT_LABELS: Record<ProjectStatus, string> = {
  scoped: 'Scoped',
  in_progress: 'In Progress',
  client_review: 'Client Review',
  completed: 'Completed',
  archived: 'Archived',
}

const TASK_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  in_review: 'In Review',
  done: 'Done',
}

export function projectStatusLabel(status: ProjectStatus) {
  return PROJECT_LABELS[status] || status
}

export function taskStatusLabel(status: TaskStatus) {
  return TASK_LABELS[status] || status
}

const MILESTONE_LABELS: Record<MilestoneStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  client_review: 'Client Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

const DELIVERABLE_LABELS: Record<DeliverableStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  revision_requested: 'Revision',
}

export function milestoneStatusLabel(status: MilestoneStatus) {
  return MILESTONE_LABELS[status] || status
}

export function deliverableStatusLabel(status: DeliverableStatus) {
  return DELIVERABLE_LABELS[status] || status
}

export function formatShortDate(value?: string | null) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
