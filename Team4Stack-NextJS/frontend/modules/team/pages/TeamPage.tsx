'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { developerProfilesApi } from '@/lib/api'
import { mapApiProfile, TEAM_PAGE_DEVELOPERS } from '../data/teamPageDevelopers'
import TeamPageDeveloperCard from '../components/TeamPageDeveloperCard'
import '../styles/team-page.css'

const TeamPage: React.FC = () => {
  const [developers, setDevelopers] = useState(TEAM_PAGE_DEVELOPERS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await developerProfilesApi.listPublic()
        if (!cancelled && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setDevelopers(res.data.map((row) => mapApiProfile(row as Record<string, unknown>)))
        }
      } catch {
        /* fallback to dummy */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="team-page">
      <div className="team-page__glow team-page__glow--purple" aria-hidden />
      <div className="team-page__glow team-page__glow--orange" aria-hidden />

      <div className="team-page__inner container-custom">
        <header className="team-page__hero">
          <span className="team-page__badge">Hire a Developer</span>
          <h1 className="team-page__title">
            Pick a developer &amp; <span>start your project</span>
          </h1>
          <p className="team-page__subtitle">
            Browse profiles, open a developer page, and send your project details. Team4Stack
            manages delivery — you work with one trusted team.
          </p>
        </header>

        {loading ? (
          <p className="team-page__loading">Loading team…</p>
        ) : (
          <>
            <div className="team-page__grid">
              {developers.map((developer) => (
                <TeamPageDeveloperCard key={developer.slug} developer={developer} />
              ))}
            </div>

            <div className="team-page__apply-cta">
              <p>Want to join Team4Stack as a developer?</p>
              <Link href="/courses/apply?type=developer" className="team-page__apply-link">
                Apply as developer →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default TeamPage
