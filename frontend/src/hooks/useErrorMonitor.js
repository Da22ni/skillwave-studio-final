// hooks/useErrorMonitor.js

import { useState, useEffect, useCallback } from 'react';
import { useLogger } from './useLogger';

export const useErrorMonitor = () => {
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const { logError } = useLogger();

  // Error levels
  const ERROR_LEVELS = {
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    DEBUG: 'debug'
  };

  // Add error to the monitor
  const addError = useCallback((error, level = ERROR_LEVELS.ERROR, context = '') => {
    const errorEntry = {
      id: Date.now() + Math.random(),
      message: error.message || error,
      stack: error.stack,
      level,
      context,
      timestamp: new Date().toISOString(),
      component: context || 'Unknown'
    };

    if (level === ERROR_LEVELS.ERROR) {
      setErrors(prev => [errorEntry, ...prev].slice(0, 50)); // Keep last 50 errors
      logError('ui_error_captured', { error: errorEntry });
    } else if (level === ERROR_LEVELS.WARNING) {
      setWarnings(prev => [errorEntry, ...prev].slice(0, 30)); // Keep last 30 warnings
    }
  }, [logError]);

  // Add warning
  const addWarning = useCallback((message, context = '') => {
    addError({ message }, ERROR_LEVELS.WARNING, context);
  }, [addError]);

  // Clear errors
  const clearErrors = useCallback(() => {
    setErrors([]);
    setWarnings([]);
  }, []);

  // Global error handler
  useEffect(() => {
    const handleError = (event) => {
      addError(event.error, ERROR_LEVELS.ERROR, 'Global Error Handler');
    };

    const handleUnhandledRejection = (event) => {
      addError(event.reason, ERROR_LEVELS.ERROR, 'Unhandled Promise Rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Override console.error to capture throwIf errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('throwIf') || message.includes('validateBlocks')) {
        addError({ message }, ERROR_LEVELS.ERROR, 'Validation Error');
      }
      originalConsoleError.apply(console, args);
    };

    // Override console.warn for canvas warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('Canvas') || message.includes('Editor')) {
        addWarning(message, 'Canvas Warning');
      }
      originalConsoleWarn.apply(console, args);
    };

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [addError, addWarning]);

  // Expose methods for manual error reporting
  const reportError = useCallback((error, context) => {
    addError(error, ERROR_LEVELS.ERROR, context);
  }, [addError]);

  const reportWarning = useCallback((message, context) => {
    addWarning(message, context);
  }, [addWarning]);

  return {
    errors,
    warnings,
    isVisible,
    setIsVisible,
    clearErrors,
    reportError,
    reportWarning,
    totalErrorCount: errors.length,
    totalWarningCount: warnings.length
  };
};