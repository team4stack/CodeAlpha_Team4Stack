import { supabaseAdmin } from '../../../config/supabase';
import type { WorkspaceActor } from '../middleware/workspaceAccess';
import { isWorkspaceAdmin } from '../middleware/workspaceAccess';
import type { WorkspaceMessage } from '../types';
import { logWorkspaceActivity } from './activityService';
import { createWorkspaceNotification, notifyProjectClient, notifyProjectStaff } from './notificationService';

export async function listMessages(
  projectId: number,
  actor: WorkspaceActor
): Promise<WorkspaceMessage[]> {
  let query = supabaseAdmin
    .from('workspace_messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (!isWorkspaceAdmin(actor)) {
    query = query.eq('is_internal', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as WorkspaceMessage[];
}

export async function createMessage(
  projectId: number,
  actor: WorkspaceActor,
  body: Record<string, unknown>
): Promise<WorkspaceMessage> {
  const text = String(body.body || '').trim();
  if (!text || text.length > 4000) {
    const err = new Error('Message must be 1–4000 characters');
    (err as any).status = 400;
    throw err;
  }

  const isInternal = Boolean(body.is_internal) && isWorkspaceAdmin(actor);
  const senderKind = actor.kind === 'admin' ? 'admin' : 'user';

  const insert = {
    project_id: projectId,
    sender_kind: senderKind,
    sender_email: actor.email,
    sender_user_id: actor.kind === 'user' ? actor.userId : null,
    body: text,
    is_internal: isInternal
  };

  const { data, error } = await supabaseAdmin
    .from('workspace_messages')
    .insert(insert)
    .select()
    .single();
  if (error) throw error;

  await logWorkspaceActivity(projectId, actor.email, 'message_sent', {
    message_id: data.id,
    is_internal: isInternal
  });

  if (!isInternal) {
    const link = `/workspace/${projectId}`;
    if (actor.kind === 'admin') {
      await notifyProjectClient(projectId, 'message', 'New project message', text.slice(0, 120), link);
    } else {
      await notifyProjectStaff(projectId, 'message', 'Client sent a message', text.slice(0, 120), link);
    }
  }

  return data as WorkspaceMessage;
}
