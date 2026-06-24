import { supabaseAdmin } from '../../../config/supabase';
import { pickAllowedKeys, updateByIdWithTimestampRetry } from '../../../shared/utils/supabaseAdminWrite';
import userService from '../../../shared/modules/users/services/userService';
import type { WorkspaceActor } from '../middleware/workspaceAccess';
import { isWorkspaceAdmin, normalizeEmail } from '../middleware/workspaceAccess';
import type { WorkspaceProject, WorkspaceProjectStaff } from '../types';
import { logWorkspaceActivity } from './activityService';

const PROJECT_KEYS = [
  'title',
  'description',
  'status',
  'client_user_id',
  'client_email',
  'client_name',
  'deadline'
] as const;

const STAFF_KEYS = ['staff_email', 'staff_name', 'staff_user_id', 'role'] as const;

async function getStaffForProject(projectId: number): Promise<WorkspaceProjectStaff[]> {
  const { data, error } = await supabaseAdmin
    .from('workspace_project_staff')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []) as WorkspaceProjectStaff[];
}

export async function userCanAccessProject(
  projectId: number,
  actor: WorkspaceActor
): Promise<boolean> {
  if (isWorkspaceAdmin(actor)) return true;

  const { data: project, error } = await supabaseAdmin
    .from('workspace_projects')
    .select('id, client_user_id, client_email')
    .eq('id', projectId)
    .maybeSingle();
  if (error) throw error;
  if (!project) return false;

  if (actor.kind === 'user') {
    if (project.client_user_id && project.client_user_id === actor.userId) return true;
    if (normalizeEmail(project.client_email) === actor.email) return true;

    const { data: staff } = await supabaseAdmin
      .from('workspace_project_staff')
      .select('id')
      .eq('project_id', projectId)
      .or(`staff_user_id.eq.${actor.userId},staff_email.eq.${actor.email}`)
      .limit(1);
    return Boolean(staff && staff.length > 0);
  }

  return false;
}

export async function listProjectsForActor(actor: WorkspaceActor): Promise<WorkspaceProject[]> {
  if (isWorkspaceAdmin(actor)) {
    const { data, error } = await supabaseAdmin
      .from('workspace_projects')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []) as WorkspaceProject[];
  }

  if (actor.kind !== 'user') return [];

  const { data: clientProjects, error: clientErr } = await supabaseAdmin
    .from('workspace_projects')
    .select('*')
    .or(`client_user_id.eq.${actor.userId},client_email.eq.${actor.email}`)
    .order('updated_at', { ascending: false });
  if (clientErr) throw clientErr;

  const { data: staffRows, error: staffErr } = await supabaseAdmin
    .from('workspace_project_staff')
    .select('project_id')
    .or(`staff_user_id.eq.${actor.userId},staff_email.eq.${actor.email}`);
  if (staffErr) throw staffErr;

  const staffProjectIds = [...new Set((staffRows || []).map((r) => r.project_id))];
  let staffProjects: WorkspaceProject[] = [];
  if (staffProjectIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('workspace_projects')
      .select('*')
      .in('id', staffProjectIds);
    if (error) throw error;
    staffProjects = (data || []) as WorkspaceProject[];
  }

  const merged = new Map<number, WorkspaceProject>();
  for (const p of [...(clientProjects || []), ...staffProjects]) {
    merged.set(p.id, p);
  }
  return [...merged.values()].sort(
    (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
  );
}

export async function getProjectDetail(projectId: number, actor: WorkspaceActor) {
  const allowed = await userCanAccessProject(projectId, actor);
  if (!allowed) return null;

  const { data, error } = await supabaseAdmin
    .from('workspace_projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const staff = await getStaffForProject(projectId);
  return { ...(data as WorkspaceProject), staff };
}

export async function createProject(
  actor: WorkspaceActor,
  body: Record<string, unknown>
): Promise<WorkspaceProject> {
  const clientEmail = normalizeEmail(String(body.client_email || '')) || null;
  let clientUserId = body.client_user_id ? String(body.client_user_id) : null;
  if (clientEmail && !clientUserId) {
    try {
      const user = await userService.getUserByEmail(clientEmail);
      if (user?.id) clientUserId = user.id;
    } catch {
      /* optional lookup */
    }
  }

  const insert = {
    ...pickAllowedKeys(body, PROJECT_KEYS),
    client_email: clientEmail,
    client_user_id: clientUserId,
    created_by_admin: actor.kind === 'admin' ? actor.email : null
  };

  const { data, error } = await supabaseAdmin
    .from('workspace_projects')
    .insert(insert)
    .select()
    .single();
  if (error) throw error;

  await logWorkspaceActivity(data.id, actor.email, 'project_created', {
    title: data.title
  });

  return data as WorkspaceProject;
}

export async function updateProject(
  projectId: number,
  body: Record<string, unknown>
): Promise<WorkspaceProject> {
  const patch = pickAllowedKeys(body, PROJECT_KEYS);
  if (patch.client_email) {
    patch.client_email = normalizeEmail(String(patch.client_email));
  }

  const row = await updateByIdWithTimestampRetry('workspace_projects', projectId, patch, {
    notFoundMessage: 'Project not found'
  });
  return row as unknown as WorkspaceProject;
}

export async function addProjectStaff(
  projectId: number,
  actor: WorkspaceActor,
  body: Record<string, unknown>
): Promise<WorkspaceProjectStaff> {
  const insert = {
    project_id: projectId,
    ...pickAllowedKeys(body, STAFF_KEYS),
    staff_email: normalizeEmail(String(body.staff_email || ''))
  };

  const { data, error } = await supabaseAdmin
    .from('workspace_project_staff')
    .insert(insert)
    .select()
    .single();
  if (error) throw error;

  await logWorkspaceActivity(projectId, actor.email, 'staff_assigned', {
    staff_email: data.staff_email,
    role: data.role
  });

  return data as WorkspaceProjectStaff;
}

export async function removeProjectStaff(staffId: number, projectId: number, actor: WorkspaceActor) {
  const { error } = await supabaseAdmin
    .from('workspace_project_staff')
    .delete()
    .eq('id', staffId)
    .eq('project_id', projectId);
  if (error) throw error;

  await logWorkspaceActivity(projectId, actor.email, 'staff_removed', { staff_id: staffId });
}
