'use client'

import React from 'react'
import type { WorkspaceDeliverable } from '../types'
import StatusBadge from './StatusBadge'

type Props = {
  deliverables: WorkspaceDeliverable[]
  canManage?: boolean
  onToggleVisible?: (id: number, visible: boolean) => void
}

const DeliverablesPanel: React.FC<Props> = ({ deliverables, canManage, onToggleVisible }) => {
  if (deliverables.length === 0) {
    return <p className="ws-empty">No deliverables shared yet.</p>
  }

  return (
    <ul className="ws-deliverable-list">
      {deliverables.map((d) => (
        <li key={d.id} className="ws-deliverable-item">
          <div className="ws-deliverable-item__head">
            <strong>{d.title}</strong>
            <StatusBadge kind="deliverable" status={d.status} />
          </div>
          {d.description ? <p>{d.description}</p> : null}
          <div className="ws-deliverable-item__links">
            {d.staging_url ? (
              <a href={d.staging_url} target="_blank" rel="noopener noreferrer">
                Preview
              </a>
            ) : null}
            {d.file_url ? (
              <a href={d.file_url} target="_blank" rel="noopener noreferrer">
                Download
              </a>
            ) : null}
          </div>
          {canManage && onToggleVisible ? (
            <label className="ws-checkbox">
              <input
                type="checkbox"
                checked={d.visible_to_client}
                onChange={(e) => onToggleVisible(d.id, e.target.checked)}
              />
              Visible to client
            </label>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export default DeliverablesPanel
