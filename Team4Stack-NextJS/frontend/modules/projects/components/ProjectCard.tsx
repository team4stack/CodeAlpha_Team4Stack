'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { ProjectData } from '@/lib/utils/youtube'

type ProjectCardProps = {
  project: ProjectData
  onOpenVideo: (url: string) => void
  onOpenCode: (url: string) => void
  compact?: boolean
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onOpenVideo,
  onOpenCode,
  compact = false,
}) => {
  const imageSrc = project.thumbnailUrl
  const [photoReady, setPhotoReady] = useState(false)
  const photoRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setPhotoReady(false)
    const img = photoRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setPhotoReady(true)
    }
  }, [imageSrc])

  return (
    <article className={`project-card${compact ? ' project-card--compact' : ''}`}>
      <div className="project-card__glow" aria-hidden />

      <div className="project-card__visual">
        <button
          type="button"
          className="project-card__hit"
          onClick={() => onOpenVideo(project.videoUrl)}
          aria-label={`Watch demo for ${project.title}`}
        >
          <div className="project-card__media">
            {imageSrc ? (
              <img
                ref={photoRef}
                className={`project-card__photo${photoReady ? ' project-card__photo--ready' : ''}`}
                src={imageSrc}
                alt=""
                loading="lazy"
                decoding="async"
                onLoad={() => setPhotoReady(true)}
                onError={() => setPhotoReady(true)}
              />
            ) : (
              <div className="project-card__media-fallback" aria-hidden />
            )}
          </div>

          {imageSrc ? (
            <>
              <div className="project-card__blur-zone" aria-hidden>
                <img
                  className={`project-card__photo-blur${photoReady ? ' project-card__photo-blur--ready' : ''}`}
                  src={imageSrc}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setPhotoReady(true)}
                  onError={() => setPhotoReady(true)}
                />
              </div>
              <div className="project-card__shade" aria-hidden />
            </>
          ) : null}

          <span className="project-card__play" aria-hidden>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </span>

          <span className="project-card__media-tag">MERN Project</span>

          <div className="project-card__overlay">
            <h3 className="project-card__title">{project.title}</h3>
          </div>
        </button>
      </div>

      <div className="project-card__body">
        <div className="project-card__content">
          <p className="project-card__desc">{project.description}</p>
        </div>

        <div className="project-card__footer">
          {imageSrc ? (
            <>
              <div className="project-card__footer-blur-zone" aria-hidden>
                <img
                  className={`project-card__footer-photo-blur${photoReady ? ' project-card__footer-photo-blur--ready' : ''}`}
                  src={imageSrc}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="project-card__footer-shade" aria-hidden />
            </>
          ) : null}

          <div className="project-card__footer-actions">
            <button
              type="button"
              className="project-card__btn project-card__btn--demo"
              onClick={() => onOpenVideo(project.videoUrl)}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Watch Demo
            </button>
            <button
              type="button"
              className="project-card__btn project-card__btn--code"
              onClick={() => onOpenCode(project.githubUrl)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.55c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              View Code
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
