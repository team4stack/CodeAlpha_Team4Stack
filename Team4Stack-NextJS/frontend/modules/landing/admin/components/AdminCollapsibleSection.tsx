'use client'

import React, { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

interface AdminCollapsibleSectionProps {
  title: string
  description?: string
  defaultOpen?: boolean
  /** default = glass-friendly card; flat = compact hero modal sections */
  variant?: 'default' | 'solid' | 'flat'
  children: React.ReactNode
}

/**
 * Landing admin: group dense forms into expandable panels (dark theme).
 */
const AdminCollapsibleSection: React.FC<AdminCollapsibleSectionProps> = ({
  title,
  description,
  defaultOpen = false,
  variant = 'default',
  children
}) => {
  const [open, setOpen] = useState(defaultOpen)

  if (variant === 'flat') {
    return (
      <div className="rounded-md border border-slate-800 bg-slate-950/90 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 rounded-t-md border-b border-slate-800 bg-slate-900/95 px-2 py-2 text-left transition-colors hover:bg-slate-800/95"
        >
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-200/90">{title}</span>
            {description ? (
              <span className="mt-0.5 block truncate text-[10px] font-normal normal-case tracking-normal text-slate-500">
                {description}
              </span>
            ) : null}
          </div>
          <FiChevronDown
            className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        {open ? (
          <div className="border-t border-slate-800 bg-slate-950 px-2 py-2">{children}</div>
        ) : null}
      </div>
    )
  }

  const shell =
    'rounded-lg border border-slate-700 bg-slate-950/90 backdrop-blur-md overflow-hidden shadow-sm shadow-black/20'
  const btnHover = 'hover:bg-slate-900'
  const divider = 'border-t border-slate-800 bg-slate-950'

  return (
    <div className={shell}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-3 rounded-t-lg bg-slate-950/80 px-3 py-2 text-left backdrop-blur-sm transition-colors sm:py-2 ${btnHover}`}
      >
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {description ? <div className="mt-0.5 text-xs text-slate-500">{description}</div> : null}
        </div>
        <FiChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? <div className={`px-3 py-2 sm:px-3 sm:py-2 ${divider}`}>{children}</div> : null}
    </div>
  )
}

export default AdminCollapsibleSection
