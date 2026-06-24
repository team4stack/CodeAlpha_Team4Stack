'use client'

import React from 'react'
import Link from 'next/link'
import type { TeamPageDeveloper } from '../data/teamPageDevelopers'

type Props = {
  developer: TeamPageDeveloper
}

const availabilityClass: Record<TeamPageDeveloper['availability'], string> = {
  Available: 'team-dev-card__status--available',
  Busy: 'team-dev-card__status--busy',
  Limited: 'team-dev-card__status--limited',
}

const TeamPageDeveloperCard: React.FC<Props> = ({ developer }) => {
  return (
    <article className="team-dev-card">
      <div className="team-dev-card__header">
        <img
          src={developer.image}
          alt={`${developer.name}, ${developer.role}`}
          className="team-dev-card__avatar"
          loading="lazy"
        />
        <span className={`team-dev-card__status ${availabilityClass[developer.availability]}`}>
          {developer.availability}
        </span>
      </div>

      <h3 className="team-dev-card__name">{developer.name}</h3>
      <p className="team-dev-card__role">{developer.role}</p>
      <p className="team-dev-card__bio">{developer.bio}</p>

      <div className="team-dev-card__skills">
        {developer.skills.map((skill) => (
          <span key={skill} className="team-dev-card__skill">
            {skill}
          </span>
        ))}
      </div>

      <Link href={`/team/${developer.slug}`} className="team-dev-card__view-btn">
        View profile
      </Link>
    </article>
  )
}

export default TeamPageDeveloperCard
