'use client'

import React from 'react'

export type ApplyType = 'student' | 'developer'

type Props = {
  value: ApplyType
  onChange: (type: ApplyType) => void
}

const OPTIONS: { id: ApplyType; label: string; description: string }[] = [
  {
    id: 'student',
    label: 'Apply as Student',
    description: 'Join Team4Stack courses — MERN stack & more',
  },
  {
    id: 'developer',
    label: 'Apply as Developer',
    description: 'Join our team — work on client projects',
  },
]

const ApplyTypeSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto mb-8">
      {OPTIONS.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`text-left rounded-xl border px-4 py-4 transition-all ${
              active
                ? 'border-cyan-400/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20'
            }`}
          >
            <p className={`font-semibold text-sm sm:text-base ${active ? 'text-cyan-300' : 'text-white'}`}>
              {opt.label}
            </p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{opt.description}</p>
          </button>
        )
      })}
    </div>
  )
}

export default ApplyTypeSelector
