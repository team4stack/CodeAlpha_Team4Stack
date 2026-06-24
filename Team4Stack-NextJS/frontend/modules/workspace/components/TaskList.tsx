'use client'

import type { WorkspaceTask, TaskStatus } from '../types'
import StatusBadge from './StatusBadge'
import { formatShortDate } from '../utils/labels'

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'in_review', 'done']

type Props = {
  tasks: WorkspaceTask[]
  canManage?: boolean
  onStatusChange?: (taskId: number, status: TaskStatus) => void
}

export default function TaskList({ tasks, canManage, onStatusChange }: Props) {
  if (tasks.length === 0) {
    return <p className="ws-empty">No tasks yet.</p>
  }

  return (
    <ul className="ws-task-list">
      {tasks.map((task) => (
        <li key={task.id} className="ws-task-item">
          <div className="ws-task-item__main">
            <strong>{task.title}</strong>
            {task.description ? <p>{task.description}</p> : null}
            <span className="ws-task-item__meta">
              {task.assignee_email ? `Assigned: ${task.assignee_email}` : 'Unassigned'}
              {' · '}Due {formatShortDate(task.due_date)}
            </span>
          </div>
          {canManage && onStatusChange ? (
            <select
              className="ws-input ws-input--compact"
              value={task.status}
              onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          ) : (
            <StatusBadge kind="task" status={task.status} />
          )}
        </li>
      ))}
    </ul>
  )
}
