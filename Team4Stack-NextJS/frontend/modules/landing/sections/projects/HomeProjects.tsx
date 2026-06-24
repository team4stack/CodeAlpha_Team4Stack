'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  HOME_PROJECTS_LIMIT,
  useProjectsData,
} from '@/modules/projects/hooks/useProjectsData'
import HomeProjectsBento from '@/modules/projects/components/HomeProjectsBento'
import '@/modules/projects/Projects.css'

function openUrl(url: string) {
  if (!url || url === '#') return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const HomeProjects: React.FC = () => {
  const { projects, loading, error } = useProjectsData()
  const latestProjects = useMemo(
    () =>
      projects
        .filter((project) => Boolean(project.homeThumbnailUrl))
        .slice(0, HOME_PROJECTS_LIMIT),
    [projects]
  )

  const schema = useMemo(() => {
    if (latestProjects.length === 0) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Team4Stack Projects',
      description: 'Latest MERN stack portfolio projects by Team4Stack',
      itemListElement: latestProjects.map((project, index) => ({
        '@type': 'CreativeWork',
        position: index + 1,
        name: project.title,
        description: project.description,
        url: project.videoUrl,
      })),
    }
  }, [latestProjects])

  return (
    <section id="projects" className="home-projects py-8 sm:py-16 md:py-20 lg:py-24 relative">
      {schema ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ) : null}

      <div className="home-projects__backdrop" aria-hidden>
        <div className="home-projects__mesh home-projects__mesh--animated" />
        <div className="home-projects__aurora" />
        <div className="home-projects__beam home-projects__beam--a" />
        <div className="home-projects__beam home-projects__beam--b" />
        <div className="home-projects__glow home-projects__glow--left home-projects__glow--animated" />
        <div className="home-projects__glow home-projects__glow--right home-projects__glow--animated" />
        <div className="home-projects__glow home-projects__glow--center home-projects__glow--animated-slow" />
        <div className="home-projects__orb home-projects__orb--cyan home-projects__orb--float" />
        <div className="home-projects__orb home-projects__orb--violet home-projects__orb--float-delayed" />
        <div className="home-projects__frost" />
        <div className="home-projects__grid-bg home-projects__grid-bg--drift" />
      </div>

      <div className="container-custom px-4 relative z-10">
        <div className="home-projects__intro">
          <span className="home-projects__badge">Portfolio Showcase</span>
          <h2 className="home-projects__title">
            Our <span className="home-projects__title-accent">Projects</span> Build Real Impact
          </h2>
          <p className="home-projects__subtitle">
            Latest MERN builds in a curated showcase — one featured project plus hand-picked highlights from our
            portfolio.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {loading ? (
          <div className="home-bento home-bento--loading" aria-hidden>
            <div className="home-bento__skeleton home-bento__skeleton--featured" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="home-bento__skeleton" />
            ))}
            <div className="home-bento__skeleton home-bento__skeleton--cta" />
          </div>
        ) : latestProjects.length > 0 ? (
          <HomeProjectsBento
            projects={latestProjects}
            totalCount={projects.length}
            onOpenVideo={openUrl}
          />
        ) : (
          <div className="projects-empty max-w-2xl mx-auto">
            <h3 className="projects-empty__title">No projects available</h3>
            <p className="projects-empty__desc">New portfolio work will appear here soon.</p>
            <div className="home-projects__actions home-projects__actions--center">
              <Link href="/projects" className="projects-page__btn projects-page__btn--outline">
                Visit Projects Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default HomeProjects
