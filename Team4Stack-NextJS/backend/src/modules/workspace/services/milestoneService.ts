import { supabaseAdmin } from '../../../config/supabase';
import { pickAllowedKeys, updateByIdWithTimestampRetry } from '../../../shared/utils/supabaseAdminWrite';
import type { WorkspaceActor } from '../middleware/workspaceAccess';
import { isWorkspaceAdmin } from '../middleware/workspaceAccess';
import type { MilestoneStatus, WorkspaceMilestone } from '../types';
import { logWorkspaceActivity } from './activityService';
import { notifyProjectClient } from './notificationService';

const MILESTONE_KEYS = ['title', 'description', 'due_date', 'status', 'sort_order'] as const;
const MILESTONE_STATUSES: MilestoneStatus[] = [
  'pending',
  'in_progress',
  'client_review',
  'approved',
  'rejected',
];

export async function listMilestones(projectId: number): Promise<WorkspaceMilestone[]> {
  const { data, error } = await supabaseAdmin
    .from('workspace_milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []) as WorkspaceMilestone[];
}

export async function createMilestone(
  projectId: number,
  actor: WorkspaceActor,
  body: Record<string, unknown>
): Promise<WorkspaceMilestone> {
  const title = String(body.title || '').trim();
  if (!title) throw Object.assign(new Error('Title is required'), { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('workspace_milestones')
    .insert({
      project_id: projectId,
      title,
      description: body.description ? String(body.description).trim() : null,
      due_date: body.due_date || null,
      sort_order: Number(body.sort_order) || 0,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;

  await logWorkspaceActivity(projectId, actor.email, 'milestone_created', { milestone_id: data.id });
  return data as WorkspaceMilestone;
}

export async function updateMilestone(
  milestoneId: number,
  actor: WorkspaceActor,
  body: Record<string, unknown>
): Promise<WorkspaceMilestone> {
  const patch = pickAllowedKeys(body, MILESTONE_KEYS);
  if (patch.status && !MILESTONE_STATUSES.includes(patch.status as MilestoneStatus)) {
    throw Object.assign(new Error('Invalid milestone status'), { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from('workspace_milestones')
    .select('project_id, status')
    .eq('id', milestoneId)
    .maybeSingle();

  if (patch.status === 'approved' && isWorkspaceAdmin(actor)) {
    (patch as Record<string, unknown>).approved_at = new Date().toISOString();
    (patch as Record<string, unknown>).approved_by_email = actor.email;
  }

  const row = await updateByIdWithTimestampRetry('workspace_milestones', milestoneId, patch, {
    notFoundMessage: 'Milestone not found',
  });

  const projectId = existing?.project_id as number;
  await logWorkspaceActivity(projectId, actor.email, 'milestone_updated', {
    milestone_id: milestoneId,
    status: patch.status,
  });

  if (patch.status === 'client_review') {
    await notifyProjectClient(
      projectId,
      'milestone_review',
      'Milestone ready for your review',
      String(row.title || 'A milestone'),
      `/workspace/${projectId}`
    );
  }

  return row as unknown as WorkspaceMilestone;
}

export async function clientRespondMilestone(
  milestoneId: number,
  actor: WorkspaceActor,
  approved: boolean
): Promise<WorkspaceMilestone> {
  if (actor.kind !== 'user') {
    throw Object.assign(new Error('Client access required'), { status: 403 });
  }

  const { data: existing } = await supabaseAdmin
    .from('workspace_milestones')
    .select('project_id, status')
    .eq('id', milestoneId)
    .maybeSingle();
  if (!existing || existing.status !== 'client_review') {
    throw Object.assign(new Error('Milestone is not awaiting your review'), { status: 400 });
  }

  const status: MilestoneStatus = approved ? 'approved' : 'rejected';
  const patch: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (approved) {
    patch.approved_at = new Date().toISOString();
    patch.approved_by_email = actor.email;
  }

  const row = await updateByIdWithTimestampRetry('workspace_milestones', milestoneId, patch, {
    notFoundMessage: 'Milestone not found',
  });

  await logWorkspaceActivity(existing.project_id, actor.email, 'milestone_client_response', {
    milestone_id: milestoneId,
    approved,
  });

  return row as unknown as WorkspaceMilestone;
}
