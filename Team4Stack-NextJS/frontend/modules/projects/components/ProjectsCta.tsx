'use client'

import React from 'react'
import { CONTACT_PHONE_NUMBERS } from '@/lib/utils/constants'

const ProjectsCta: React.FC = () => (
  <div className="projects-page__cta">
    <h3 className="projects-page__cta-title">Want to Create Your Own Project?</h3>
    <p className="projects-page__cta-desc">
      Let us help you build your dream MERN stack application — from idea to deployment.
    </p>
    <div className="projects-page__cta-actions">
      <button
        type="button"
        className="projects-page__btn projects-page__btn--primary"
        onClick={() => window.open('https://www.fiverr.com/s/GzqRwwz', '_blank')}
      >
        Make a Project
      </button>
      <button
        type="button"
        className="projects-page__btn projects-page__btn--outline"
        onClick={() => window.open(`https://wa.me/${CONTACT_PHONE_NUMBERS.primary}`, '_blank')}
      >
        WhatsApp Us
      </button>
    </div>
  </div>
)

export default ProjectsCta
