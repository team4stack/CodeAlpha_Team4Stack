'use client'

import React, { Suspense } from 'react'
import HeroSimple from '../sections/hero/HeroSimple'
import HomeIntro from '../sections/intro/HomeIntro'
import HomeTeam from '../sections/team/HomeTeam'
import { services, projects, reviews, contact } from '../sections'
import '@/navigation/HomeNavbar.css'
import '../landing-mobile.css'

const SectionLoader = () => (
  <div className="h-64 flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
  </div>
)

const HomePage: React.FC = () => {
  return (
    <div className="home-page min-h-screen bg-black transition-colors duration-300">
      <HeroSimple />
      <HomeIntro />
      <HomeTeam />
      <Suspense fallback={<SectionLoader />}>
        <services.Services />
      </Suspense>
      <projects.Projects />
      <Suspense fallback={<SectionLoader />}>
        <reviews.Reviews />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <contact.Contact />
      </Suspense>
    </div>
  )
}

export default HomePage
