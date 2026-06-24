import Link from 'next/link'
import type { WorkspaceProject } from '../types'
import StatusBadge from './StatusBadge'
import { formatShortDate } from '../utils/labels'

type Props = { project: WorkspaceProject; href: string }

export default function ProjectCard({ project, href }: Props) {
  return (
    <Link href={href} className="ws-card ws-card--link">
      <div className="ws-card__head">
        <h3 className="ws-card__title">{project.title}</h3>
        <StatusBadge kind="project" status={project.status} />
      </div>
      {project.description ? <p className="ws-card__desc">{project.description}</p> : null}
      <p className="ws-card__meta">Deadline: {formatShortDate(project.deadline)}</p>
    </Link>
  )
}
