'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { developerProfilesApi } from '@/lib/api'
import {
  enrichDeveloperProfile,
  findDummyBySlug,
  mapApiProfile,
  type TeamPageDeveloper,
} from '../data/teamPageDevelopers'
import ProfileMessageChat from '../components/ProfileMessageChat'
import '../styles/team-page.css'
import '../styles/developer-profile.css'

type Props = {
  slug: string
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <span
      className={`dev-profile__stars dev-profile__stars--${size}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={
            i < full
              ? 'dev-profile__star dev-profile__star--full'
              : half && i === full
                ? 'dev-profile__star dev-profile__star--half'
                : 'dev-profile__star'
          }
        >
          ★
        </span>
      ))}
    </span>
  )
}

function availabilityClass(avail: TeamPageDeveloper['availability']) {
  if (avail === 'Available') return 'dev-profile__avail dev-profile__avail--available'
  if (avail === 'Limited') return 'dev-profile__avail dev-profile__avail--limited'
  return 'dev-profile__avail dev-profile__avail--busy'
}

const DeveloperProfilePage: React.FC<Props> = ({ slug }) => {
  const router = useRouter()
  const { user } = useAuth()
  const [developer, setDeveloper] = useState<TeamPageDeveloper | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await developerProfilesApi.getBySlug(slug)
        if (!cancelled && res.success && res.data) {
          setDeveloper(enrichDeveloperProfile(mapApiProfile(res.data as Record<string, unknown>)))
        } else if (!cancelled) {
          const dummy = findDummyBySlug(slug)
          if (dummy) setDeveloper(dummy)
          else setMissing(true)
        }
      } catch {
        if (!cancelled) {
          const dummy = findDummyBySlug(slug)
          if (dummy) setDeveloper(dummy)
          else setMissing(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="dev-profile-page">
        <p className="dev-profile-page__loading">Loading profile…</p>
      </div>
    )
  }

  if (missing || !developer) {
    notFound()
  }

  const showPortfolio = developer.portfolio && developer.portfolio !== '#'
  const showGithub = developer.github && developer.github !== '#'
  const firstName = developer.name.split(' ')[0]

  const scrollToChat = () => {
    if (!user) {
      const returnTo = `${globalThis.window.location.pathname}${globalThis.window.location.search}`
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`)
      return
    }
    document.getElementById('dev-profile-chat')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="dev-profile-page">
      <div className="dev-profile-page__glow dev-profile-page__glow--cyan" aria-hidden />
      <div className="dev-profile-page__glow dev-profile-page__glow--orange" aria-hidden />

      <div className="dev-profile-page__inner">
        <nav className="dev-profile-page__topbar" aria-label="Profile navigation">
          <Link href="/team" className="dev-profile-page__back">
            ← Back to team
          </Link>
          <span className="dev-profile-page__topbar-label">Hire a developer</span>
        </nav>

        <div className="dev-profile-page__layout">
          <div className="dev-profile-page__main">
            <header className="dev-profile__hero">
              <div className="dev-profile__hero-media">
                <img src={developer.image} alt={developer.name} className="dev-profile__photo" />
                <span className={availabilityClass(developer.availability)}>
                  {developer.availability}
                </span>
              </div>

              <div className="dev-profile__hero-body">
                <span className="dev-profile__badge">Verified Team4Stack Developer</span>
                <h1 className="dev-profile__name">{developer.name}</h1>
                <p className="dev-profile__role">{developer.role}</p>
                <p className="dev-profile__tagline">{developer.bio}</p>

                {(developer.rating || developer.yearsExperience || developer.projectsCompleted) && (
                  <div className="dev-profile__metrics">
                    {developer.rating ? (
                      <div className="dev-profile__metric">
                        <StarRating rating={developer.rating} />
                        <strong>{developer.rating}</strong>
                        <span>{developer.reviewCount ?? 0} client reviews</span>
                      </div>
                    ) : null}
                    {developer.yearsExperience ? (
                      <div className="dev-profile__metric">
                        <strong>{developer.yearsExperience}+</strong>
                        <span>Years experience</span>
                      </div>
                    ) : null}
                    {developer.projectsCompleted ? (
                      <div className="dev-profile__metric">
                        <strong>{developer.projectsCompleted}</strong>
                        <span>Projects delivered</span>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="dev-profile__hero-actions">
                  {(showPortfolio || showGithub) && (
                    <div className="dev-profile__links">
                      {showPortfolio ? (
                        <a href={developer.portfolio} target="_blank" rel="noopener noreferrer">
                          View portfolio
                        </a>
                      ) : null}
                      {showGithub ? (
                        <a href={developer.github} target="_blank" rel="noopener noreferrer">
                          GitHub profile
                        </a>
                      ) : null}
                    </div>
                  )}
                  <button type="button" className="dev-profile__chat-cta" onClick={scrollToChat}>
                    Message {firstName}
                  </button>
                </div>
              </div>
            </header>

            <section className="dev-profile__section">
              <h2>About</h2>
              <p>{developer.longBio || developer.bio}</p>
            </section>

            <section className="dev-profile__section">
              <h2>Core skills</h2>
              <div className="dev-profile__skills">
                {developer.skills.map((skill) => (
                  <span key={skill} className="dev-profile__skill">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {developer.experience && developer.experience.length > 0 && (
              <section className="dev-profile__section">
                <h2>Work experience</h2>
                <ul className="dev-profile__timeline">
                  {developer.experience.map((job) => (
                    <li key={`${job.company}-${job.period}`} className="dev-profile__timeline-item">
                      <div className="dev-profile__timeline-dot" aria-hidden />
                      <div>
                        <h3>{job.title}</h3>
                        <p className="dev-profile__timeline-meta">
                          {job.company} · {job.period}
                        </p>
                        <p className="dev-profile__timeline-desc">{job.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {developer.reviews && developer.reviews.length > 0 && (
              <section className="dev-profile__section dev-profile__section--reviews">
                <div className="dev-profile__section-head">
                  <h2>Client reviews</h2>
                  {developer.rating ? (
                    <p className="dev-profile__reviews-summary">
                      <StarRating rating={developer.rating} size="sm" />
                      <span>{developer.rating} average from verified clients</span>
                    </p>
                  ) : null}
                </div>
                <ul className="dev-profile__reviews">
                  {developer.reviews.map((review) => (
                    <li key={review.id} className="dev-profile__review">
                      <span className="dev-profile__review-quote" aria-hidden>
                        “
                      </span>
                      <div className="dev-profile__review-head">
                        <div>
                          <p className="dev-profile__review-name">{review.clientName}</p>
                          {review.company ? (
                            <p className="dev-profile__review-company">{review.company}</p>
                          ) : null}
                        </div>
                        <div className="dev-profile__review-meta">
                          <StarRating rating={review.rating} size="sm" />
                          <span>{review.date}</span>
                        </div>
                      </div>
                      <p className="dev-profile__review-text">{review.text}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <footer className="dev-profile__footer">
              <div className="dev-profile__footer-content">
                <h3>Ready to start your project?</h3>
                <p>
                  Sign in to send {firstName} a message with your scope, timeline, and budget. Replies
                  come directly in this chat.
                </p>
              </div>
              <button type="button" className="dev-profile__footer-btn" onClick={scrollToChat}>
                Open chat
              </button>
              <ul className="dev-profile__trust" aria-label="Trust indicators">
                <li>Verified Team4Stack member</li>
                <li>Secure messaging</li>
                <li>Reply within 24–48h</li>
              </ul>
            </footer>
          </div>

          <div className="dev-profile-page__chat-col" id="dev-profile-chat">
            <div className="dev-profile-page__chat-label">
              <h2>Project inquiry</h2>
              <p>Chat directly with {firstName}</p>
            </div>
            <ProfileMessageChat developer={developer} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeveloperProfilePage
