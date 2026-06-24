'use client'

import { useCallback, useEffect, useState } from 'react'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'
import type { ApiClientRequestInit } from '@/lib/api/client'
import type { WorkspaceProject } from '../types'

type AuthMode = NonNullable<ApiClientRequestInit['authMode']>

export function useMyProjects(authMode: AuthMode = 'user-only') {
  const [projects, setProjects] = useState<WorkspaceProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { workspaceApi } = await import('@/lib/api')
      const res = await workspaceApi.listProjects(authMode)
      if (res.error) throw new Error(res.error)
      setProjects(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      setError(getUserFriendlyMessage(e, 'Failed to load projects.'))
    } finally {
      setLoading(false)
    }
  }, [authMode])

  useEffect(() => {
    void reload()
  }, [reload])

  return { projects, loading, error, reload }
}
