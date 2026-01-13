// StackStore API endpoints
import apiClient from './client';

export const stackstoreApi = {
  // Products
  getProducts: async (filters?: { active?: boolean; category_id?: string }) => {
    const params = new URLSearchParams();
    if (filters?.active !== undefined) params.append('active', String(filters.active));
    if (filters?.category_id) params.append('category_id', filters.category_id);
    
    const query = params.toString();
    return apiClient.get(`/stackstore/products${query ? `?${query}` : ''}`);
  },

  getProductById: async (id: string) => {
    return apiClient.get(`/stackstore/products/${id}`);
  },

  createProduct: async (product: any) => {
    return apiClient.post('/stackstore/products', product);
  },

  updateProduct: async (id: string, product: any) => {
    return apiClient.put(`/stackstore/products/${id}`, product);
  },

  deleteProduct: async (id: string) => {
    return apiClient.delete(`/stackstore/products/${id}`);
  },

  // Categories
  getCategories: async () => {
    return apiClient.get('/stackstore/categories');
  },

  createCategory: async (category: any) => {
    return apiClient.post('/stackstore/categories', category);
  },

  updateCategory: async (id: string, category: any) => {
    return apiClient.put(`/stackstore/categories/${id}`, category);
  },

  deleteCategory: async (id: string) => {
    return apiClient.delete(`/stackstore/categories/${id}`);
  },

  // Orders
  getOrders: async (filters?: { user_id?: string; status?: string; payment_status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    
    const query = params.toString();
    return apiClient.get(`/stackstore/orders${query ? `?${query}` : ''}`);
  },

  createOrder: async (order: any) => {
    return apiClient.post('/stackstore/orders', order);
  },

  updateOrder: async (id: string, order: any) => {
    return apiClient.put(`/stackstore/orders/${id}`, order);
  },

  // Sellers
  getSellers: async () => {
    return apiClient.get('/stackstore/sellers');
  },

  createSeller: async (seller: any) => {
    return apiClient.post('/stackstore/sellers', seller);
  },

  updateSeller: async (id: string, seller: any) => {
    return apiClient.put(`/stackstore/sellers/${id}`, seller);
  },
};
