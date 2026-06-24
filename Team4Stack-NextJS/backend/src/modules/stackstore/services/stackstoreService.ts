import { supabaseAdmin } from '../../../config/supabase';
import { pickAllowedKeys, updateByIdWithTimestampRetry } from '../../../shared/utils/supabaseAdminWrite';
import { normalizePlatform } from '../constants/platforms';
import type { Product, Category, Order, Seller } from '../types';
import { isMissingColumnError } from '../utils/errors';

const PRODUCT_KEYS = [
  'name',
  'description',
  'price',
  'category_id',
  'image_url',
  'active',
  'stock',
  'seller_id',
  'platform',
  'github_url',
  'demo_url',
  'live_url',
  'verification_status',
  'team4stack_verified',
  'rejection_reason',
] as const;

const CATEGORY_KEYS = ['name', 'description', 'image_url', 'active'] as const;
const ORDER_KEYS = [
  'user_id',
  'product_id',
  'seller_id',
  'buyer_email',
  'buyer_note',
  'status',
  'payment_status',
  'escrow_status',
  'payment_reference',
  'admin_note',
  'total_amount',
  'shipping_address',
] as const;
const SELLER_KEYS = ['user_id', 'store_name', 'description', 'active', 'status'] as const;

const STOREFRONT_PRODUCT_FILTER = {
  active: true,
  verification_status: 'approved',
  team4stack_verified: true,
};

export class StackStoreService {
  async getProducts(filters?: {
    active?: boolean;
    category_id?: string;
    storefront?: boolean;
    seller_id?: string;
    verification_status?: string;
    includeAll?: boolean;
  }): Promise<Product[]> {
    let query = supabaseAdmin.from('products').select('*');

    if (filters?.storefront) {
      query = query
        .eq('active', STOREFRONT_PRODUCT_FILTER.active)
        .eq('verification_status', STOREFRONT_PRODUCT_FILTER.verification_status)
        .eq('team4stack_verified', STOREFRONT_PRODUCT_FILTER.team4stack_verified);
    } else {
      if (filters?.active !== undefined) query = query.eq('active', filters.active);
      if (filters?.verification_status) query = query.eq('verification_status', filters.verification_status);
      if (filters?.seller_id) query = query.eq('seller_id', filters.seller_id);
    }

    if (filters?.category_id) query = query.eq('category_id', filters.category_id);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      if (filters?.storefront && isMissingColumnError(error)) {
        return this.getProducts({ ...filters, storefront: false, active: true });
      }
      throw error;
    }
    return data || [];
  }

  async getProductById(id: string, options?: { storefront?: boolean }): Promise<Product | null> {
    const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return null;

    if (options?.storefront) {
      const p = data as Product;
      if (
        !p.active ||
        p.verification_status !== 'approved' ||
        !p.team4stack_verified
      ) {
        return null;
      }
    }

    return data;
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    const insert = pickAllowedKeys(product, PRODUCT_KEYS);
    const { data, error } = await supabaseAdmin.from('products').insert(insert).select().single();
    if (error) throw error;
    return data;
  }

  async createSellerProduct(sellerId: string, body: Record<string, unknown>): Promise<Product> {
    const name = String(body.name || '').trim();
    const description = String(body.description || '').trim();
    const githubUrl = String(body.github_url || '').trim();
    const price = Number(body.price);

    if (!name || name.length < 3) {
      throw Object.assign(new Error('Project name is required'), { status: 400 });
    }
    if (!description || description.length < 40) {
      throw Object.assign(new Error('Describe the project in at least 40 characters'), { status: 400 });
    }
    if (!githubUrl || !/^https?:\/\//i.test(githubUrl)) {
      throw Object.assign(new Error('A valid GitHub repository URL is required'), { status: 400 });
    }
    if (!Number.isFinite(price) || price <= 0) {
      throw Object.assign(new Error('Price must be greater than zero'), { status: 400 });
    }

    return this.createProduct({
      name,
      description,
      price,
      category_id: body.category_id ? String(body.category_id) : undefined,
      image_url: body.image_url ? String(body.image_url) : undefined,
      seller_id: sellerId,
      platform: normalizePlatform(body.platform),
      github_url: githubUrl,
      demo_url: body.demo_url ? String(body.demo_url).trim() : undefined,
      live_url: body.live_url ? String(body.live_url).trim() : undefined,
      active: false,
      verification_status: 'pending',
      team4stack_verified: false,
      stock: 1,
    });
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const patch = pickAllowedKeys(product, PRODUCT_KEYS);
    const row = await updateByIdWithTimestampRetry('products', id, patch, { notFoundMessage: 'Product not found' });
    return row as unknown as Product;
  }

  async verifyProduct(
    id: string,
    decision: 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<Product> {
    const patch: Partial<Product> =
      decision === 'approved'
        ? {
            verification_status: 'approved',
            team4stack_verified: true,
            active: true,
            rejection_reason: null as unknown as string,
          }
        : {
            verification_status: 'rejected',
            team4stack_verified: false,
            active: false,
            rejection_reason: rejectionReason || 'Did not meet verification standards',
          };

    return this.updateProduct(id, patch);
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  async getCategories(filters?: { active?: boolean; includeInactive?: boolean }): Promise<Category[]> {
    let query = supabaseAdmin.from('categories').select('*');
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
    seller_id?: string;
    status?: string;
    payment_status?: string;
    escrow_status?: string;
  }): Promise<Order[]> {
    let query = supabaseAdmin.from('orders').select('*');
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.seller_id) query = query.eq('seller_id', filters.seller_id);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.payment_status) query = query.eq('payment_status', filters.payment_status);
    if (filters?.escrow_status) query = query.eq('escrow_status', filters.escrow_status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createCheckoutOrder(args: {
    userId: string;
    buyerEmail: string;
    productId: string;
    buyerNote?: string;
  }): Promise<Order> {
    const product = await this.getProductById(args.productId, { storefront: true });
    if (!product) {
      throw Object.assign(new Error('Product is not available for purchase'), { status: 404 });
    }
    if (!product.seller_id) {
      throw Object.assign(new Error('Product seller is not configured'), { status: 400 });
    }

    return this.createOrder({
      user_id: args.userId,
      product_id: product.id,
      seller_id: product.seller_id,
      buyer_email: args.buyerEmail,
      buyer_note: args.buyerNote,
      total_amount: product.price,
      status: 'pending',
      payment_status: 'pending',
      escrow_status: 'pending_payment',
    });
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
    let query = supabaseAdmin.from('sellers').select('*');
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
