'use client'

import React, { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface SidebarPinButtonProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isSidebarHovered: boolean
  dashboardLinkRef: React.RefObject<HTMLAnchorElement | null>
  sidebarWidth: number // 80 for collapsed, 256 for expanded
  /** When set, pin button is positioned in this fixed top section (center) so it never scrolls away */
  topSectionRef?: React.RefObject<HTMLDivElement | null>
}

const SidebarPinButton: React.FC<SidebarPinButtonProps> = ({
  isCollapsed,
  setIsCollapsed,
  isSidebarHovered,
  dashboardLinkRef,
  sidebarWidth,
  topSectionRef
}) => {
  const [top, setTop] = useState<number>(0)
  const [left, setLeft] = useState<number>(0)

  useEffect(() => {
    const updatePosition = () => {
      try {
        const width = sidebarWidth ?? 256

        // Prefer fixed top section: pin button stays at top, never scrolls away
        if (topSectionRef?.current) {
          const sidebarElement = topSectionRef.current.closest('aside')
          if (!sidebarElement) return
          let sidebarRect: DOMRect | null = null
          let sectionRect: DOMRect | null = null
          try {
            sidebarRect = sidebarElement.getBoundingClientRect()
            sectionRect = topSectionRef.current.getBoundingClientRect()
          } catch (e) {
            setTop(28)
            setLeft(width)
            return
          }
          if (!sidebarRect?.width || !sectionRect?.height) return
          const buttonTop = sectionRect.height / 2 // center of top section
          setTop(buttonTop)
          setLeft(sidebarRect.width)
          return
        }

        // Fallback when ref not yet attached (e.g. first paint): position at top-right of sidebar
        if (!dashboardLinkRef?.current) {
          setTop(40)
          setLeft(width)
          return
        }

        // Find sidebar element (button is now inside sidebar)
        const sidebarElement = dashboardLinkRef.current.closest('aside')

        if (!sidebarElement) return

        // Get positions relative to sidebar with error handling
        let sidebarRect: DOMRect | null = null
        let linkRect: DOMRect | null = null

        try {
          sidebarRect = sidebarElement.getBoundingClientRect()
          linkRect = dashboardLinkRef.current.getBoundingClientRect()
        } catch (error) {
          console.warn('SidebarPinButton: Failed to get bounding rect', error)
          return
        }

        if (!sidebarRect || !linkRect || !sidebarRect.width || !sidebarRect.height) {
          return
        }

        const linkTopRelative = linkRect.top - sidebarRect.top
        const buttonTop = linkTopRelative - 5
        setTop(Math.max(buttonTop, 15))
        setLeft(sidebarRect.width || 0)
      } catch (error) {
        console.warn('SidebarPinButton: Error updating position', error)
      }
    }

    // Use requestAnimationFrame to ensure DOM is updated
    const rafUpdate = () => {
      try {
        if (typeof requestAnimationFrame !== 'undefined') {
          requestAnimationFrame(() => {
            updatePosition()
          })
        } else {
          // Fallback if requestAnimationFrame is not available
          updatePosition()
        }
      } catch (error) {
        console.warn('SidebarPinButton: Error in rafUpdate', error)
      }
    }

    // Initial calculation
    rafUpdate()

    // Update on resize and scroll (with safety checks)
    let timeout: NodeJS.Timeout | null = null
    let interval: NodeJS.Timeout | null = null
    let clearIntervalTimeout: NodeJS.Timeout | null = null

    try {
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', rafUpdate)
        window.addEventListener('scroll', rafUpdate)
      }

      // Small delay to ensure DOM is ready
      timeout = setTimeout(rafUpdate, 100)

      // Update when sidebar state changes (with smooth transition)
      // More frequent updates during transition to keep button fixed at edge
      interval = setInterval(rafUpdate, 30)
      clearIntervalTimeout = setTimeout(() => {
        if (interval) {
          clearInterval(interval)
          interval = null
        }
      }, 600)
    } catch (error) {
      console.warn('SidebarPinButton: Error setting up listeners', error)
    }

    return () => {
      try {
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', rafUpdate)
          window.removeEventListener('scroll', rafUpdate)
        }
        if (timeout) clearTimeout(timeout)
        if (clearIntervalTimeout) clearTimeout(clearIntervalTimeout)
        if (interval) clearInterval(interval)
      } catch (error) {
        console.warn('SidebarPinButton: Error cleaning up listeners', error)
      }
    }
  }, [isCollapsed, dashboardLinkRef, sidebarWidth, topSectionRef])

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
