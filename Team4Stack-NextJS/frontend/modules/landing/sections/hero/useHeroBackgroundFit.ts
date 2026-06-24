'use client'

import { useEffect, useRef } from 'react'

/** Hero artboard — matches team4stack-hero-section.png (1536×1024) */
export const HERO_IMAGE_ASPECT = 1536 / 1024

/** Share with designer — section uses full width × height below */
export const HERO_SECTION_SPECS = {
  aspectRatio: '3:2 (landscape)',
  recommendedExport: { width: 1920, height: 1280 },
  alternateExport: { width: 2400, height: 1600 },
  minimumExport: { width: 1536, height: 1024 },
  sectionCss:
    'width: 100vw · height: clamp(100vh, calc(100vw / 1.5), 125vh)',
  layout: 'Left 0–40% = text · Right 40–100% = tower (keep full stack + reflection)',
} as const

type HeroBgFit = {
  posX: string
  posY: string
}

function getHeroBgFit(viewportWidth: number, viewportHeight: number): HeroBgFit {
  if (viewportWidth <= 639) {
    return { posX: '56%', posY: '5%' }
  }

  const aspect = viewportWidth / Math.max(viewportHeight, 1)

  if (aspect >= 1.85) {
    return { posX: '80%', posY: '6%' }
  }

  if (aspect >= HERO_IMAGE_ASPECT) {
    return { posX: '76%', posY: '8%' }
  }

  if (aspect >= 1.15) {
    return { posX: '72%', posY: '10%' }
  }

  if (aspect >= 0.85) {
    return { posX: '64%', posY: '12%' }
  }

  return { posX: '54%', posY: '14%' }
}
export function useHeroBackgroundFit() {
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = heroRef.current
    if (!node || typeof window === 'undefined') return

    const apply = () => {
      const { posX, posY } = getHeroBgFit(window.innerWidth, window.innerHeight)
      node.style.setProperty('--hero-bg-pos-x', posX)
      node.style.setProperty('--hero-bg-pos-y', posY)
    }
    apply()

    const onResize = () => apply()
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return heroRef
}
