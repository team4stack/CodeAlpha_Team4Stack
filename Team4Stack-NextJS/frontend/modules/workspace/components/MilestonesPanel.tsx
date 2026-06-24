'use client'

import React from 'react'
import type { MilestoneStatus, WorkspaceMilestone } from '../types'
import { formatShortDate } from '../utils/labels'
import StatusBadge from './StatusBadge'

type Props = {
  milestones: WorkspaceMilestone[]
  canManage?: boolean
  onStatusChange?: (id: number, status: MilestoneStatus) => void
  onClientRespond?: (id: number, approved: boolean) => void
}

const MilestonesPanel: React.FC<Props> = ({
  milestones,
  canManage,
  onStatusChange,
  onClientRespond,
}) => {
  if (milestones.length === 0) {
    return <p className="ws-empty">No milestones yet.</p>
  }

  return (
    <ul className="ws-milestone-list">
      {milestones.map((m) => (
        <li key={m.id} className="ws-milestone-item">
          <div className="ws-milestone-item__head">
            <strong>{m.title}</strong>
            <StatusBadge kind="milestone" status={m.status} />
          </div>
          {m.description ? <p className="ws-milestone-item__desc">{m.description}</p> : null}
          {m.due_date ? (
            <p className="ws-milestone-item__meta">Due {formatShortDate(m.due_date)}</p>
          ) : null}
          {canManage && onStatusChange ? (
            <select
              className="ws-select"
              value={m.status}
              onChange={(e) => onStatusChange(m.id, e.target.value as MilestoneStatus)}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="client_review">Client review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          ) : null}
          {!canManage && m.status === 'client_review' && onClientRespond ? (
            <div className="ws-milestone-item__actions">
              <button type="button" className="ws-btn ws-btn--primary" onClick={() => onClientRespond(m.id, true)}>
                Approve
              </button>
              <button type="button" className="ws-btn ws-btn--ghost" onClick={() => onClientRespond(m.id, false)}>
                Request changes
              </button>
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export default MilestonesPanel
