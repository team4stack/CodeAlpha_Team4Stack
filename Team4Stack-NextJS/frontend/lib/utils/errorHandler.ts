// Secure Error Handler
// Sanitizes error messages to prevent exposing internal system information

export interface SanitizedError {
  message: string;
  code?: string;
  isUserFriendly: boolean;
}

/**
 * Sanitizes error messages to prevent exposing:
 * - Database structure
 * - Internal system information
 * - SQL queries
 * - Stack traces
 * - File paths
 * - Environment variables
 */
export function sanitizeError(error: any): SanitizedError {
  // If error is already sanitized, return it
  if (error && typeof error === 'object' && error.isUserFriendly) {
    return error as SanitizedError;
  }

  let errorMessage = 'An error occurred. Please try again.';
  let errorCode: string | undefined;

  // Handle different error types
  if (typeof error === 'string') {
    errorMessage = sanitizeErrorMessage(error);
  } else if (error?.message) {
    errorMessage = sanitizeErrorMessage(error.message);
  } else if (error?.error) {
    errorMessage = sanitizeErrorMessage(error.error);
  }

  // Extract safe error codes (only if they're user-friendly)
  if (error?.code && isSafeErrorCode(error.code)) {
    errorCode = error.code;
  }

  return {
    message: errorMessage,
    code: errorCode,
    isUserFriendly: true,
  };
}

/**
 * Sanitizes error message string to remove sensitive information
 */
function sanitizeErrorMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return 'An error occurred. Please try again.';
  }

  let sanitized = message;

  // Remove SQL queries
  sanitized = sanitized.replace(/CREATE TABLE[^;]*;?/gi, '[SQL query removed]');
  sanitized = sanitized.replace(/SELECT[^;]*;?/gi, '[SQL query removed]');
  sanitized = sanitized.replace(/INSERT[^;]*;?/gi, '[SQL query removed]');
  sanitized = sanitized.replace(/UPDATE[^;]*;?/gi, '[SQL query removed]');
  sanitized = sanitized.replace(/DELETE[^;]*;?/gi, '[SQL query removed]');
  sanitized = sanitized.replace(/ALTER[^;]*;?/gi, '[SQL query removed]');
  sanitized = sanitized.replace(/DROP[^;]*;?/gi, '[SQL query removed]');

  // Remove file paths
  sanitized = sanitized.replace(/[A-Z]:\\[^\s]+/gi, '[file path removed]');
  sanitized = sanitized.replace(/\/[^\s]+\.(ts|js|tsx|jsx)/g, '[file path removed]');

  // Remove environment variable references
  sanitized = sanitized.replace(/NEXT_PUBLIC_[A-Z_]+/g, '[env variable]');
  sanitized = sanitized.replace(/SUPABASE_[A-Z_]+/g, '[env variable]');
  sanitized = sanitized.replace(/process\.env\.[A-Z_]+/g, '[env variable]');

  // Remove database table/column names (common patterns)
  sanitized = sanitized.replace(/table\s+['"]?(\w+)['"]?/gi, 'table [hidden]');
  sanitized = sanitized.replace(/column\s+['"]?(\w+)['"]?/gi, 'column [hidden]');
  sanitized = sanitized.replace(/relation\s+['"]?(\w+)['"]?/gi, 'relation [hidden]');

  // Remove stack traces
  sanitized = sanitized.replace(/at\s+[^\n]+/g, '');
  sanitized = sanitized.replace(/Error:\s*[^\n]+/g, '');

  // Remove UUIDs and IDs that might expose data
  sanitized = sanitized.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[id]');

  // Remove connection strings
  sanitized = sanitized.replace(/postgresql:\/\/[^\s]+/gi, '[connection string]');
  sanitized = sanitized.replace(/https?:\/\/[^\s]+supabase[^\s]+/gi, '[connection string]');

  // Remove detailed error information
  sanitized = sanitized.replace(/details:\s*[^\n]+/gi, '');
  sanitized = sanitized.replace(/hint:\s*[^\n]+/gi, '');
  sanitized = sanitized.replace(/code:\s*[^\n]+/gi, '');

  // Map common database errors to user-friendly messages
  const errorMappings: Record<string, string> = {
    'does not exist': 'The requested resource was not found.',
    'already exists': 'This resource already exists.',
    'permission denied': 'You do not have permission to perform this action.',
    'foreign key': 'This operation cannot be completed due to related data.',
    'unique constraint': 'This value already exists. Please use a different value.',
    'not null': 'Required information is missing.',
    'invalid input': 'The provided information is invalid.',
    'connection': 'Unable to connect to the server. Please try again later.',
    'timeout': 'The request took too long. Please try again.',
    'network': 'Network error. Please check your connection.',
    'unauthorized': 'You are not authorized to perform this action.',
    'forbidden': 'Access denied.',
    'not found': 'The requested resource was not found.',
    'internal server error': 'A server error occurred. Please try again later.',
    'bad request': 'Invalid request. Please check your input.',
  };

  // Check for common error patterns and replace with user-friendly messages
  const lowerMessage = sanitized.toLowerCase();
  for (const [pattern, friendlyMessage] of Object.entries(errorMappings)) {
    if (lowerMessage.includes(pattern)) {
      return friendlyMessage;
    }
  }

  // If message is too technical or contains suspicious patterns, return generic message
  if (
    sanitized.includes('SQL') ||
    sanitized.includes('database') ||
    sanitized.includes('query') ||
    sanitized.includes('schema') ||
    sanitized.includes('migration') ||
    sanitized.length > 200
  ) {
    return 'An error occurred. Please try again or contact support if the problem persists.';
  }

  // Return sanitized message (truncate if too long)
  return sanitized.length > 150 ? sanitized.substring(0, 150) + '...' : sanitized;
}

/**
 * Checks if an error code is safe to expose to users
 */
function isSafeErrorCode(code: string): boolean {
  // Only allow specific user-friendly error codes
  const safeCodes = [
    'NOT_FOUND',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'VALIDATION_ERROR',
    'RATE_LIMIT_EXCEEDED',
    'BAD_REQUEST',
  ];

  return safeCodes.includes(code.toUpperCase());
}

/**
 * Logs error securely (only in development)
 */
export function logErrorSecurely(error: any, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    const sanitized = sanitizeError(error);
    console.error(`[Error${context ? ` in ${context}` : ''}]:`, {
      message: sanitized.message,
      code: sanitized.code,
      original: error,
    });
  }
  // In production, errors should be sent to error tracking service (Sentry, etc.)
  // but without exposing sensitive information
}
