export type Availability = 'available' | 'busy' | 'limited';
export type ConversationStatus = 'open' | 'closed';
export type SenderKind = 'client' | 'developer';

export interface DeveloperProfile {
  id: number;
  slug: string;
  user_id?: string | null;
  user_email?: string | null;
  name: string;
  role?: string | null;
  bio?: string | null;
  long_bio?: string | null;
  skills: string[];
  image_url?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  availability: Availability;
  is_published: boolean;
  assigned_by_admin?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileConversation {
  id: number;
  developer_profile_id: number;
  client_user_id?: string | null;
  client_email: string;
  client_name?: string | null;
  subject?: string | null;
  status: ConversationStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileMessage {
  id: number;
  conversation_id: number;
  sender_kind: SenderKind;
  sender_user_id?: string | null;
  sender_email: string;
  body: string;
  created_at?: string;
}
