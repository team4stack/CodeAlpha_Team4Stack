import type { WorkspaceActivity } from '../types'
import { formatShortDate } from '../utils/labels'

type Props = { items: WorkspaceActivity[] }

export default function ActivityFeed({ items }: Props) {
  if (items.length === 0) return <p className="ws-empty">No activity yet.</p>

  return (
    <ul className="ws-activity">
      {items.map((item) => (
        <li key={item.id}>
          <span className="ws-activity__action">{item.action.replace(/_/g, ' ')}</span>
          <span className="ws-activity__meta">
            {item.actor_email} · {formatShortDate(item.created_at)}
          </span>
        </li>
      ))}
    </ul>
  )
}
