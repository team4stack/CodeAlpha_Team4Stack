export type ProjectStatus = 'scoped' | 'in_progress' | 'client_review' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'in_review' | 'done';
export type StaffRole = 'developer' | 'qa' | 'pm';
export type MilestoneStatus = 'pending' | 'in_progress' | 'client_review' | 'approved' | 'rejected';
export type DeliverableStatus = 'draft' | 'submitted' | 'approved' | 'revision_requested';

export interface WorkspaceProject {
  id: number;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  client_user_id?: string | null;
  client_email?: string | null;
  client_name?: string | null;
  created_by_admin?: string | null;
  deadline?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceProjectStaff {
  id: number;
  project_id: number;
  staff_email: string;
  staff_name?: string | null;
  staff_user_id?: string | null;
  role: StaffRole;
  created_at?: string;
}

export interface WorkspaceTask {
  id: number;
  project_id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assignee_email?: string | null;
  assignee_user_id?: string | null;
  due_date?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceMessage {
  id: number;
  project_id: number;
  sender_kind: 'user' | 'admin';
  sender_email: string;
  sender_user_id?: string | null;
  body: string;
  is_internal: boolean;
  created_at?: string;
}

export interface WorkspaceActivity {
  id: number;
  project_id: number;
  actor_email: string;
  action: string;
  details: Record<string, unknown>;
  created_at?: string;
}

export interface WorkspaceMilestone {
  id: number;
  project_id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  status: MilestoneStatus;
  sort_order: number;
  approved_at?: string | null;
  approved_by_email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceDeliverable {
  id: number;
  project_id: number;
  milestone_id?: number | null;
  title: string;
  description?: string | null;
  file_url?: string | null;
  staging_url?: string | null;
  status: DeliverableStatus;
  visible_to_client: boolean;
  submitted_by_email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceNotification {
  id: number;
  recipient_email: string;
  recipient_user_id?: string | null;
  project_id?: number | null;
  kind: string;
  title: string;
  body?: string | null;
  link_path?: string | null;
  read_at?: string | null;
  created_at?: string;
}

export interface WorkspaceProjectDetail extends WorkspaceProject {
  staff: WorkspaceProjectStaff[];
}
