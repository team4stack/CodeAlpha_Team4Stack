import { supabaseAdmin } from '../../../config/supabase';

export async function logWorkspaceActivity(
  projectId: number,
  actorEmail: string,
  action: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  const { error } = await supabaseAdmin.from('workspace_activity').insert({
    project_id: projectId,
    actor_email: actorEmail,
    action,
    details
  });
  if (error) throw error;
}

export async function listWorkspaceActivity(projectId: number, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from('workspace_activity')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
