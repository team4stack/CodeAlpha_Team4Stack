// Secure Error Handling Hook
// Provides a consistent way to handle errors securely across the application

import { useCallback } from 'react';
import { sanitizeError, logErrorSecurely, SanitizedError } from '@/lib/utils/errorHandler';

export function useSecureError() {
  const handleError = useCallback((error: any, context?: string): SanitizedError => {
    logErrorSecurely(error, context);
    return sanitizeError(error);
  }, []);

  const getErrorMessage = useCallback((error: any): string => {
    return sanitizeError(error).message;
  }, []);

  return {
    handleError,
    getErrorMessage,
    sanitizeError,
  };
}
