// API Client for Backend
// This file handles all API calls to the backend server

import { getCookieConsent } from '@/lib/cookies/consent';
import { parseStoredClientAuthSession } from '@/lib/security/clientAuthSession';

/**
 * Prefer `NEXT_PUBLIC_API_URL` (must include `/api`).
 * Else use `NEXT_PUBLIC_BACKEND_URL` (e.g. http://localhost:5000) — `/api` is appended if missing.
 */
function resolvePublicApiBaseUrl(): string {
  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (api) {
    return api.replace(/\/$/, '');
  }
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (backend) {
    const b = backend.replace(/\/$/, '');
    return b.endsWith('/api') ? b : `${b}/api`;
  }
  return 'http://localhost:5000/api';
}

const API_BASE_URL = resolvePublicApiBaseUrl();

function readAuthSessionRawFromBrowser(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromLs = localStorage.getItem('auth_session');
    if (fromLs) return fromLs;
  } catch {
    /* ignore */
  }
  try {
    // Mirror AuthContext: cookie may hold tokens when localStorage is empty
    if (getCookieConsent() === 'essential') return null;
    const name = 'auth_session=';
    const all = document.cookie || '';
    const part = all.split('; ').find((c) => c.startsWith(name));
    if (!part) return null;
    const v = decodeURIComponent(part.slice(name.length));
    return v || null;
  } catch {
    return null;
  }
}

/** Optional auth mode for requests (not sent over the wire). */
export type ApiClientRequestInit = RequestInit & {
  /** `user-only` skips admin_session so student APIs see the Supabase JWT (fixes mixed admin+student tabs). */
  authMode?: 'default' | 'user-only';
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /** Supabase access token only (no admin_session). Uses localStorage then auth_session cookie. */
  private getUserOnlyAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try {
      const userRaw = readAuthSessionRawFromBrowser();
      if (!userRaw) return {};
      const session = parseStoredClientAuthSession(userRaw);
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch {
      /* ignore */
    }
    return {};
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
    return { ...this.getUserOnlyAuthHeaders() };
  }

  private async request<T>(
    endpoint: string,
    options: ApiClientRequestInit = {},
    retries = 2,
    retryDelay = 1000
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const { authMode = 'default', ...fetchInit } = options;
    const url = `${this.baseUrl}${endpoint}`;
    const REQUEST_TIMEOUT_MS = 45000;

    for (let attempt = 0; attempt <= retries; attempt++) {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      try {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const authHeaders =
          authMode === 'user-only' ? this.getUserOnlyAuthHeaders() : this.getAuthHeaders();

        const response = await fetch(url, {
          ...fetchInit,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
            ...fetchInit.headers,
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
            try {
              const errorData = await response.clone().json();
              const { sanitizeError } = await import('@/lib/utils/errorHandler');
              const sanitized = sanitizeError(errorData.error || errorData.message || '');
              if (sanitized.message && sanitized.message.length > 0) {
                errorMessage = sanitized.message;
              } else {
                errorMessage = 'Access denied. You do not have permission.';
              }
            } catch {
              errorMessage = 'Access denied. You do not have permission.';
            }
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
          // Sanitize error messages; in development we hint at the API base when the network fails
          let errorMessage = 'Unable to connect to the server. Please try again later.';

          const msg = String(error?.message || error || '');
          const isNetworkFail =
            msg.includes('fetch') ||
            msg.includes('Failed to fetch') ||
            msg.includes('Load failed') ||
            msg.includes('NetworkError') ||
            msg.includes('ERR_CONNECTION_REFUSED') ||
            msg.includes('ERR_NETWORK') ||
            msg.includes('ECONNREFUSED');

          if (isNetworkFail) {
            // Local dev: connection refused usually means Express API is not running
            errorMessage =
              process.env.NODE_ENV === 'development'
                ? 'API server not reachable. Start the backend: open a terminal, `cd backend`, run `npm run dev`, then refresh. (Expected URL: ' +
                  API_BASE_URL +
                  ')'
                : 'Unable to reach the service. Please try again in a moment.';
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
  async get<T>(
    endpoint: string,
    init?: ApiClientRequestInit
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, { method: 'GET', ...init });
  }

  // POST request
  async post<T>(
    endpoint: string,
    body?: any,
    init?: ApiClientRequestInit
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...init,
    });
  }

  // PUT request
  async put<T>(
    endpoint: string,
    body?: any,
    init?: ApiClientRequestInit
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...init,
    });
  }

  // DELETE request
  async delete<T>(
    endpoint: string,
    init?: ApiClientRequestInit
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, { method: 'DELETE', ...init });
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    body?: any,
    init?: ApiClientRequestInit
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...init,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
