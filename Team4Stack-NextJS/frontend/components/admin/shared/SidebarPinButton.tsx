'use client'

import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface SidebarPinButtonProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isSidebarHovered: boolean
}

/**
 * Parent must be `relative` (sidebar aside). Anchored to the top-right so nav can start flush below the header.
 * Half the control extends past the sidebar edge; aside must use overflow-visible so it is not clipped.
 */
const SidebarPinButton: React.FC<SidebarPinButtonProps> = ({
  isCollapsed,
  setIsCollapsed,
  isSidebarHovered
}) => (
  <button
    type="button"
    className="absolute right-0 top-4 z-50 flex h-6 w-6 translate-x-1/2 items-center justify-center rounded-full border border-cyan-500/30 bg-black/60 text-white/70 shadow-lg backdrop-blur-md transition-[color,background-color,border-color,box-shadow,opacity,visibility] duration-200 hover:border-cyan-400/50 hover:bg-black/80 hover:text-white hover:shadow-cyan-500/30"
    style={{
      opacity: isSidebarHovered ? 1 : 0,
      visibility: isSidebarHovered ? 'visible' : 'hidden',
      pointerEvents: isSidebarHovered ? 'auto' : 'none'
    }}
    onMouseDown={(e) => {
      if (!isSidebarHovered) return
      e.stopPropagation()
    }}
    onClick={(e) => {
      if (!isSidebarHovered) return
      e.stopPropagation()
      setIsCollapsed(!isCollapsed)
    }}
    title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  >
    {isCollapsed ? (
      <FiChevronRight className="h-3.5 w-3.5" aria-hidden />
    ) : (
      <FiChevronLeft className="h-3.5 w-3.5" aria-hidden />
    )}
  </button>
)

export default SidebarPinButton
