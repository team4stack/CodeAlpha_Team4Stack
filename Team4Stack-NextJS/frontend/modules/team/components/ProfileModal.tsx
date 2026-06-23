'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'
import TeamMemberName from './TeamMemberName'
import { getTeamBadgeLabel } from './teamLead'
import './ProfileModal.css'

type Props = {
  image: string
  name: string
  role: string
  description?: string
  portfolio?: string
  github?: string
  onClose: () => void
}

const ProfileModal: React.FC<Props> = ({
  image,
  name,
  role,
  description,
  portfolio,
  github,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const showPortfolio = portfolio && portfolio !== '#'
  const showGithub = github && github !== '#'

  if (!mounted) return null

  return createPortal(
    <>
      <div
        className="profile-glass-modal__backdrop fixed inset-0 bg-black/70 backdrop-blur-xl"
        onClick={onClose}
        aria-hidden
      />

      <div
        className="profile-glass-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`${name} profile`}
      >
        <div className="profile-glass-modal__layout">
          <div className="profile-glass-modal__glass-wrap">
            <div className="profile-glass-modal__orb profile-glass-modal__orb--pink" aria-hidden />
            <div className="profile-glass-modal__orb profile-glass-modal__orb--purple" aria-hidden />

            <div className="profile-glass-modal__glass-card">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="profile-glass-modal__glass-photo"
                />
              ) : (
                <div className="profile-glass-modal__glass-fallback">
                  {name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="profile-glass-modal__details">
            <button
              type="button"
              onClick={onClose}
              className="profile-glass-modal__close btn-plain"
              aria-label="Close"
            >
              <FiX className="profile-glass-modal__close-icon" aria-hidden />
            </button>

            <p className="profile-glass-modal__label">{getTeamBadgeLabel(name)}</p>
            <h3 className="profile-glass-modal__name">
              <TeamMemberName name={name} variant="modal" />
            </h3>
            <p className="profile-glass-modal__role">{role}</p>

            {description && (
              <div className="profile-glass-modal__bio">
                <p>&ldquo;{description}&rdquo;</p>
              </div>
            )}

            {(showPortfolio || showGithub) && (
              <div className="profile-glass-modal__actions">
                {showPortfolio && (
                  <a
                    href={portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-glass-modal__btn profile-glass-modal__btn--primary btn-plain"
                  >
                    Portfolio
                  </a>
                )}
                {showGithub && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-glass-modal__btn btn-plain"
                  >
                    GitHub
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

export default ProfileModal
