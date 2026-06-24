'use client'

import React, { useMemo, useState } from 'react'
import { useTeamData } from '@/modules/team/hooks/useTeamData'
import TeamProfileCard from '@/modules/team/components/TeamProfileCard'
import ProfileModal from '@/modules/team/components/ProfileModal'
import {
  courseBadge,
  COURSE_ACCENT_GRADIENT_SHORT,
} from '@/lib/utils/courseTheme'

function buildTeamSchema(members: { name: string; role: string; image: string; portfolio?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Team4Stack Team',
    itemListElement: members.map((member, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Person',
        name: member.name,
        jobTitle: member.role,
        image: member.image || undefined,
        url: member.portfolio && member.portfolio !== '#' ? member.portfolio : undefined,
        worksFor: {
          '@type': 'Organization',
          name: 'Team4Stack',
          url: 'https://www.team4stack.com/',
        },
      },
    })),
  }
}

const HomeTeam: React.FC = () => {
  const { teamMembers, isLoading, error } = useTeamData()
  const [preview, setPreview] = useState<{
    image: string
    name: string
    role: string
    description?: string
    portfolio?: string
    github?: string
  } | null>(null)

  const teamSchema = useMemo(
    () => (teamMembers.length > 0 ? buildTeamSchema(teamMembers) : null),
    [teamMembers]
  )

  return (
    <section id="our-team" className="py-8 sm:py-16 md:py-20 lg:py-24 relative bg-black overflow-hidden">
      {teamSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }}
        />
      ) : null}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-48 h-48 md:w-96 md:h-96 rounded-full blur-3xl opacity-15 bg-purple-500" />
        <div className="absolute bottom-1/4 right-1/5 w-48 h-48 md:w-96 md:h-96 rounded-full blur-3xl opacity-15 bg-orange-500" />
      </div>

      <div className="container-custom px-4 relative z-10">
        <div className="text-center mb-7 sm:mb-14 max-w-3xl mx-auto">
          <span className={`inline-block text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-3 sm:mb-4 ${courseBadge(true)}`}>
            Our Team
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4">
            We have come to solve your{' '}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${COURSE_ACCENT_GRADIENT_SHORT}`}>
              business
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed">
            Four passionate MERN Stack developers building exceptional web apps and delivering cutting-edge solutions.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-7 max-w-6xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4.25] min-h-[22rem] rounded-[18px] bg-[#121218] border border-white/10 animate-pulse"
                aria-hidden
              />
            ))}
          </div>
        ) : teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-7 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <TeamProfileCard
                key={`${member.name}-${index}`}
                member={member}
                index={index}
                onOpen={() =>
                  setPreview({
                    image: member.image,
                    name: member.name,
                    role: member.role,
                    description: member.description,
                    portfolio: member.portfolio,
                    github: member.github,
                  })
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border border-gray-800 bg-gray-900/40 max-w-2xl mx-auto">
            <p className="text-gray-400">Team profiles will appear here once added in admin.</p>
          </div>
        )}
      </div>

      {preview && (
        <ProfileModal
          image={preview.image}
          name={preview.name}
          role={preview.role}
          description={preview.description}
          portfolio={preview.portfolio}
          github={preview.github}
          onClose={() => setPreview(null)}
        />
      )}
    </section>
  )
}

export default HomeTeam
