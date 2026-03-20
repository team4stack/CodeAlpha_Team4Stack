// API Client for Backend
// This file handles all API calls to the backend server

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /** Admin panel token (sessionStorage) or Supabase access token (localStorage). */
  private getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try {
      const adminRaw = sessionStorage.getItem('admin_session');
      if (adminRaw) {
        const a = JSON.parse(adminRaw) as {
          apiToken?: string;
          expiresAt?: number;
        };
        const exp = typeof a.expiresAt === 'number' ? a.expiresAt : 0;
        if (a.apiToken && typeof a.apiToken === 'string' && (!exp || Date.now() < exp)) {
          return { Authorization: `Bearer ${a.apiToken}` };
        }
      }
    } catch {
      /* ignore */
    }
    try {
      const userRaw = localStorage.getItem('auth_session');
      if (userRaw) {
        const u = JSON.parse(userRaw) as { access_token?: string };
        if (u.access_token && typeof u.access_token === 'string') {
          return { Authorization: `Bearer ${u.access_token}` };
        }
      }
    } catch {
      /* ignore */
    }
    return {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2,
    retryDelay = 1000
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const url = `${this.baseUrl}${endpoint}`;
    const REQUEST_TIMEOUT_MS = 45000;

    for (let attempt = 0; attempt <= retries; attempt++) {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        });

        // Handle network errors (backend not running, CORS, etc.)
        if (!response.ok) {
          // Special handling for rate limiting (429) - retry with exponential backoff
          if (response.status === 429 && attempt < retries) {
            const delay = retryDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry the request
          }
          
          let errorMessage = 'An error occurred. Please try again.';
          
          if (response.status === 429) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          } else if (response.status === 401) {
            errorMessage = 'Invalid email or password.';
          } else if (response.status === 403) {
            errorMessage = 'Access denied. You do not have permission.';
          } else if (response.status === 404) {
            errorMessage = 'The requested resource was not found.';
          } else if (response.status === 500) {
            errorMessage = 'A server error occurred. Please try again later.';
          } else {
            try {
              const errorData = await response.json();
              // Always sanitize error message from backend to prevent exposing sensitive info
              const { sanitizeError } = await import('@/lib/utils/errorHandler');
              const sanitized = sanitizeError(errorData.error || errorData.message || '');
              errorMessage = sanitized.message;
            } catch {
              // If response is not JSON, use generic message
              errorMessage = 'An error occurred. Please try again.';
            }
          }
          
          // Return error instead of throwing
          return {
            success: false,
            error: errorMessage,
          };
        }

        const data = await response.json();
        return data;
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          if (attempt === retries) {
            return {
              success: false,
              error:
                'Request timed out. Make sure the backend is running (API) and try again.',
            };
          }
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // If this is the last attempt, return error
        if (attempt === retries) {
          // Sanitize error messages to prevent exposing internal information
          // NEVER expose backend URLs, server details, or technical errors to users
          let errorMessage = 'Unable to connect to the server. Please try again later.';
          
          // Check if it's a network error - use generic message for all network errors
          if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError') || error.message?.includes('ERR_CONNECTION_REFUSED') || error.message?.includes('ERR_NETWORK')) {
            // Generic message - never expose backend URL or technical details
            errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
          } else if (error.message) {
            // Sanitize error message - remove any sensitive information
            try {
              const { sanitizeError } = await import('@/lib/utils/errorHandler');
              const sanitized = sanitizeError(error);
              errorMessage = sanitized.message;
            } catch {
              // If error handler fails, use generic message
              errorMessage = 'An error occurred. Please try again.';
            }
          }
          
          return {
            success: false,
            error: errorMessage,
          };
        }
        
        // Retry on network errors with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    }
    
    // This should never be reached, but TypeScript needs it
    return {
      success: false,
      error: 'Request failed after retries',
    };
  }

  // GET request
  async get<T>(endpoint: string): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(
    endpoint: string,
    body?: any
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    body?: any
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    body?: any
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
