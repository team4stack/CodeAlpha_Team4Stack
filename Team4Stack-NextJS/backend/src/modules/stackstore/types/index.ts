export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category_id?: string;
  image_url?: string;
  active?: boolean;
  stock?: number;
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
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
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
  created_at?: string;
  updated_at?: string;
}
