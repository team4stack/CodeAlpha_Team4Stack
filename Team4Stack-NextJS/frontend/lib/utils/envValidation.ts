/**
 * Environment Variable Validation Utility
 * Validates required environment variables and provides helpful error messages
 */

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_YOUTUBE_API_KEY?: string;
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY?: string;
}

/**
 * Validates required environment variables
 * @returns Object with validation results
 */
export const validateEnvVars = (): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} => {
  const required: (keyof EnvConfig)[] = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const optional: (keyof EnvConfig)[] = ['NEXT_PUBLIC_YOUTUBE_API_KEY', 'NEXT_PUBLIC_RECAPTCHA_SITE_KEY'];
  
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  required.forEach((key) => {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push(key);
    }
  });

  // Check optional variables (warnings only)
  optional.forEach((key) => {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      warnings.push(key);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    warnings
  };
};

/**
 * Logs environment variable validation results (dev only)
 */
export const logEnvValidation = (): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const { isValid, missing, warnings } = validateEnvVars();

  if (!isValid) {
    console.warn('⚠️ Missing required environment variables:', missing);
    console.warn('Please create a .env file with the required variables.');
  }

  if (warnings.length > 0) {
    console.info('ℹ️ Optional environment variables not set:', warnings);
    console.info('Some features may not work without these variables.');
  }
};

