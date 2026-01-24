'use client'

import React, { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface SidebarPinButtonProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isSidebarHovered: boolean
  dashboardLinkRef: React.RefObject<HTMLAnchorElement | null>
  sidebarWidth: number // 80 for collapsed, 256 for expanded
}

const SidebarPinButton: React.FC<SidebarPinButtonProps> = ({
  isCollapsed,
  setIsCollapsed,
  isSidebarHovered,
  dashboardLinkRef,
  sidebarWidth
}) => {
  const [top, setTop] = useState<number>(0)
  const [left, setLeft] = useState<number>(0)

  useEffect(() => {
    const updatePosition = () => {
      if (dashboardLinkRef.current) {
        // Find sidebar element (button is now inside sidebar)
        const sidebarElement = dashboardLinkRef.current.closest('aside')
        
        if (!sidebarElement) return
        
        // Get positions relative to sidebar
        const sidebarRect = sidebarElement.getBoundingClientRect()
        const linkRect = dashboardLinkRef.current.getBoundingClientRect()
        
        // Calculate positions relative to sidebar (not viewport)
        // Top: Dashboard link ke top se thoda upar (navbar ke kareeb)
        // Dashboard link is the first link at the top
        // Using link top instead of center to position it higher
        const linkTopRelative = linkRect.top - sidebarRect.top
        const buttonTop = linkTopRelative - 5 // -5px from link top (aur upar)
        setTop(Math.max(buttonTop, 15)) // Minimum 15px from top to avoid going too high
        
        // Left: sidebar's right edge relative to sidebar itself
        // Button center should be exactly at sidebar's right edge
        // Since button is inside sidebar and absolutely positioned with translate(-50%, -50%),
        // left = sidebar width positions button center at right edge
        // This ensures button stays fixed at sidebar edge during expand/collapse
        // Button is positioned outside nav area so it doesn't disturb tabs
        const buttonLeft = sidebarRect.width
        setLeft(buttonLeft)
      }
    }

    // Use requestAnimationFrame to ensure DOM is updated
    const rafUpdate = () => {
      requestAnimationFrame(() => {
        updatePosition()
      })
    }

    // Initial calculation
    rafUpdate()

    // Update on resize and scroll
    window.addEventListener('resize', rafUpdate)
    window.addEventListener('scroll', rafUpdate)

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(rafUpdate, 100)
    
    // Update when sidebar state changes (with smooth transition)
    // More frequent updates during transition to keep button fixed at edge
    const interval = setInterval(rafUpdate, 30)
    const clearIntervalTimeout = setTimeout(() => clearInterval(interval), 600)

    return () => {
      window.removeEventListener('resize', rafUpdate)
      window.removeEventListener('scroll', rafUpdate)
      clearTimeout(timeout)
      clearTimeout(clearIntervalTimeout)
      clearInterval(interval)
    }
  }, [isCollapsed, dashboardLinkRef, sidebarWidth])

  // Always render button but hide it when not hovered to prevent layout shift
  // This ensures button doesn't take space when appearing/disappearing
  return (
    <button
      className="absolute z-50 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/30 hover:border-cyan-400/50 hover:bg-black/80 text-white/70 hover:text-white transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-cyan-500/30"
      style={{
        position: 'absolute', // Explicitly set to ensure it's out of flow
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translate(-50%, -50%)', // Center both horizontally and vertically
        transition: 'left 0.3s ease-in-out, top 0.3s ease-in-out, opacity 0.2s ease-in-out, visibility 0.2s ease-in-out', // Smooth transition when sidebar changes
        // Hide when not hovered but keep in DOM to prevent layout shift
        opacity: isSidebarHovered ? 1 : 0,
        visibility: isSidebarHovered ? 'visible' : 'hidden',
        pointerEvents: isSidebarHovered ? 'auto' : 'none', // Disable pointer events when hidden
        // Remove from layout flow completely
        margin: 0,
        padding: 0
      }}
      onMouseDown={(e) => {
        if (!isSidebarHovered) return
        e.stopPropagation() // Prevent event bubbling to tabs
      }}
      onClick={(e) => {
        if (!isSidebarHovered) return
        e.stopPropagation() // Prevent event bubbling to tabs
        setIsCollapsed(!isCollapsed)
      }}
      title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
    >
      {isCollapsed ? (
        <FiChevronRight className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
      ) : (
        <FiChevronLeft className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
      )}
    </button>
  )
}

export default SidebarPinButton
