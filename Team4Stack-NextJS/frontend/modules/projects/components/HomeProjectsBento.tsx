'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { ProjectData } from '@/lib/utils/youtube'

type HomeProjectsBentoProps = {
  projects: ProjectData[]
  totalCount: number
  onOpenVideo: (url: string) => void
}

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
}

const cellVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: 'easeOut' as const },
  },
}

function PlayIcon({ large = false }: { large?: boolean }) {
  return (
    <span className={`home-bento__play-btn${large ? ' home-bento__play-btn--lg' : ''}`} aria-hidden>
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  )
}

function ProjectVisualCard({
  project,
  onOpenVideo,
  featured = false,
}: {
  project: ProjectData
  onOpenVideo: (url: string) => void
  featured?: boolean
}) {
  const imageSrc = project.homeThumbnailUrl

  return (
    <article className={`home-bento__visual${featured ? ' home-bento__visual--featured' : ''}`}>
      <button
        type="button"
        className="home-bento__visual-hit"
        onClick={() => onOpenVideo(project.videoUrl)}
        aria-label={`Watch demo for ${project.title}`}
      >
        <div className="home-bento__visual-media">
          {imageSrc ? (
            <img
              className="home-bento__visual-photo"
              src={imageSrc}
              alt=""
              loading={featured ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : (
            <div className="home-bento__media-fallback" aria-hidden />
          )}
        </div>

        {imageSrc ? (
          <div className="home-bento__visual-blur-zone" aria-hidden>
            <img className="home-bento__visual-photo-blur" src={imageSrc} alt="" loading="lazy" decoding="async" />
          </div>
        ) : null}

        <div className="home-bento__visual-shade" aria-hidden />
        <PlayIcon large={featured} />

        <div className="home-bento__visual-overlay">
          {featured ? <span className="home-bento__visual-badge">Latest Build</span> : null}
          <h3 className="home-bento__visual-title">{project.title}</h3>
        </div>
      </button>
    </article>
  )
}

function BentoCtaTile({ totalCount }: { totalCount: number }) {
  return (
    <Link href="/projects" className="home-bento__cta">
      <span className="home-bento__cta-glow" aria-hidden />
      <span className="home-bento__cta-label">Full Portfolio</span>
      <strong className="home-bento__cta-count">{totalCount}+</strong>
      <span className="home-bento__cta-text">projects delivered with MERN stack</span>
      <span className="home-bento__cta-link">
        Explore all work
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path
            fillRule="evenodd"
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </Link>
  )
}

const HomeProjectsBento: React.FC<HomeProjectsBentoProps> = ({
  projects,
  totalCount,
  onOpenVideo,
}) => {
  if (projects.length === 0) return null

  const [featured, ...tiles] = projects

  return (
    <motion.div
      className="home-bento"
      variants={gridVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
    >
      <motion.div className="home-bento__cell home-bento__cell--featured" variants={cellVariants}>
        <ProjectVisualCard project={featured} onOpenVideo={onOpenVideo} featured />
      </motion.div>

      {tiles.map((project, index) => (
        <motion.div
          key={project.id}
          className={`home-bento__cell home-bento__cell--tile home-bento__cell--tile-${index + 1}`}
          variants={cellVariants}
        >
          <ProjectVisualCard project={project} onOpenVideo={onOpenVideo} />
        </motion.div>
      ))}

      <motion.div className="home-bento__cell home-bento__cell--cta" variants={cellVariants}>
        <BentoCtaTile totalCount={totalCount} />
      </motion.div>
    </motion.div>
  )
}

export default HomeProjectsBento
