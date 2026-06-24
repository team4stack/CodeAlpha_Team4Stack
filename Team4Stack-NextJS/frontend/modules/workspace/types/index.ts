export type ProjectStatus = 'scoped' | 'in_progress' | 'client_review' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'in_review' | 'done';
export type MilestoneStatus = 'pending' | 'in_progress' | 'client_review' | 'approved' | 'rejected';
export type DeliverableStatus = 'draft' | 'submitted' | 'approved' | 'revision_requested';

export interface WorkspaceProject {
  id: number;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  client_email?: string | null;
  client_name?: string | null;
  deadline?: string | null;
  updated_at?: string;
}

export interface WorkspaceStaff {
  id: number;
  project_id: number;
  staff_email: string;
  staff_name?: string | null;
  role: string;
}

export interface WorkspaceTask {
  id: number;
  project_id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assignee_email?: string | null;
  due_date?: string | null;
}

export interface WorkspaceMessage {
  id: number;
  project_id: number;
  sender_kind: 'user' | 'admin';
  sender_email: string;
  body: string;
  is_internal: boolean;
  created_at?: string;
}

export interface WorkspaceActivity {
  id: number;
  actor_email: string;
  action: string;
  details: Record<string, unknown>;
  created_at?: string;
}

export interface WorkspaceProjectDetail extends WorkspaceProject {
  staff: WorkspaceStaff[];
}

export interface WorkspaceMilestone {
  id: number;
  project_id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  status: MilestoneStatus;
  sort_order: number;
}

export interface WorkspaceDeliverable {
  id: number;
  project_id: number;
  title: string;
  description?: string | null;
  file_url?: string | null;
  staging_url?: string | null;
  status: DeliverableStatus;
  visible_to_client: boolean;
}

export interface WorkspaceNotification {
  id: number;
  project_id?: number | null;
  kind: string;
  title: string;
  body?: string | null;
  link_path?: string | null;
  read_at?: string | null;
  created_at?: string;
}

export interface WorkspaceTaskWithProject extends WorkspaceTask {
  project_title?: string;
}
