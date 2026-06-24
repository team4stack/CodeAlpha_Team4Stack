import type { DeliverableStatus, MilestoneStatus, ProjectStatus, TaskStatus } from '../types'
import { deliverableStatusLabel, milestoneStatusLabel, projectStatusLabel, taskStatusLabel } from '../utils/labels'

type Props =
  | { kind: 'project'; status: ProjectStatus }
  | { kind: 'task'; status: TaskStatus }
  | { kind: 'milestone'; status: MilestoneStatus }
  | { kind: 'deliverable'; status: DeliverableStatus }

export default function StatusBadge(props: Props) {
  const label =
    props.kind === 'project'
      ? projectStatusLabel(props.status)
      : props.kind === 'task'
        ? taskStatusLabel(props.status)
        : props.kind === 'milestone'
          ? milestoneStatusLabel(props.status)
          : deliverableStatusLabel(props.status)
  return <span className={`ws-badge ws-badge--${props.kind} ws-badge--${props.status}`}>{label}</span>
}
