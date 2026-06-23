'use client'

import React from 'react'
import Link from 'next/link'
import { COURSE_ACCENT_GRADIENT_SHORT } from '@/lib/utils/courseTheme'
import './HomeIntro.css'

const HIGHLIGHTS = [
  {
    key: 'courses',
    title: 'MERN Courses',
    level: 'Training',
    description: 'Hands-on physical classes at WE Connect or live online training with real projects.',
    href: '/courses',
    external: true,
  },
  {
    key: 'services',
    title: 'Client Services',
    level: 'Business',
    description: 'Custom websites, shop software, and full-stack apps built for your business.',
    href: '#services',
    external: false,
  },
  {
    key: 'stackstore',
    title: 'StackStore',
    level: 'Marketplace',
    description: 'Discover student projects and digital products from our developer community.',
    href: '/stackstore',
    external: true,
  },
]

function OfferCard({ item }: { item: (typeof HIGHLIGHTS)[number] }) {
  const card = (
    <div className="home-intro__card">
      <div className="home-intro__card-inner">
        <span className="home-intro__card-label">{item.level}</span>
        <h3 className="home-intro__card-title">{item.title}</h3>
        <p className="home-intro__card-desc">{item.description}</p>
        <span className="home-intro__card-cta">Explore →</span>
      </div>
    </div>
  )

  if (item.external) {
    return (
      <Link href={item.href} className="home-intro__link">
        {card}
      </Link>
    )
  }

  return (
    <a href={item.href} className="home-intro__link">
      {card}
    </a>
  )
}

const HomeIntro: React.FC = () => {
  return (
    <section id="about" className="home-intro py-12 sm:py-16 md:py-20 relative overflow-hidden">
      <div className="home-intro__backdrop" aria-hidden>
        <div className="home-intro__mesh" />
        <div className="home-intro__glow home-intro__glow--left" />
        <div className="home-intro__glow home-intro__glow--right" />
        <div className="home-intro__glow home-intro__glow--center" />
        <div className="home-intro__orb--cyan home-intro__orb home-intro__orb--a" />
        <div className="home-intro__orb--violet home-intro__orb home-intro__orb--b" />
        <div className="home-intro__orb--cyan home-intro__orb home-intro__orb--c" />
        <div className="home-intro__grid" />
      </div>

      <div className="container-custom px-4 relative z-10">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
            What We{' '}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${COURSE_ACCENT_GRADIENT_SHORT}`}>
              Offer
            </span>
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto text-gray-300">
            Training, development services, and a student marketplace — everything in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {HIGHLIGHTS.map((item) => (
            <OfferCard key={item.key} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default HomeIntro
