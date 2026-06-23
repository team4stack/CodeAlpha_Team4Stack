'use client'

import React from 'react'

/** Placeholder — team content lives on home (#our-team). Redesign pending. */
const TeamPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black pt-24 md:pt-28">
      <div className="container-custom px-4 py-24 md:py-32 text-center">
        <p className="text-gray-500 text-sm md:text-base">This page is being updated. Visit the home page to meet our team.</p>
        <a
          href="/#our-team"
          className="inline-block mt-6 text-sm font-semibold text-orange-400 hover:text-orange-300 transition"
        >
          Go to team on home →
        </a>
      </div>
    </div>
  )
}

export default TeamPage
