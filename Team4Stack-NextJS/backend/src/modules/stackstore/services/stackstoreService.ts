import { supabaseAdmin } from '../../../config/supabase';
import { pickAllowedKeys, updateByIdWithTimestampRetry } from '../../../shared/utils/supabaseAdminWrite';
import { Product, Category, Order, Seller } from '../types';

const PRODUCT_KEYS = ['name', 'description', 'price', 'category_id', 'image_url', 'active', 'stock'] as const;
const CATEGORY_KEYS = ['name', 'description', 'image_url', 'active'] as const;
const ORDER_KEYS = ['user_id', 'product_id', 'status', 'payment_status', 'total_amount', 'shipping_address'] as const;
const SELLER_KEYS = ['user_id', 'store_name', 'description', 'active'] as const;

export class StackStoreService {
  async getProducts(filters?: { active?: boolean; category_id?: string }): Promise<Product[]> {
    let query = supabaseAdmin.from('products').select('*');
    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active);
    }
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    const insert = pickAllowedKeys(product, PRODUCT_KEYS);
    const { data, error } = await supabaseAdmin.from('products').insert(insert).select().single();
    if (error) throw error;
    return data;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const patch = pickAllowedKeys(product, PRODUCT_KEYS);
    const row = await updateByIdWithTimestampRetry('products', id, patch, { notFoundMessage: 'Product not found' });
    return row as unknown as Product;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  async getCategories(filters?: { active?: boolean; includeInactive?: boolean }): Promise<Category[]> {
    let query = supabaseAdmin
      .from('categories')
      .select('*');
    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active);
    } else if (!filters?.includeInactive) {
      query = query.eq('active', true);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    const insert = pickAllowedKeys(category, CATEGORY_KEYS);
    const { data, error } = await supabaseAdmin.from('categories').insert(insert).select().single();
    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const patch = pickAllowedKeys(category, CATEGORY_KEYS);
    const row = await updateByIdWithTimestampRetry('categories', id, patch, { notFoundMessage: 'Category not found' });
    return row as unknown as Category;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) throw error;
  }

  async getOrders(filters?: {
    user_id?: string;
    status?: string;
    payment_status?: string;
  }): Promise<Order[]> {
    let query = supabaseAdmin.from('orders').select('*');
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.payment_status) query = query.eq('payment_status', filters.payment_status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    const insert = pickAllowedKeys(order, ORDER_KEYS);
    const { data, error } = await supabaseAdmin.from('orders').insert(insert).select().single();
    if (error) throw error;
    return data;
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    const patch = pickAllowedKeys(order, ORDER_KEYS);
    const row = await updateByIdWithTimestampRetry('orders', id, patch, { notFoundMessage: 'Order not found' });
    return row as unknown as Order;
  }

  async getSellers(filters?: { active?: boolean; includeInactive?: boolean }): Promise<Seller[]> {
    let query = supabaseAdmin
      .from('sellers')
      .select('*');
    if (filters?.active !== undefined) {
      query = query.eq('active', filters.active);
    } else if (!filters?.includeInactive) {
      query = query.eq('active', true);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createSeller(seller: Partial<Seller>): Promise<Seller> {
    const insert = pickAllowedKeys(seller, SELLER_KEYS);
    const { data, error } = await supabaseAdmin.from('sellers').insert(insert).select().single();
    if (error) throw error;
    return data;
  }

  async updateSeller(id: string, seller: Partial<Seller>): Promise<Seller> {
    const patch = pickAllowedKeys(seller, SELLER_KEYS);
    const row = await updateByIdWithTimestampRetry('sellers', id, patch, { notFoundMessage: 'Seller not found' });
    return row as unknown as Seller;
  }

  async deleteSeller(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('sellers').delete().eq('id', id);
    if (error) throw error;
  }
}

export default new StackStoreService();
