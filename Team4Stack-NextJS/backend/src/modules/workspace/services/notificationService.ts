import { supabaseAdmin } from '../../../config/supabase';
import { normalizeEmail } from '../middleware/workspaceAccess';
import type { WorkspaceNotification } from '../types';

export async function createWorkspaceNotification(input: {
  recipient_email: string;
  recipient_user_id?: string | null;
  project_id?: number | null;
  kind: string;
  title: string;
  body?: string;
  link_path?: string;
}): Promise<void> {
  const email = normalizeEmail(input.recipient_email);
  if (!email) return;

  const { error } = await supabaseAdmin.from('workspace_notifications').insert({
    recipient_email: email,
    recipient_user_id: input.recipient_user_id || null,
    project_id: input.project_id ?? null,
    kind: input.kind,
    title: input.title.slice(0, 160),
    body: input.body?.slice(0, 500) || null,
    link_path: input.link_path || null,
  });
  if (error && process.env.NODE_ENV === 'development') {
    console.error('[workspace] notification insert failed:', error.message);
  }
}

export async function listNotificationsForActor(
  email: string,
  userId?: string
): Promise<WorkspaceNotification[]> {
  const normalized = normalizeEmail(email);
  let query = supabaseAdmin.from('workspace_notifications').select('*');

  if (userId) {
    query = query.or(`recipient_email.eq.${normalized},recipient_user_id.eq.${userId}`);
  } else {
    query = query.eq('recipient_email', normalized);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []) as WorkspaceNotification[];
}

export async function markNotificationRead(
  id: number,
  email: string,
  userId?: string
): Promise<WorkspaceNotification | null> {
  const normalized = normalizeEmail(email);
  const { data: row, error: findErr } = await supabaseAdmin
    .from('workspace_notifications')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (findErr) throw findErr;
  if (!row) return null;

  const owns =
    normalizeEmail(row.recipient_email) === normalized ||
    (userId && row.recipient_user_id === userId);
  if (!owns) return null;

  const { data, error } = await supabaseAdmin
    .from('workspace_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as WorkspaceNotification;
}

export async function notifyProjectClient(
  projectId: number,
  kind: string,
  title: string,
  body: string,
  linkPath: string
): Promise<void> {
  const { data: project } = await supabaseAdmin
    .from('workspace_projects')
    .select('client_email, client_user_id')
    .eq('id', projectId)
    .maybeSingle();
  if (!project?.client_email) return;
  await createWorkspaceNotification({
    recipient_email: project.client_email,
    recipient_user_id: project.client_user_id,
    project_id: projectId,
    kind,
    title,
    body,
    link_path: linkPath,
  });
}

export async function notifyProjectStaff(
  projectId: number,
  kind: string,
  title: string,
  body: string,
  linkPath: string
): Promise<void> {
  const { data: staff } = await supabaseAdmin
    .from('workspace_project_staff')
    .select('staff_email, staff_user_id')
    .eq('project_id', projectId);
  for (const s of staff || []) {
    if (!s.staff_email) continue;
    await createWorkspaceNotification({
      recipient_email: s.staff_email,
      recipient_user_id: s.staff_user_id,
      project_id: projectId,
      kind,
      title,
      body,
      link_path: linkPath,
    });
  }
}
