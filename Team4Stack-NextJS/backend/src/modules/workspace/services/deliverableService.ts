import { supabaseAdmin } from '../../../config/supabase';
import { pickAllowedKeys, updateByIdWithTimestampRetry } from '../../../shared/utils/supabaseAdminWrite';
import type { WorkspaceActor } from '../middleware/workspaceAccess';
import { isWorkspaceAdmin } from '../middleware/workspaceAccess';
import type { DeliverableStatus, WorkspaceDeliverable } from '../types';
import { logWorkspaceActivity } from './activityService';
import { notifyProjectClient } from './notificationService';

const DELIVERABLE_KEYS = [
  'title',
  'description',
  'file_url',
  'staging_url',
  'status',
  'visible_to_client',
  'milestone_id',
] as const;

const DELIVERABLE_STATUSES: DeliverableStatus[] = [
  'draft',
  'submitted',
  'approved',
  'revision_requested',
];

export async function listDeliverables(
  projectId: number,
  actor: WorkspaceActor
): Promise<WorkspaceDeliverable[]> {
  let query = supabaseAdmin
    .from('workspace_deliverables')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (!isWorkspaceAdmin(actor)) {
    query = query.eq('visible_to_client', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as WorkspaceDeliverable[];
}

export async function createDeliverable(
  projectId: number,
  actor: WorkspaceActor,
  body: Record<string, unknown>
): Promise<WorkspaceDeliverable> {
  const title = String(body.title || '').trim();
  if (!title) throw Object.assign(new Error('Title is required'), { status: 400 });

  const visible = Boolean(body.visible_to_client) && isWorkspaceAdmin(actor);

  const { data, error } = await supabaseAdmin
    .from('workspace_deliverables')
    .insert({
      project_id: projectId,
      milestone_id: body.milestone_id ? Number(body.milestone_id) : null,
      title,
      description: body.description ? String(body.description).trim() : null,
      file_url: body.file_url ? String(body.file_url).trim() : null,
      staging_url: body.staging_url ? String(body.staging_url).trim() : null,
      status: visible ? 'submitted' : 'draft',
      visible_to_client: visible,
      submitted_by_email: actor.email,
    })
    .select()
    .single();
  if (error) throw error;

  await logWorkspaceActivity(projectId, actor.email, 'deliverable_created', { deliverable_id: data.id });

  if (visible) {
    await notifyProjectClient(
      projectId,
      'deliverable',
      'New deliverable shared',
      title,
      `/workspace/${projectId}`
    );
  }

  return data as WorkspaceDeliverable;
}

export async function updateDeliverable(
  deliverableId: number,
  actor: WorkspaceActor,
  body: Record<string, unknown>
): Promise<WorkspaceDeliverable> {
  const patch = pickAllowedKeys(body, DELIVERABLE_KEYS);
  if (patch.status && !DELIVERABLE_STATUSES.includes(patch.status as DeliverableStatus)) {
    throw Object.assign(new Error('Invalid deliverable status'), { status: 400 });
  }

  if (!isWorkspaceAdmin(actor)) {
    delete patch.visible_to_client;
    delete patch.status;
  }

  const { data: existing } = await supabaseAdmin
    .from('workspace_deliverables')
    .select('project_id, visible_to_client')
    .eq('id', deliverableId)
    .maybeSingle();

  const row = await updateByIdWithTimestampRetry('workspace_deliverables', deliverableId, patch, {
    notFoundMessage: 'Deliverable not found',
  });

  const projectId = existing?.project_id as number;
  await logWorkspaceActivity(projectId, actor.email, 'deliverable_updated', {
    deliverable_id: deliverableId,
  });

  if (patch.visible_to_client && !existing?.visible_to_client) {
    await notifyProjectClient(
      projectId,
      'deliverable',
      'New deliverable shared',
      String(row.title || 'Deliverable'),
      `/workspace/${projectId}`
    );
  }

  return row as unknown as WorkspaceDeliverable;
}
