'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { FiCode, FiBookOpen, FiBriefcase } from 'react-icons/fi'
import { useHeroBackgroundFit } from './useHeroBackgroundFit'
import './HeroBrick.css'

const HERO_BG_IMAGE = '/hero/team4stack-hero-section.png'

const DEFAULT_HERO_TEXTS = [
  'Building Digital',
  'MERN Solutions',
  'Full-Stack Power',
  'Digital Innovation',
  'Code Excellence',
]

const ROTATING_WORDS = ['Students', 'Clients', 'Teams', 'Startups'] as const

const HERO_FEATURES = [
  {
    icon: FiCode,
    title: 'MERN Development',
    subtitle: 'Production-ready web applications',
  },
  {
    icon: FiBookOpen,
    title: 'Student Courses',
    subtitle: 'Learn, build and deploy',
  },
  {
    icon: FiBriefcase,
    title: 'Client Projects',
    subtitle: 'Custom software that ships',
  },
] as const

const HeroSimple: React.FC = () => {
  const heroRef = useHeroBackgroundFit()
  const [heroTexts, setHeroTexts] = useState<string[]>(DEFAULT_HERO_TEXTS)
  const [textIndex, setTextIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReduceMotion(mq.matches)
      const onChange = () => setReduceMotion(mq.matches)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    } catch {
      return undefined
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const { landingApi } = await import('@/lib/api')
        const result = await landingApi.getSiteSettings(['hero_animated_texts'])
        const row = (Array.isArray(result.data) ? result.data : []).find(
          (r: { key?: string }) => r.key === 'hero_animated_texts'
        )
        if (row?.value) {
          const parsed = JSON.parse(row.value)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned = parsed.filter((t: unknown) => typeof t === 'string' && t.trim())
            if (cleaned.length > 0) setHeroTexts(cleaned)
          }
        }
      } catch {
        // keep defaults
      }
    })()
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      setDisplayText(heroTexts[0] ?? DEFAULT_HERO_TEXTS[0])
      return undefined
    }

    const fullText = heroTexts[textIndex] ?? ''
    const timeout = window.setTimeout(
      () => {
        if (isDeleting) {
          setDisplayText(fullText.substring(0, displayText.length - 1))
        } else {
          setDisplayText(fullText.substring(0, displayText.length + 1))
        }

        if (!isDeleting && displayText === fullText) {
          window.setTimeout(() => setIsDeleting(true), 2200)
        } else if (isDeleting && displayText === '') {
          setIsDeleting(false)
          setTextIndex((prev) => (prev + 1) % heroTexts.length)
        }
      },
      isDeleting ? 45 : 85
    )

    return () => window.clearTimeout(timeout)
  }, [displayText, isDeleting, textIndex, heroTexts, reduceMotion])

  return (
    <section ref={heroRef} id="home" className="home-hero overflow-hidden bg-black">
      <div className="home-hero__bg" aria-hidden>
        <img
          src={HERO_BG_IMAGE}
          alt=""
          className="home-hero__bg-img"
          width={1536}
          height={1024}
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <div className="home-hero__overlay" aria-hidden />
      <div className="home-hero__fade" aria-hidden />

      <div className="container-custom home-hero__container">
        <div className="home-hero__inner">
          <div className="home-hero__content">
            <div className="home-hero__text-glow" aria-hidden />

            <h1 className="home-hero__title">
              <span
                className="home-hero__typewriter-wrap home-hero__anim home-hero__anim--1"
                aria-live="polite"
              >
                <span className="home-hero__typewriter">{displayText}</span>
                {!reduceMotion && <span className="home-hero__cursor" aria-hidden>|</span>}
              </span>
              <span className="home-hero__title-accent home-hero__title-accent--live home-hero__title-accent--d3 home-hero__anim home-hero__anim--2">
                Stack by Stack
              </span>
            </h1>

            <p className="home-hero__desc home-hero__anim home-hero__anim--3">
              <strong>MERN Stack</strong> engineering for{' '}
              <span className="home-hero__rotator" aria-live="polite">
                <span className="home-hero__rotator-track">
                  {ROTATING_WORDS.map((word) => (
                    <span key={word} className="home-hero__rotator-word">
                      {word}
                    </span>
                  ))}
                </span>
              </span>
              — built to ship.
            </p>

            <ul className="home-hero__features">
              {HERO_FEATURES.map(({ icon: Icon, title, subtitle }, index) => (
                <li
                  key={title}
                  className={`home-hero__feature home-hero__anim home-hero__anim--${4 + index}`}
                >
                  <span className="home-hero__feature-icon" aria-hidden>
                    <Icon strokeWidth={1.75} />
                  </span>
                  <div className="home-hero__feature-body">
                    <span className="home-hero__feature-title">{title}</span>
                    <span className="home-hero__feature-sub">{subtitle}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="home-hero__actions home-hero__anim home-hero__anim--7">
              <a href="#our-team" className="home-hero__btn-primary">
                Our Developers
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a href="#services" className="home-hero__btn-ghost">
                Services
              </a>
              <Link href="/courses" className="home-hero__btn-ghost">
                Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSimple
