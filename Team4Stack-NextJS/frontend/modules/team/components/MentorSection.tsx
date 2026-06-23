'use client'

import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import type { MentorProfile } from '../hooks/useTeamData'

type Props = {
  mentor: MentorProfile
  onPreview: () => void
}

const MentorSection: React.FC<Props> = ({ mentor, onPreview }) => {
  const { isDarkMode } = useTheme()

  return (
    <div
      className={`rounded-2xl border p-6 md:p-8 mb-12 ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-900/80 to-slate-800/40 border-slate-700/60'
          : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
      }`}
    >
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <button
          type="button"
          onClick={onPreview}
          className="shrink-0 w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-cyan-400/50 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
          aria-label={`View ${mentor.name} profile`}
        >
          {mentor.image ? (
            <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-400 flex items-center justify-center text-white text-3xl font-bold">
              {mentor.name.charAt(0)}
            </div>
          )}
        </button>

        <div className="flex-1 text-center md:text-left">
          <span
            className={`inline-block text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-3 ${
              isDarkMode ? 'bg-cyan-500/15 text-cyan-300' : 'bg-blue-100 text-blue-700'
            }`}
          >
            Lead Mentor
          </span>
          <h2 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {mentor.name}
          </h2>
          <p className={`text-lg mt-1 ${isDarkMode ? 'text-cyan-300/90' : 'text-blue-600'}`}>{mentor.role}</p>

          {mentor.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
              {mentor.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-xs px-3 py-1 rounded-full ${
                    isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {mentor.description && (
            <p className={`mt-4 text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              {mentor.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-5">
            {mentor.portfolio && mentor.portfolio !== '#' && (
              <a
                href={mentor.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 transition"
              >
                View Profile
              </a>
            )}
            {mentor.github && mentor.github !== '#' && (
              <a
                href={mentor.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm font-medium px-5 py-2.5 rounded-lg border transition ${
                  isDarkMode
                    ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-white'
                }`}
              >
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MentorSection
