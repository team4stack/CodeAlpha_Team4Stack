'use client'

import React from 'react'
import { FaCrown } from 'react-icons/fa'
import { isTeamLead } from './teamLead'
import './TeamMemberName.css'

type Props = {
  name: string
  className?: string
  variant?: 'card' | 'modal'
}

const TeamMemberName: React.FC<Props> = ({
  name,
  className = '',
  variant = 'card',
}) => {
  if (!isTeamLead(name)) {
    return <span className={className}>{name}</span>
  }

  return (
    <span
      className={`team-member-name team-member-name--lead team-member-name--${variant} ${className}`.trim()}
    >
      <span className="team-member-name__start">
        <FaCrown
          className={`team-member-name__crown team-member-name__crown--${variant}`}
          aria-hidden
        />
        {name.charAt(0)}
      </span>
      {name.slice(1)}
    </span>
  )
}

export default TeamMemberName
