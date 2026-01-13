export interface TeamMember {
  id: number;
  name: string;
  role_text?: string;
  image_url?: string;
  is_head?: boolean;
  profile_image_url?: string;
  banner_image_url?: string;
  portfolio_url?: string;
  github_url?: string;
  primary_tag?: string;
  order_index?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MentorProfile {
  id: number;
  name: string;
  role_text?: string;
  image_url?: string;
  profile_image_url?: string;
  banner_image_url?: string;
  portfolio_url?: string;
  github_url?: string;
  primary_tag?: string;
  order_index?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}
