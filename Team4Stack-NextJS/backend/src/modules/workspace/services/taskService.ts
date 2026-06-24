import { supabaseAdmin } from '../../../config/supabase';
import { pickAllowedKeys, updateByIdWithTimestampRetry } from '../../../shared/utils/supabaseAdminWrite';
import type { WorkspaceActor } from '../middleware/workspaceAccess';
import { normalizeEmail } from '../middleware/workspaceAccess';
import type { WorkspaceTask, TaskStatus } from '../types';
import { logWorkspaceActivity } from './activityService';
import { createWorkspaceNotification } from './notificationService';

const TASK_KEYS = [
  'title',
  'description',
  'status',
  'assignee_email',
  'assignee_user_id',
  'due_date'
] as const;

const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'in_review', 'done'];

export function isValidTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && TASK_STATUSES.includes(value as TaskStatus);
}

export async function listTasks(projectId: number): Promise<WorkspaceTask[]> {
  const { data, error } = await supabaseAdmin
    .from('workspace_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as WorkspaceTask[];
}

export async function createTask(
  projectId: number,
  actor: WorkspaceActor,
  body: Record<string, unknown>
): Promise<WorkspaceTask> {
  const insert = {
    project_id: projectId,
    ...pickAllowedKeys(body, TASK_KEYS),
    assignee_email: body.assignee_email
      ? normalizeEmail(String(body.assignee_email))
      : null,
    created_by: actor.email
  };

  const { data, error } = await supabaseAdmin
    .from('workspace_tasks')
    .insert(insert)
    .select()
    .single();
  if (error) throw error;

  await logWorkspaceActivity(projectId, actor.email, 'task_created', {
    task_id: data.id,
    title: data.title
  });

  if (insert.assignee_email) {
    await createWorkspaceNotification({
      recipient_email: String(insert.assignee_email),
      recipient_user_id: body.assignee_user_id ? String(body.assignee_user_id) : null,
      project_id: projectId,
      kind: 'task_assigned',
      title: 'New task assigned',
      body: data.title,
      link_path: `/workspace/${projectId}`,
    });
  }

  return data as WorkspaceTask;
}

export async function updateTask(
  taskId: number,
  actor: WorkspaceActor,
  body: Record<string, unknown>
): Promise<WorkspaceTask> {
  const patch = pickAllowedKeys(body, TASK_KEYS);
  if (patch.assignee_email) {
    patch.assignee_email = normalizeEmail(String(patch.assignee_email));
  }

  const row = await updateByIdWithTimestampRetry('workspace_tasks', taskId, patch, {
    notFoundMessage: 'Task not found'
  });

  await logWorkspaceActivity(row.project_id as number, actor.email, 'task_updated', {
    task_id: taskId,
    status: patch.status
  });

  return row as unknown as WorkspaceTask;
}

export async function getTaskById(taskId: number): Promise<WorkspaceTask | null> {
  const { data, error } = await supabaseAdmin
    .from('workspace_tasks')
    .select('*')
    .eq('id', taskId)
    .maybeSingle();
  if (error) throw error;
  return (data as WorkspaceTask) || null;
}

export async function listMyTasks(actor: WorkspaceActor): Promise<
  (WorkspaceTask & { project_title?: string })[]
> {
  if (actor.kind !== 'user') return [];
  const email = normalizeEmail(actor.email);

  const { data, error } = await supabaseAdmin
    .from('workspace_tasks')
    .select('*, workspace_projects(title)')
    .or(`assignee_user_id.eq.${actor.userId},assignee_email.eq.${email}`)
    .order('updated_at', { ascending: false });
  if (error) throw error;

  return (data || []).map((row: Record<string, unknown>) => {
    const project = row.workspace_projects as { title?: string } | null;
    const { workspace_projects: _, ...task } = row;
    return { ...(task as unknown as WorkspaceTask), project_title: project?.title };
  });
}
