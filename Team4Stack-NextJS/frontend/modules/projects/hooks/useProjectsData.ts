'use client'

import { useEffect, useState } from 'react'
import { ProjectData, fetchYouTubeVideoData } from '@/lib/utils/youtube'
import { landingApi } from '@/lib/api'

export const HOME_PROJECTS_LIMIT = 7

export function extractYouTubeId(input: string): string {
  if (!input) return ''
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed
  const regexes = [
    /v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const r of regexes) {
    const m = r.exec(trimmed)
    if (m?.[1]) return m[1]
  }
  return trimmed
}

export function sanitizeProjectImageUrl(url?: string): string {
  if (!url) return ''
  const trimmed = url.trim()
  if (
    trimmed.includes('github.com') &&
    trimmed.includes('/blob/') &&
    !trimmed.includes('?raw=')
  ) {
    return `${trimmed}?raw=1`
  }
  return trimmed
}

export function sortProjectsLatest(projects: ProjectData[]): ProjectData[] {
  return [...projects].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
    if (aTime !== bTime) return bTime - aTime
    return Number(b.id) - Number(a.id)
  })
}

async function mapProjectRow(row: Record<string, unknown>): Promise<ProjectData> {
  const videoId = extractYouTubeId(String(row.video_id || ''))
  const github = String(row.github_url || '#').trim()
  const homeThumbnailUrl = sanitizeProjectImageUrl(String(row.image_url ?? ''))

  let yt: ProjectData | null = null
  if (videoId) {
    try {
      yt = await fetchYouTubeVideoData(videoId, github)
    } catch {
      yt = null
    }
  }

  const youtubeThumb =
    yt?.thumbnailUrl ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '')

  return {
    id: String(row.id),
    title: String(row.title || yt?.title || 'Project'),
    description: String(row.description ?? '').trim() || yt?.description || '',
    homeThumbnailUrl,
    thumbnailUrl: youtubeThumb || homeThumbnailUrl,
    videoUrl: yt?.videoUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#'),
    githubUrl: github || yt?.githubUrl || '#',
    createdAt: row.created_at ? String(row.created_at) : undefined,
  }
}

export function useProjectsData() {
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchAllProjects = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await landingApi.getProjects()
        const { data, error: apiError } = result
        if (apiError) throw apiError

        const rows = Array.isArray(data) ? data : []
        if (rows.length === 0) {
          if (!cancelled) setProjects([])
          return
        }

        const mapped = sortProjectsLatest(
          await Promise.all(rows.map((row) => mapProjectRow(row as Record<string, unknown>)))
        )
        if (!cancelled) setProjects(mapped)
      } catch {
        if (!cancelled) {
          setProjects([])
          setError('Unable to load projects. Please try again later.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAllProjects()
    return () => {
      cancelled = true
    }
  }, [])

  return { projects, loading, error }
}
