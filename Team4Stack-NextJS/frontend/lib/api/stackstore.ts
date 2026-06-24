// StackStore API endpoints
import apiClient from './client';

const userOpts = { authMode: 'user-only' as const };

export const stackstoreApi = {
  // Products
  getProducts: async (filters?: {
    active?: boolean;
    category_id?: string;
    storefront?: boolean;
    seller_id?: string;
    verification_status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.append('active', String(filters.active));
    if (filters?.category_id) params.append('category_id', filters.category_id);
    if (filters?.storefront) params.append('storefront', 'true');
    if (filters?.seller_id) params.append('seller_id', filters.seller_id);
    if (filters?.verification_status) params.append('verification_status', filters.verification_status);

    const query = params.toString();
    return apiClient.get(`/stackstore/products${query ? `?${query}` : ''}`);
  },

  getProductById: async (id: string, storefront = true) => {
    const q = storefront ? '?storefront=true' : '';
    return apiClient.get(`/stackstore/products/${id}${q}`);
  },

  createProduct: async (product: Record<string, unknown>) => {
    return apiClient.post('/stackstore/products', product);
  },

  updateProduct: async (id: string, product: Record<string, unknown>) => {
    return apiClient.put(`/stackstore/products/${id}`, product);
  },

  verifyProduct: async (id: string, decision: 'approved' | 'rejected', rejection_reason?: string) => {
    return apiClient.post(`/stackstore/admin/products/${id}/verify`, { decision, rejection_reason });
  },

  deleteProduct: async (id: string) => {
    return apiClient.delete(`/stackstore/products/${id}`);
  },

  // Categories
  getCategories: async (filters?: { active?: boolean; includeInactive?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.append('active', String(filters.active));
    if (filters?.includeInactive) params.append('includeInactive', 'true');

    const query = params.toString();
    return apiClient.get(`/stackstore/categories${query ? `?${query}` : ''}`);
  },

  createCategory: async (category: Record<string, unknown>) => {
    return apiClient.post('/stackstore/categories', category);
  },

  updateCategory: async (id: string, category: Record<string, unknown>) => {
    return apiClient.put(`/stackstore/categories/${id}`, category);
  },

  deleteCategory: async (id: string) => {
    return apiClient.delete(`/stackstore/categories/${id}`);
  },

  // Orders
  getOrders: async (filters?: {
    user_id?: string;
    status?: string;
    payment_status?: string;
    escrow_status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.escrow_status) params.append('escrow_status', filters.escrow_status);

    const query = params.toString();
    return apiClient.get(`/stackstore/orders${query ? `?${query}` : ''}`);
  },

  getMyOrders: async () => {
    return apiClient.get('/stackstore/orders/me', userOpts);
  },

  checkout: async (payload: { product_id: string; buyer_note?: string }) => {
    return apiClient.post('/stackstore/checkout', payload, userOpts);
  },

  createOrder: async (order: Record<string, unknown>) => {
    return apiClient.post('/stackstore/orders', order);
  },

  updateOrder: async (id: string, order: Record<string, unknown>) => {
    return apiClient.put(`/stackstore/orders/${id}`, order);
  },

  // Sellers
  getSellers: async (filters?: { active?: boolean; includeInactive?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.append('active', String(filters.active));
    if (filters?.includeInactive) params.append('includeInactive', 'true');

    const query = params.toString();
    return apiClient.get(`/stackstore/sellers${query ? `?${query}` : ''}`);
  },

  createSeller: async (seller: Record<string, unknown>) => {
    return apiClient.post('/stackstore/sellers', seller);
  },

  updateSeller: async (id: string, seller: Record<string, unknown>) => {
    return apiClient.put(`/stackstore/sellers/${id}`, seller);
  },

  deleteSeller: async (id: string) => {
    return apiClient.delete(`/stackstore/sellers/${id}`);
  },

  // Seller applications
  submitSellerApplication: async (payload: Record<string, unknown>) => {
    return apiClient.post('/stackstore/applications', payload, userOpts);
  },

  getMySellerApplication: async () => {
    return apiClient.get('/stackstore/applications/me', userOpts);
  },

  listSellerApplications: async (status?: string) => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiClient.get(`/stackstore/admin/applications${q}`);
  },

  reviewSellerApplication: async (id: number, decision: 'approved' | 'rejected') => {
    return apiClient.post(`/stackstore/admin/applications/${id}/review`, { decision });
  },

  // Seller portal
  getMySellerProfile: async () => {
    return apiClient.get('/stackstore/seller/me', userOpts);
  },

  getMySellerProducts: async () => {
    return apiClient.get('/stackstore/seller/products', userOpts);
  },

  createMySellerProduct: async (payload: Record<string, unknown>) => {
    return apiClient.post('/stackstore/seller/products', payload, userOpts);
  },
};
