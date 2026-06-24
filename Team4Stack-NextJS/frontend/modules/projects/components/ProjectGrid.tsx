'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { ProjectData } from '@/lib/utils/youtube'
import ProjectCard from './ProjectCard'

export const PROJECTS_PAGE_SIZE = 20

type ProjectGridProps = {
  projects: ProjectData[]
  onOpenVideo: (url: string) => void
  onOpenCode: (url: string) => void
  perPage?: number
}

function getVisiblePages(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let p = start; p <= end; p += 1) {
    pages.push(p)
  }

  if (current < total - 2) pages.push('ellipsis')

  pages.push(total)
  return pages
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  onOpenVideo,
  onOpenCode,
  perPage = PROJECTS_PAGE_SIZE,
}) => {
  const [page, setPage] = useState(1)
  const gridRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.max(1, Math.ceil(projects.length / perPage))
  const showPagination = projects.length > perPage

  const slice = useMemo(
    () => projects.slice((page - 1) * perPage, page * perPage),
    [projects, page, perPage]
  )

  const rangeStart = projects.length === 0 ? 0 : (page - 1) * perPage + 1
  const rangeEnd = Math.min(page * perPage, projects.length)
  const visiblePages = useMemo(() => getVisiblePages(page, totalPages), [page, totalPages])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    if (!gridRef.current || page === 1) return
    gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  if (projects.length === 0) return null

  return (
    <div className="projects-grid-wrap" ref={gridRef}>
      {showPagination ? (
        <p className="projects-grid__meta">
          Showing <strong>{rangeStart}–{rangeEnd}</strong> of <strong>{projects.length}</strong> projects
          <span className="projects-grid__meta-note"> · Latest first</span>
        </p>
      ) : null}

      <div className="projects-grid">
        {slice.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpenVideo={onOpenVideo}
            onOpenCode={onOpenCode}
          />
        ))}
      </div>

      {showPagination ? (
        <nav className="projects-grid__pagination" aria-label="Projects pagination">
          <button
            type="button"
            className="projects-grid__page-btn projects-grid__page-btn--nav"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Previous page"
          >
            ← Prev
          </button>

          {visiblePages.map((p, index) =>
            p === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="projects-grid__ellipsis" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={`projects-grid__page-btn${p === page ? ' projects-grid__page-btn--active' : ''}`}
                onClick={() => setPage(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            className="projects-grid__page-btn projects-grid__page-btn--nav"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="Next page"
          >
            Next →
          </button>
        </nav>
      ) : null}
    </div>
  )
}

export default ProjectGrid
