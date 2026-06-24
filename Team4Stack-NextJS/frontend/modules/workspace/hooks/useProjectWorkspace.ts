'use client'

import { useCallback, useEffect, useState } from 'react'
import { getUserFriendlyMessage } from '@/lib/utils/errorHandler'
import type { ApiClientRequestInit } from '@/lib/api/client'
import type {
  WorkspaceActivity,
  WorkspaceDeliverable,
  WorkspaceMessage,
  WorkspaceMilestone,
  WorkspaceProjectDetail,
  WorkspaceTask,
} from '../types'

type AuthMode = NonNullable<ApiClientRequestInit['authMode']>

export function useProjectWorkspace(projectId: number, authMode: AuthMode = 'user-only') {
  const [project, setProject] = useState<WorkspaceProjectDetail | null>(null)
  const [tasks, setTasks] = useState<WorkspaceTask[]>([])
  const [messages, setMessages] = useState<WorkspaceMessage[]>([])
  const [activity, setActivity] = useState<WorkspaceActivity[]>([])
  const [milestones, setMilestones] = useState<WorkspaceMilestone[]>([])
  const [deliverables, setDeliverables] = useState<WorkspaceDeliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const { workspaceApi } = await import('@/lib/api')
      const [pRes, tRes, mRes, aRes, msRes, dRes] = await Promise.all([
        workspaceApi.getProject(projectId, authMode),
        workspaceApi.listTasks(projectId, authMode),
        workspaceApi.listMessages(projectId, authMode),
        workspaceApi.listActivity(projectId, authMode),
        workspaceApi.listMilestones(projectId, authMode),
        workspaceApi.listDeliverables(projectId, authMode),
      ])
      if (pRes.error) throw new Error(pRes.error)
      setProject(pRes.data as WorkspaceProjectDetail)
      setTasks(Array.isArray(tRes.data) ? tRes.data : [])
      setMessages(Array.isArray(mRes.data) ? mRes.data : [])
      setActivity(Array.isArray(aRes.data) ? aRes.data : [])
      setMilestones(Array.isArray(msRes.data) ? msRes.data : [])
      setDeliverables(Array.isArray(dRes.data) ? dRes.data : [])
    } catch (e) {
      setError(getUserFriendlyMessage(e, 'Failed to load workspace.'))
    } finally {
      setLoading(false)
    }
  }, [projectId, authMode])

  useEffect(() => {
    void reload()
  }, [reload])

  return { project, tasks, messages, activity, milestones, deliverables, loading, error, reload }
}
