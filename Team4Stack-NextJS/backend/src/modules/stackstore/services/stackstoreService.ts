import { supabaseAdmin } from '../../../config/supabase';
import { Product, Category, Order, Seller } from '../types';

export class StackStoreService {
  // Products
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
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createCategory(category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({ ...category, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);
    if (error) throw error;
  }

  // Orders
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
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(order)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ ...order, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Sellers
  async getSellers(): Promise<Seller[]> {
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createSeller(seller: Partial<Seller>): Promise<Seller> {
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .insert(seller)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateSeller(id: string, seller: Partial<Seller>): Promise<Seller> {
    const { data, error } = await supabaseAdmin
      .from('sellers')
      .update({ ...seller, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export default new StackStoreService();
