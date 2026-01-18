// API Client for Backend
// This file handles all API calls to the backend server

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2,
    retryDelay = 1000
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
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
            errorMessage = 'You are not authorized to perform this action.';
          } else if (response.status === 403) {
            errorMessage = 'Access denied. You do not have permission.';
          } else if (response.status === 404) {
            errorMessage = 'The requested resource was not found.';
          } else if (response.status === 500) {
            errorMessage = 'A server error occurred. Please try again later.';
          } else {
            try {
              const errorData = await response.json();
              // Sanitize error message from backend
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
        // If this is the last attempt, return error
        if (attempt === retries) {
          // Handle network errors (backend not running, connection refused, etc.)
          if (process.env.NODE_ENV === 'development') {
            console.error('API Error:', error);
          }
          
          // Sanitize error messages to prevent exposing internal information
          let errorMessage = 'Unable to connect to the server. Please try again later.';
          
          // Check if it's a network error
          if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
            errorMessage = 'Unable to connect to the server. Please check your connection and try again.';
          } else if (error.message) {
            // Sanitize error message
            const { sanitizeError } = await import('@/lib/utils/errorHandler');
            const sanitized = sanitizeError(error);
            errorMessage = sanitized.message;
          }
          
          return {
            success: false,
            error: errorMessage,
          };
        }
        
        // Retry on network errors with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
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
