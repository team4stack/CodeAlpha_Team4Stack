// Secure Error Handler
// Sanitizes error messages to prevent exposing internal system information

export interface SanitizedError {
  message: string;
  code?: string;
  isUserFriendly: boolean;
}

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

const EXACT_FRIENDLY_MESSAGES = new Set([
  'please fill in all required fields',
  'passwords do not match',
  'password must be at least 6 characters',
  'password must be at least 8 characters and include letters, numbers, and a special character.',
  'password must be at least 8 characters and include letters, numbers, and special characters.',
  'username is required',
  'please enter both email and password',
  'please enter both email and password.',
  'please complete the recaptcha verification',
  'invalid email or password.',
  'invalid email or password',
  'invalid email or username.',
  'sign in required to message a developer',
  'sign in required',
  'authentication required',
  'access denied. super admin privileges required.',
  'access denied. please grant the required permissions.',
  'invalid verification code. please try again.',
  'verification code has expired. please request a new one.',
  'failed to send verification code. please try again.',
  'failed to resend verification code. please try again.',
]);

const CONTEXTUAL_TECHNICAL_MESSAGES: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern: /verification code|verify.*email|otp|resend.*code/i,
    message: 'We could not send the verification code. Please try again in a few minutes.',
  },
  {
    pattern: /oauth|google|github|external code|provider/i,
    message: 'Sign in with this provider is not available right now. Please use email sign in or try again later.',
  },
  {
    pattern: /emailjs|smtp|mail service|send.*email|password reset email/i,
    message: 'We could not send the email right now. Please try again in a few minutes.',
  },
  {
    pattern: /migration|supabase|postgres|database|pgrst|relation|sql/i,
    message: 'This feature is temporarily unavailable. Please try again later or contact support.',
  },
  {
    pattern: /cloudinary|upload|storage|bucket/i,
    message: 'We could not upload your file. Please try again.',
  },
  {
    pattern: /recaptcha|captcha/i,
    message: 'Please complete the security check and try again.',
  },
  {
    pattern: /youtube|api key|cloud api/i,
    message: 'We could not load this content right now. Please try again later.',
  },
  {
    pattern: /session|token|jwt|unauthorized|401|403|forbidden/i,
    message: 'Your session has expired. Please sign in again.',
  },
  {
    pattern: /network|fetch|connection|timeout|econnrefused|err_/i,
    message: 'Unable to connect. Please check your internet connection and try again.',
  },
];

const ERROR_MAPPINGS: Record<string, string> = {
  'does not exist': 'The requested item was not found.',
  'already exists': 'This already exists. Please use a different value.',
  'permission denied': 'You do not have permission to perform this action.',
  'foreign key': 'This action cannot be completed because related data exists.',
  'unique constraint': 'This value is already in use. Please choose another one.',
  'not null': 'Required information is missing.',
  'invalid input': 'Some information is invalid. Please check and try again.',
  'connection': 'Unable to connect right now. Please try again later.',
  'connection refused': 'Unable to connect right now. Please try again later.',
  'err_connection_refused': 'Unable to connect right now. Please try again later.',
  'backend': 'Unable to connect right now. Please try again later.',
  'timeout': 'The request took too long. Please try again.',
  'network': 'Network error. Please check your connection and try again.',
  'unauthorized': 'Please sign in to continue.',
  'forbidden': 'You do not have access to do that.',
  'not found': 'The requested item was not found.',
  'internal server error': 'A server error occurred. Please try again later.',
  'bad request': 'Invalid request. Please check your input and try again.',
  'invalid login credentials': 'Invalid email or password.',
  'email not confirmed': 'Please verify your email before signing in.',
  'user already registered': 'An account with this email already exists.',
  'invalid email': 'Please enter a valid email address.',
  'username already taken': 'Username already taken. Please choose another one.',
  'too many requests': 'Too many attempts. Please wait a moment and try again.',
  'rate limit': 'Too many attempts. Please wait a moment and try again.',
};

const TECHNICAL_KEYWORDS = [
  'emailjs',
  'supabase',
  'oauth',
  'configuration',
  'config',
  'migration',
  'postgres',
  'postgresql',
  'sql',
  'schema',
  'query',
  'pgrst',
  'cloudinary',
  'template_id',
  'service_id',
  'public_key',
  'api_key',
  'api key',
  'env variable',
  'process.env',
  'next_public_',
  'stack trace',
  'typeerror',
  'referenceerror',
  'syntaxerror',
  'undefined is not',
  'cannot read propert',
  'localhost',
  '127.0.0.1',
  'dashboard',
  'npm ',
  'node_modules',
  'exception',
  'errno',
  'econn',
  'jwt',
  'bearer',
  'rls policy',
];

/**
 * Sanitizes error messages to prevent exposing:
 * - Database structure
 * - Internal system information
 * - SQL queries
 * - Stack traces
 * - File paths
 * - Environment variables
 */
export function sanitizeError(error: unknown): SanitizedError {
  if (error && typeof error === 'object' && (error as SanitizedError).isUserFriendly) {
    return error as SanitizedError;
  }

  let errorMessage = DEFAULT_MESSAGE;
  let errorCode: string | undefined;

  if (typeof error === 'string') {
    errorMessage = sanitizeErrorMessage(error);
  } else if (error && typeof error === 'object') {
    const record = error as { message?: string; error?: string; code?: string };
    if (record.message) {
      errorMessage = sanitizeErrorMessage(record.message);
    } else if (record.error) {
      errorMessage = sanitizeErrorMessage(record.error);
    }
    if (record.code && isSafeErrorCode(record.code)) {
      errorCode = record.code;
    }
  }

  return {
    message: errorMessage,
    code: errorCode,
    isUserFriendly: true,
  };
}

