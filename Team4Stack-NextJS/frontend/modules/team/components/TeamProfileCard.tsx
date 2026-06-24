'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { TeamMember } from '../hooks/useTeamData'
import TeamMemberName from './TeamMemberName'
import './TeamProfileCard.css'

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=800&auto=format&fit=crop',
]

function getPhotoAlt(member: TeamMember): string {
  const role = member.role?.trim()
  return role
    ? `${member.name}, ${role} — Team4Stack team member`
    : `${member.name} — Team4Stack team member`
}

type Props = {
  member: TeamMember
  index: number
  onOpen: () => void
}

const TeamProfileCard: React.FC<Props> = ({ member, index, onOpen }) => {
  const photo =
    member.image ||
    member.bannerImage ||
    DEFAULT_PHOTOS[index % DEFAULT_PHOTOS.length]

  const photoAlt = useMemo(() => getPhotoAlt(member), [member])
  const [photoReady, setPhotoReady] = useState(false)
  const photoRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setPhotoReady(false)
    const img = photoRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setPhotoReady(true)
    }
  }, [photo])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen()
    }
  }

  return (
    <article
      className="team-pro-card team-pro-card--clickable"
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${member.name} profile`}
      itemScope
      itemType="https://schema.org/Person"
    >
      <div className="team-pro-card__media">
        <img
          ref={photoRef}
          src={photo}
          alt={photoAlt}
          title={photoAlt}
          className={`team-pro-card__photo${photoReady ? ' team-pro-card__photo--ready' : ''}`}
          loading={index < 2 ? 'eager' : 'lazy'}
          decoding="async"
          width={600}
          height={800}
          onLoad={() => setPhotoReady(true)}
          onError={() => setPhotoReady(true)}
        />
      </div>

      <div className="team-pro-card__blur-zone" aria-hidden>
        <img
          src={photo}
          alt=""
          className={`team-pro-card__photo-blur${photoReady ? ' team-pro-card__photo-blur--ready' : ''}`}
          loading="lazy"
          decoding="async"
          width={600}
          height={800}
          onLoad={() => setPhotoReady(true)}
          onError={() => setPhotoReady(true)}
        />
      </div>

      <div className="team-pro-card__shade" aria-hidden />

      <div className="team-pro-card__content">
        <h3 className="team-pro-card__name" itemProp="name">
          <TeamMemberName name={member.name} variant="card" />
        </h3>
        {photoReady ? (
          member.role ? (
            <p className="team-pro-card__role" itemProp="jobTitle">
              {member.role}
            </p>
          ) : null
        ) : (
          <p className="team-pro-card__role team-pro-card__role--loading">Loading…</p>
        )}
      </div>
    </article>
  )
}

export default TeamProfileCard
