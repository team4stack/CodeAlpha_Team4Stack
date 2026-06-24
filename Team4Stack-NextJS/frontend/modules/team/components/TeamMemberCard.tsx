'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import type { TeamMember } from '../hooks/useTeamData'

const DEFAULT_BANNERS = [
  'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=800&auto=format&fit=crop',
]

type Props = {
  member: TeamMember
  index: number
  onPreview: () => void
}

const TeamMemberCard: React.FC<Props> = ({ member, index, onPreview }) => {
  const { isDarkMode } = useTheme()
  const banner = member.bannerImage || DEFAULT_BANNERS[index % DEFAULT_BANNERS.length]
  const tags = member.primaryTag
    ? member.primaryTag.split(',').map((t) => t.trim()).filter(Boolean)
    : []

  return (
    <article
      className={`flex flex-col rounded-2xl border overflow-hidden transition-shadow hover:shadow-lg ${
        isDarkMode ? 'bg-slate-900/60 border-slate-700/60' : 'bg-white border-slate-200'
      }`}
    >
      <div className="relative h-28 bg-cover bg-center" style={{ backgroundImage: `url(${banner})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          type="button"
          onClick={onPreview}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-cyan-400"
          aria-label={`View ${member.name} profile`}
        >
          {member.image ? (
            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-400 flex items-center justify-center text-white text-2xl font-bold">
              {member.name.charAt(0)}
            </div>
          )}
        </button>
      </div>

      <div className="pt-12 px-5 pb-5 flex flex-col flex-1 text-center">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {member.name}
        </h3>
        <p className={`text-sm mt-1 ${isDarkMode ? 'text-cyan-300/90' : 'text-blue-600'}`}>{member.role}</p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2.5 py-0.5 rounded-full ${
                  isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {member.description && (
          <p className={`text-sm mt-3 line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {member.description}
          </p>
        )}

        <div className="flex gap-2 mt-auto pt-4">
          {member.portfolio && member.portfolio !== '#' && (
            <a
              href={member.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-sm font-medium px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 transition"
            >
              Portfolio
            </a>
          )}
          {member.github && member.github !== '#' && (
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 text-center text-sm font-medium px-3 py-2 rounded-lg border transition ${
                isDarkMode
                  ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default TeamMemberCard