/** Convenience helper for UI error state. */
export function getUserFriendlyMessage(
  error: unknown,
  fallback = DEFAULT_MESSAGE
): string {
  const sanitized = sanitizeError(error);
  return sanitized.message || fallback;
}

/**
 * Sanitizes error message string to remove sensitive information
 */
function sanitizeErrorMessage(message: string): string {
  if (!message || typeof message !== 'string') {
    return DEFAULT_MESSAGE;
  }

  const trimmed = message.trim();
  if (!trimmed) return DEFAULT_MESSAGE;

  const normalized = trimmed.toLowerCase();
  if (EXACT_FRIENDLY_MESSAGES.has(normalized)) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  let sanitized = trimmed;

  sanitized = sanitized.replace(/CREATE TABLE[^;]*;?/gi, '');
  sanitized = sanitized.replace(/SELECT[^;]*;?/gi, '');
  sanitized = sanitized.replace(/INSERT[^;]*;?/gi, '');
  sanitized = sanitized.replace(/UPDATE[^;]*;?/gi, '');
  sanitized = sanitized.replace(/DELETE[^;]*;?/gi, '');
  sanitized = sanitized.replace(/ALTER[^;]*;?/gi, '');
  sanitized = sanitized.replace(/DROP[^;]*;?/gi, '');

  sanitized = sanitized.replace(/[A-Z]:\\[^\s]+/gi, '');
  sanitized = sanitized.replace(/\/[^\s]+\.(ts|js|tsx|jsx)/g, '');
  sanitized = sanitized.replace(/NEXT_PUBLIC_[A-Z_]+/g, '');
  sanitized = sanitized.replace(/SUPABASE_[A-Z_]+/g, '');
  sanitized = sanitized.replace(/process\.env\.[A-Z_]+/g, '');
  sanitized = sanitized.replace(/table\s+['"]?(\w+)['"]?/gi, 'resource');
  sanitized = sanitized.replace(/column\s+['"]?(\w+)['"]?/gi, 'field');
  sanitized = sanitized.replace(/relation\s+['"]?(\w+)['"]?/gi, 'resource');
  sanitized = sanitized.replace(/at\s+[^\n]+/g, '');
  sanitized = sanitized.replace(/Error:\s*/gi, '');
  sanitized = sanitized.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '');
  sanitized = sanitized.replace(/postgresql:\/\/[^\s]+/gi, '');
  sanitized = sanitized.replace(/https?:\/\/[^\s]+supabase[^\s]+/gi, '');
  sanitized = sanitized.replace(/https?:\/\/localhost[^\s]*/gi, '');
  sanitized = sanitized.replace(/https?:\/\/127\.0\.0\.1[^\s]*/gi, '');
  sanitized = sanitized.replace(/http:\/\/localhost:\d+/gi, '');
  sanitized = sanitized.replace(/make sure the backend is running/gi, 'please try again later');
  sanitized = sanitized.replace(/Backend URL:[^\s]*/gi, '');
  sanitized = sanitized.replace(/details:\s*[^\n]+/gi, '');
  sanitized = sanitized.replace(/hint:\s*[^\n]+/gi, '');
  sanitized = sanitized.replace(/code:\s*[^\n]+/gi, '');

  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  if (!sanitized) return DEFAULT_MESSAGE;

  const lowerMessage = sanitized.toLowerCase();

  for (const [pattern, friendlyMessage] of Object.entries(ERROR_MAPPINGS)) {
    if (lowerMessage.includes(pattern)) {
      return friendlyMessage;
    }
  }

  for (const { pattern, message } of CONTEXTUAL_TECHNICAL_MESSAGES) {
    if (pattern.test(sanitized)) {
      return message;
    }
  }

  if (containsTechnicalContent(lowerMessage) || looksLikeInternalError(sanitized)) {
    return DEFAULT_MESSAGE;
  }

  if (isProbablyUserFacingMessage(sanitized)) {
    return sanitized.length > 150 ? `${sanitized.substring(0, 147)}...` : sanitized;
  }

  return DEFAULT_MESSAGE;
}

function containsTechnicalContent(lowerMessage: string): boolean {
  return TECHNICAL_KEYWORDS.some((keyword) => lowerMessage.includes(keyword));
}

function looksLikeInternalError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('sql') ||
    lower.includes('database') ||
    lower.includes('query') ||
    lower.includes('schema') ||
    lower.includes('migration') ||
    message.length > 200 ||
    /\bat\s+\w+/i.test(message) ||
    /[{}\[\]\\]/.test(message)
  );
}

function isProbablyUserFacingMessage(message: string): boolean {
  const lower = message.toLowerCase();
  if (containsTechnicalContent(lower)) return false;
  if (message.length > 140) return false;

  const allowedStarts = [
    'please',
    'invalid',
    'password',
    'username',
    'sign',
    'email',
    'access',
    'you ',
    'the ',
    'new ',
    'current ',
    'verification',
    'account',
    'session',
    'required',
    'must ',
    'already ',
    'failed to',
    'could not',
    'unable to',
    'too many',
    'we ',
    'this ',
    'enter ',
    'choose ',
    'complete ',
    'incorrect',
    'messaging',
    'admin',
    'title is',
    'project',
    'task',
    'notification',
    'deliverable',
    'milestone',
    'developer',
    'application',
    'course',
    'image',
    'file',
  ];

  return allowedStarts.some((prefix) => lower.startsWith(prefix));
}

function isSafeErrorCode(code: string): boolean {
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

export function logErrorSecurely(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error${context ? ` in ${context}` : ''}]:`, {
      message: sanitizeError(error).message,
      original: error,
    });
  }
}
