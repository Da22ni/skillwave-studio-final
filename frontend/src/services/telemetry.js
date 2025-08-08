// services/telemetry.js

// 🧠 English:
// Minimal telemetry service for tracking key user events and system health

// 💬 Español humano:
// Servicio mínimo de telemetría para rastrear eventos clave del usuario y salud del sistema

import { auth } from './firebase';

// Configuration
const TELEMETRY_CONFIG = {
  enabled: true,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  maxQueueSize: 100,
  endpoints: {
    firestore: true,  // Enable Firestore logging
    console: true,    // Enable console logging
    localStorage: true // Enable local storage for offline support
  }
};

// Event queue for batching
let eventQueue = [];
let lastFlush = Date.now();

// Initialize telemetry
let isInitialized = false;

const initTelemetry = () => {
  if (isInitialized) return;
  
  console.debug('📊 Telemetry service initialized');
  
  // Set up periodic flush
  setInterval(() => {
    if (eventQueue.length > 0) {
      flushEvents();
    }
  }, TELEMETRY_CONFIG.flushInterval);
  
  // Set up beforeunload flush
  window.addEventListener('beforeunload', () => {
    flushEvents(true);
  });
  
  isInitialized = true;
};

// Track key events
export const trackEvent = async (eventType, data = {}, options = {}) => {
  if (!TELEMETRY_CONFIG.enabled) return;
  
  initTelemetry();
  
  const event = {
    id: generateEventId(),
    type: eventType,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    userId: getUserId(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    data,
    ...options
  };
  
  // Add to queue
  eventQueue.push(event);
  
  // Console logging for development
  if (TELEMETRY_CONFIG.endpoints.console) {
    console.debug(`📊 [Telemetry] ${eventType}:`, data);
  }
  
  // Local storage for offline support
  if (TELEMETRY_CONFIG.endpoints.localStorage) {
    try {
      const stored = JSON.parse(localStorage.getItem('skillwave_telemetry') || '[]');
      stored.push(event);
      // Keep only last 50 events
      if (stored.length > 50) {
        stored.splice(0, stored.length - 50);
      }
      localStorage.setItem('skillwave_telemetry', JSON.stringify(stored));
    } catch (error) {
      console.warn('📊 Failed to store telemetry event locally:', error);
    }
  }
  
  // Flush if queue is full or enough time has passed
  if (eventQueue.length >= TELEMETRY_CONFIG.batchSize || 
      Date.now() - lastFlush > TELEMETRY_CONFIG.flushInterval) {
    await flushEvents();
  }
  
  return event.id;
};

// Flush events to backend
const flushEvents = async (immediate = false) => {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue = [];
  lastFlush = Date.now();
  
  console.debug(`📊 Flushing ${events.length} telemetry events`);
  
  try {
    // Send to Firestore (if available)
    if (TELEMETRY_CONFIG.endpoints.firestore) {
      await sendToFirestore(events);
    }
    
    // Send to backend (if available)
    await sendToBackend(events);
    
  } catch (error) {
    console.error('📊 Failed to flush telemetry events:', error);
    
    // Re-queue events on failure (unless immediate)
    if (!immediate) {
      eventQueue = [...events, ...eventQueue];
      // Limit queue size to prevent memory issues
      if (eventQueue.length > TELEMETRY_CONFIG.maxQueueSize) {
        eventQueue = eventQueue.slice(-TELEMETRY_CONFIG.maxQueueSize);
      }
    }
  }
};

// Send events to Firestore
const sendToFirestore = async (events) => {
  // TODO: Implement Firestore integration when needed
  // For now, just log that we would send to Firestore
  console.debug('📊 Would send to Firestore:', events.length, 'events');
};

// Send events to backend
const sendToBackend = async (events) => {
  try {
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    if (!backendUrl) {
      console.debug('📊 No backend URL - skipping backend telemetry');
      return;
    }
    
    const response = await fetch(`${backendUrl}/api/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.debug(`📊 Successfully sent ${events.length} events to backend`);
    
  } catch (error) {
    console.debug('📊 Backend telemetry unavailable:', error.message);
    // Don't throw - this is not critical
  }
};

// Utility functions
const generateEventId = () => {
  return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('skillwave_session_id');
  if (!sessionId) {
    sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('skillwave_session_id', sessionId);
  }
  return sessionId;
};

const getUserId = () => {
  const user = auth?.currentUser;
  return user ? user.uid : 'anonymous';
};

// Predefined event types
export const EVENTS = {
  // Authentication
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  DEMO_MODE_ENTERED: 'demo_mode_entered',
  
  // Editor Actions
  PROJECT_CREATED: 'project_created',
  PROJECT_OPENED: 'project_opened',
  PROJECT_SAVED: 'project_saved',
  ELEMENT_ADDED: 'element_added',
  ELEMENT_UPDATED: 'element_updated',
  ELEMENT_DELETED: 'element_deleted',
  ELEMENT_SELECTED: 'element_selected',
  
  // Export/Import
  PROJECT_EXPORTED: 'project_exported',
  CODE_PREVIEWED: 'code_previewed',
  
  // AI Interactions
  AI_EXPLANATION_REQUESTED: 'ai_explanation_requested',
  AI_EXPLANATION_RECEIVED: 'ai_explanation_received',
  AI_RATE_LIMITED: 'ai_rate_limited',
  
  // Performance
  PERFORMANCE_METRIC: 'performance_metric',
  ERROR_OCCURRED: 'error_occurred',
  
  // UI Interactions
  VIEW_MODE_CHANGED: 'view_mode_changed',
  TUTORIAL_STARTED: 'tutorial_started',
  TUTORIAL_COMPLETED: 'tutorial_completed',
  
  // System Health
  APP_LOADED: 'app_loaded',
  APP_ERROR: 'app_error',
  FEATURE_USED: 'feature_used'
};

// Convenience functions for common events
export const trackLogin = (method, success, error = null) => {
  trackEvent(success ? EVENTS.LOGIN_SUCCESS : EVENTS.LOGIN_FAILURE, {
    method,
    error: error?.message,
    timestamp: Date.now()
  });
};

export const trackElementAction = (action, elementType, elementId, metadata = {}) => {
  let eventType;
  switch (action) {
    case 'add': eventType = EVENTS.ELEMENT_ADDED; break;
    case 'update': eventType = EVENTS.ELEMENT_UPDATED; break;
    case 'delete': eventType = EVENTS.ELEMENT_DELETED; break;
    case 'select': eventType = EVENTS.ELEMENT_SELECTED; break;
    default: eventType = EVENTS.FEATURE_USED;
  }
  
  trackEvent(eventType, {
    elementType,
    elementId,
    action,
    ...metadata
  });
};

export const trackPerformanceMetric = (metric, value, context = {}) => {
  trackEvent(EVENTS.PERFORMANCE_METRIC, {
    metric,
    value,
    context,
    timestamp: Date.now()
  });
};

export const trackError = (error, context = {}, level = 'error') => {
  trackEvent(EVENTS.ERROR_OCCURRED, {
    message: error.message,
    stack: error.stack,
    context,
    level,
    timestamp: Date.now()
  });
};

export const trackAIUsage = (action, success, metadata = {}) => {
  let eventType;
  switch (action) {
    case 'request': eventType = EVENTS.AI_EXPLANATION_REQUESTED; break;
    case 'receive': eventType = EVENTS.AI_EXPLANATION_RECEIVED; break;
    case 'rate_limit': eventType = EVENTS.AI_RATE_LIMITED; break;
    default: eventType = EVENTS.FEATURE_USED;
  }
  
  trackEvent(eventType, {
    action,
    success,
    ...metadata
  });
};

// Get telemetry stats
export const getTelemetryStats = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('skillwave_telemetry') || '[]');
    const eventCounts = {};
    
    stored.forEach(event => {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
    });
    
    return {
      totalEvents: stored.length,
      queuedEvents: eventQueue.length,
      eventCounts,
      lastFlush: new Date(lastFlush).toISOString(),
      sessionId: getSessionId()
    };
  } catch (error) {
    console.warn('📊 Failed to get telemetry stats:', error);
    return {
      totalEvents: 0,
      queuedEvents: eventQueue.length,
      eventCounts: {},
      error: error.message
    };
  }
};

// Manual flush function
export const flushTelemetry = () => {
  return flushEvents(true);
};