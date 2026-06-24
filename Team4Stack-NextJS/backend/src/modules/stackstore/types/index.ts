export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type EscrowStatus =
  | 'pending_payment'
  | 'payment_received'
  | 'in_escrow'
  | 'delivery_pending'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category_id?: string;
  image_url?: string;
  active?: boolean;
  stock?: number;
  seller_id?: string;
  platform?: string;
  github_url?: string;
  demo_url?: string;
  live_url?: string;
  verification_status?: VerificationStatus;
  team4stack_verified?: boolean;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  product_id?: string;
  seller_id?: string;
  buyer_email?: string;
  buyer_note?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'held' | 'released';
  escrow_status?: EscrowStatus;
  payment_reference?: string;
  admin_note?: string;
  total_amount?: number;
  shipping_address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Seller {
  id: string;
  user_id: string;
  store_name: string;
  description?: string;
  active?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export interface SellerApplication {
  id: number;
  applicant_user_id?: string | null;
  name: string;
  email: string;
  store_name: string;
  primary_platform: string;
  portfolio_url?: string | null;
  github_url?: string | null;
  bio: string;
  message?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by_admin?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
}
