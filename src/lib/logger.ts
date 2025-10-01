/**
 * Centralized error logging utility
 * Provides structured error handling without exposing sensitive information in production
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      const contextStr = context ? `\nContext: ${JSON.stringify(context, null, 2)}` : '';
      
      switch (level) {
        case 'error':
          console.error(`[${timestamp}] ERROR: ${message}${contextStr}`);
          break;
        case 'warn':
          console.warn(`[${timestamp}] WARN: ${message}${contextStr}`);
          break;
        case 'info':
          console.info(`[${timestamp}] INFO: ${message}${contextStr}`);
          break;
      }
    }
    
    // In production, you could send errors to a monitoring service here
    // Example: Sentry, LogRocket, or custom logging endpoint
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }
}

export const logger = new Logger();
