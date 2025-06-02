/**
 * Simple logger utility for debugging
 * Provides different log levels that can be enabled/disabled in different environments
 */

// Set to true to enable debug logs in production
const FORCE_ENABLE_LOGS = true;

// Determine if we're in development environment
const isDev = () => {
  return process.env.NODE_ENV === 'development' || FORCE_ENABLE_LOGS;
};

// Format timestamp for logs
const getTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
};

class Logger {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix ? `[${prefix}] ` : '';
  }

  /**
   * Log debug messages (only in development)
   */
  debug(...args: unknown[]): void {
    if (isDev()) {
      console.debug(`${getTimestamp()} ${this.prefix}🔍`, ...args);
    }
  }

  /**
   * Log info messages (only in development)
   */
  info(...args: unknown[]): void {
    if (isDev()) {
      console.info(`${getTimestamp()} ${this.prefix}ℹ️`, ...args);
    }
  }

  /**
   * Log warning messages
   */
  warn(...args: unknown[]): void {
    console.warn(`${getTimestamp()} ${this.prefix}⚠️`, ...args);
  }

  /**
   * Log error messages
   */
  error(...args: unknown[]): void {
    console.error(`${getTimestamp()} ${this.prefix}❌`, ...args);
  }

  /**
   * Create a new logger with a specific prefix
   */
  create(prefix: string): Logger {
    return new Logger(prefix);
  }
}

// Export a singleton instance
export const logger = new Logger(); 