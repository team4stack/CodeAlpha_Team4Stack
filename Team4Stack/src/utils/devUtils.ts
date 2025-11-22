// Development Utilities
// This file contains utility functions for development mode checks and logging

/**
 * Check if the application is running in development mode
 * @returns boolean - true if in development mode, false otherwise
 */
export const isDevelopmentMode = (): boolean => {
  // Check if we're in a Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'development';
  }
  
  // Fallback for browser environments
  return false;
};

/**
 * Log message only in development mode
 * @param message - The message to log
 * @param optionalParams - Additional parameters to log
 */
export const devLog = (message?: any, ...optionalParams: any[]): void => {
  if (isDevelopmentMode()) {
    console.log(message, ...optionalParams);
  }
};

/**
 * Log warning only in development mode
 * @param message - The warning message to log
 * @param optionalParams - Additional parameters to log
 */
export const devWarn = (message?: any, ...optionalParams: any[]): void => {
  if (isDevelopmentMode()) {
    console.warn(message, ...optionalParams);
  }
};

/**
 * Log error only in development mode
 * @param message - The error message to log
 * @param optionalParams - Additional parameters to log
 */
export const devError = (message?: any, ...optionalParams: any[]): void => {
  if (isDevelopmentMode()) {
    console.error(message, ...optionalParams);
  }
};

/**
 * Log info only in development mode
 * @param message - The info message to log
 * @param optionalParams - Additional parameters to log
 */
export const devInfo = (message?: any, ...optionalParams: any[]): void => {
  if (isDevelopmentMode()) {
    console.info(message, ...optionalParams);
  }
};

/**
 * Log debug only in development mode
 * @param message - The debug message to log
 * @param optionalParams - Additional parameters to log
 */
export const devDebug = (message?: any, ...optionalParams: any[]): void => {
  if (isDevelopmentMode()) {
    console.debug(message, ...optionalParams);
  }
};

/**
 * Start a group only in development mode
 * @param groupTitle - The title of the group
 * @param styling - Optional CSS styling for the group title
 */
export const devGroup = (groupTitle?: string, styling?: string): void => {
  if (isDevelopmentMode()) {
    if (styling) {
      console.group(`%c${groupTitle}`, styling);
    } else {
      console.group(groupTitle);
    }
  }
};

/**
 * End a group only in development mode
 */
export const devGroupEnd = (): void => {
  if (isDevelopmentMode()) {
    console.groupEnd();
  }
};