export interface Review {
  id: number;
  name: string;
  address?: string;
  rating: number;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  order_index?: number | null;
  created_at?: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  video_id?: string;
  github_url?: string;
  image_url?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  emoji?: string;
  gradient_color?: string;
  contact?: string;
  order_index?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSetting {
  id: number;
  key: string;
  value?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupportRequest {
  id: number;
  reason: string;
  target_area?: 'site' | 'course';
  email: string;
  subject: string;
  message: string;
  screenshot_url?: string | null;
  user_id?: string;
  status: 'pending' | 'resolved' | 'closed';
  viewed?: boolean;
  created_at?: string;
  updated_at?: string;
}
