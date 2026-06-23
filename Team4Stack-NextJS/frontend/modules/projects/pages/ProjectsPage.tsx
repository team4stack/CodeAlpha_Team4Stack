'use client'

import React, { useMemo } from 'react'
import { useProjectsData } from '@/modules/projects/hooks/useProjectsData'
import ProjectGrid from '@/modules/projects/components/ProjectGrid'
import ProjectsCta from '@/modules/projects/components/ProjectsCta'
import '@/modules/projects/Projects.css'

const SKILL_CHIPS = [
  'MERN Stack',
  'Responsive UI',
  'Scalable Architecture',
  'Clean Code',
  'API Integrations',
  'SEO Friendly',
]

function openUrl(url: string) {
  if (!url || url === '#') return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const ProjectsPage: React.FC = () => {
  const { projects, loading, error } = useProjectsData()

  const schema = useMemo(() => {
    if (projects.length === 0) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Team4Stack Projects Portfolio',
      description: 'Innovative MERN stack projects showcasing technical expertise',
      itemListElement: projects.map((project, index) => ({
        '@type': 'CreativeWork',
        position: index + 1,
        name: project.title,
        description: project.description,
        url: project.videoUrl,
      })),
    }
  }, [projects])

  return (
    <div className="projects-page min-h-screen pt-24 md:pt-28 pb-16 md:pb-20">
      {schema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}

      <div className="projects-page__backdrop" aria-hidden>
        <div className="projects-page__mesh" />
        <div className="projects-page__glow projects-page__glow--left" />
        <div className="projects-page__glow projects-page__glow--right" />
        <div className="projects-page__grid-bg" />
      </div>

      <div className="container-custom px-4 relative z-10">
        <header className="projects-page__hero">
          <span className="projects-page__badge">Portfolio Showcase</span>
          <h1 className="projects-page__title">
            Our <span className="projects-page__title-accent">Projects</span> Build Real Impact
          </h1>
          <p className="projects-page__subtitle">
            Explore production-ready MERN stack projects designed for startups, e-commerce brands, and growing
            businesses. Each build combines clean UI, fast performance, and practical features that solve real
            problems.
          </p>
          <div className="projects-page__chips">
            {SKILL_CHIPS.map((item) => (
              <span key={item} className="projects-page__chip">
                {item}
              </span>
            ))}
          </div>
        </header>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {loading ? (
          <div className="projects-skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="projects-skeleton-card" aria-hidden />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <ProjectGrid projects={projects} onOpenVideo={openUrl} onOpenCode={openUrl} />
        ) : (
          <div className="projects-empty max-w-2xl mx-auto">
            <h2 className="projects-empty__title">No projects available</h2>
            <p className="projects-empty__desc">Please check back soon — new projects will appear here.</p>
          </div>
        )}

        <ProjectsCta />
      </div>
    </div>
  )
}

export default ProjectsPage
