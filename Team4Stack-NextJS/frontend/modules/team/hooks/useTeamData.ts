'use client'

import { useEffect, useState } from 'react'

export type TeamMember = {
  name: string
  role: string
  image: string
  portfolio: string
  github: string
  description: string
  primaryTag?: string
  bannerImage?: string
}

export type MentorProfile = {
  name: string
  role: string
  description: string
  image: string
  bannerImage?: string
  portfolio?: string
  github?: string
  tags: string[]
}

const sanitizeImageUrl = (u?: string): string => {
  if (!u) return ''
  if (u.includes('github.com') && u.includes('/blob/') && !u.includes('?raw=')) {
    return `${u}?raw=1`
  }
  return u
}

export function useTeamData() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { teamApi } = await import('@/lib/api')
        const [membersResult, mentorResult] = await Promise.all([
          teamApi.getTeamMembers(),
          teamApi.getMentorProfiles(),
        ])

        if (cancelled) return

        if (Array.isArray(membersResult.data)) {
          const activeMembers = membersResult.data
            .filter((m: { active?: boolean }) => m.active === true)
            .sort((a: { is_head?: boolean; order_index?: number; id?: number }, b: { is_head?: boolean; order_index?: number; id?: number }) => {
              if (a.is_head !== b.is_head) return b.is_head ? 1 : -1
              if (a.order_index !== b.order_index) return (a.order_index || 0) - (b.order_index || 0)
              return (a.id || 0) - (b.id || 0)
            })

          setTeamMembers(
            activeMembers.map((r: Record<string, unknown>) => ({
              name: String(r.name || ''),
              role: String(r.role || ''),
              image: sanitizeImageUrl(String(r.profile_image_url || r.image_url || '')),
              portfolio: String(r.portfolio_url || '#'),
              github: String(r.github_url || '#'),
              description: String(r.description || ''),
              primaryTag: r.primary_tag ? String(r.primary_tag) : undefined,
              bannerImage: sanitizeImageUrl(String(r.banner_image_url || '')) || undefined,
            }))
          )
        }

        if (Array.isArray(mentorResult.data) && mentorResult.data.length > 0) {
          const m = mentorResult.data[0] as Record<string, unknown>
          setMentor({
            name: String(m.name || ''),
            role: String(m.role || ''),
            description: String(m.description || ''),
            image: sanitizeImageUrl(String(m.profile_image_url || '')),
            bannerImage: sanitizeImageUrl(String(m.banner_image_url || '')),
            portfolio: String(m.portfolio_url || '#'),
            github: String(m.github_url || '#'),
            tags: String(m.primary_tag || '')
              .split(',')
              .map((t: string) => t.trim())
              .filter(Boolean),
          })
        } else {
          setMentor(null)
        }
      } catch {
        if (!cancelled) setError('Unable to load team data. Please try again later.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { teamMembers, mentor, isLoading, error }
}
