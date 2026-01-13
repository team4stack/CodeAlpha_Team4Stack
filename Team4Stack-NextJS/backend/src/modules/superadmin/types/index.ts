export interface AdminUser {
  id: number;
  email: string;
  role?: string;
  created_at?: string;
}

export interface AuditLog {
  id: number;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  details?: any;
  created_at?: string;
}

export interface User {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  avatar_url?: string;
  is_blocked?: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
}
