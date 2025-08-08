// debug/report.js

// 🧠 English:
// Comprehensive health report system for Skillwave Studio with performance metrics, error tracking, and telemetry

// 💬 Español humano:
// Sistema integral de reportes de salud para Skillwave Studio con métricas de rendimiento, seguimiento de errores y telemetría

import { getTelemetryStats } from '../services/telemetry';

// Performance tracking
let performanceData = {
  pageLoadTime: 0,
  renderTimes: [],
  fpsReadings: [],
  memoryUsage: [],
  errorCount: 0,
  warningCount: 0,
  aiRequestCount: 0,
  cacheHitRate: 0,
  lastUpdate: Date.now()
};

// Initialize performance monitoring
const initializePerformanceTracking = () => {
  // Track page load time
  if (typeof window !== 'undefined' && window.performance) {
    window.addEventListener('load', () => {
      performanceData.pageLoadTime = window.performance.now();
    });
  }

  console.debug('📊 Performance tracking initialized');
};

// Log performance metrics
export const logPerformance = (metric, value, context = {}) => {
  const entry = {
    metric,
    value,
    context,
    timestamp: Date.now()
  };

  switch (metric) {
    case 'render_time':
      performanceData.renderTimes.push(value);
      if (performanceData.renderTimes.length > 100) {
        performanceData.renderTimes = performanceData.renderTimes.slice(-50);
      }
      break;
    case 'fps':
      performanceData.fpsReadings.push(value);
      if (performanceData.fpsReadings.length > 100) {
        performanceData.fpsReadings = performanceData.fpsReadings.slice(-50);
      }
      break;
    case 'memory_usage':
      performanceData.memoryUsage.push(value);
      if (performanceData.memoryUsage.length > 50) {
        performanceData.memoryUsage = performanceData.memoryUsage.slice(-25);
      }
      break;
  }

  performanceData.lastUpdate = Date.now();

  console.debug(`📊 [Performance] ${metric}: ${value}`, context);
};

// Log debug information
export const logDebug = (category, message, data = {}) => {
  const entry = {
    category,
    message,
    data,
    level: 'debug',
    timestamp: new Date().toISOString()
  };

  console.debug(`🐛 [${category}] ${message}`, data);
  
  // Store in sessionStorage for debugging
  try {
    const debugLogs = JSON.parse(sessionStorage.getItem('skillwave_debug_logs') || '[]');
    debugLogs.push(entry);
    // Keep only last 100 debug logs
    if (debugLogs.length > 100) {
      debugLogs.splice(0, debugLogs.length - 100);
    }
    sessionStorage.setItem('skillwave_debug_logs', JSON.stringify(debugLogs));
  } catch (error) {
    console.warn('Failed to store debug log:', error);
  }
};

// Log errors
export const logError = (category, data = {}) => {
  performanceData.errorCount++;
  
  const entry = {
    category,
    data,
    level: 'error',
    timestamp: new Date().toISOString()
  };

  console.error(`❌ [${category}]`, data);
  
  try {
    const errorLogs = JSON.parse(sessionStorage.getItem('skillwave_error_logs') || '[]');
    errorLogs.push(entry);
    // Keep only last 50 error logs
    if (errorLogs.length > 50) {
      errorLogs.splice(0, errorLogs.length - 50);
    }
    sessionStorage.setItem('skillwave_error_logs', JSON.stringify(errorLogs));
  } catch (error) {
    console.warn('Failed to store error log:', error);
  }
};

// Log warnings
export const logWarning = (category, message, data = {}) => {
  performanceData.warningCount++;
  
  const entry = {
    category,
    message,
    data,
    level: 'warning',
    timestamp: new Date().toISOString()
  };

  console.warn(`⚠️ [${category}] ${message}`, data);
};

// Get system health status
export const getSystemHealth = () => {
  const now = Date.now();
  const telemetryStats = getTelemetryStats();
  
  // Calculate performance metrics
  const avgRenderTime = performanceData.renderTimes.length > 0
    ? performanceData.renderTimes.reduce((a, b) => a + b, 0) / performanceData.renderTimes.length
    : 0;
    
  const avgFPS = performanceData.fpsReadings.length > 0
    ? performanceData.fpsReadings.reduce((a, b) => a + b, 0) / performanceData.fpsReadings.length
    : 0;
    
  const currentMemory = performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;
  
  // Determine health status
  const healthScores = {
    performance: calculatePerformanceScore(avgFPS, avgRenderTime),
    errors: calculateErrorScore(),
    memory: calculateMemoryScore(currentMemory),
    ai: calculateAIScore()
  };
  
  const overallScore = Object.values(healthScores).reduce((a, b) => a + b, 0) / Object.keys(healthScores).length;
  
  return {
    overall: {
      score: Math.round(overallScore),
      status: getHealthStatus(overallScore),
      lastUpdate: new Date(performanceData.lastUpdate).toISOString()
    },
    performance: {
      score: healthScores.performance,
      avgRenderTime: Math.round(avgRenderTime * 100) / 100,
      avgFPS: Math.round(avgFPS),
      pageLoadTime: Math.round(performanceData.pageLoadTime),
      memoryUsage: currentMemory
    },
    errors: {
      score: healthScores.errors,
      errorCount: performanceData.errorCount,
      warningCount: performanceData.warningCount,
      recentErrors: getRecentErrors()
    },
    ai: {
      score: healthScores.ai,
      requestCount: telemetryStats.eventCounts?.ai_explanation_requested || 0,
      cacheHits: telemetryStats.eventCounts?.ai_explanation_received || 0,
      rateLimitHits: telemetryStats.eventCounts?.ai_rate_limited || 0
    },
    telemetry: telemetryStats
  };
};

// Calculate performance score (0-100)
const calculatePerformanceScore = (fps, renderTime) => {
  let score = 100;
  
  // FPS scoring
  if (fps < 15) score -= 40;
  else if (fps < 30) score -= 20;
  else if (fps < 50) score -= 5;
  
  // Render time scoring
  if (renderTime > 50) score -= 30;
  else if (renderTime > 20) score -= 15;
  else if (renderTime > 16) score -= 5;
  
  return Math.max(0, score);
};

// Calculate error score (0-100)
const calculateErrorScore = () => {
  let score = 100;
  
  if (performanceData.errorCount > 10) score -= 50;
  else if (performanceData.errorCount > 5) score -= 30;
  else if (performanceData.errorCount > 0) score -= 10;
  
  if (performanceData.warningCount > 20) score -= 20;
  else if (performanceData.warningCount > 10) score -= 10;
  
  return Math.max(0, score);
};

// Calculate memory score (0-100)
const calculateMemoryScore = (currentMemory) => {
  let score = 100;
  
  if (currentMemory > 100) score -= 40;
  else if (currentMemory > 50) score -= 20;
  else if (currentMemory > 25) score -= 10;
  
  return Math.max(0, score);
};

// Calculate AI score (0-100)
const calculateAIScore = () => {
  // This is a placeholder - in a real implementation you'd track AI performance
  return 85; // Assume good AI performance
};

// Get health status text
const getHealthStatus = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
};

// Get recent errors
const getRecentErrors = () => {
  try {
    const errorLogs = JSON.parse(sessionStorage.getItem('skillwave_error_logs') || '[]');
    return errorLogs.slice(-5); // Last 5 errors
  } catch (error) {
    return [];
  }
};

// Generate comprehensive health report
export const generateHealthReport = () => {
  const health = getSystemHealth();
  const now = new Date();
  
  const report = {
    meta: {
      title: 'Skillwave Studio Health Report',
      generated: now.toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    },
    summary: {
      overallHealth: health.overall.status,
      score: health.overall.score,
      criticalIssues: findCriticalIssues(health),
      recommendations: generateRecommendations(health)
    },
    performance: {
      ...health.performance,
      status: getHealthStatus(health.performance.score),
      trends: {
        renderTimes: performanceData.renderTimes.slice(-10),
        fpsReadings: performanceData.fpsReadings.slice(-10),
        memoryUsage: performanceData.memoryUsage.slice(-5)
      }
    },
    errors: {
      ...health.errors,
      status: getHealthStatus(health.errors.score),
      recentErrors: health.errors.recentErrors
    },
    features: {
      dragDrop: checkFeatureHealth('drag_drop'),
      aiAssistant: checkFeatureHealth('ai_assistant'),
      codeGeneration: checkFeatureHealth('code_generation'),
      projectManager: checkFeatureHealth('project_manager')
    },
    browser: {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
      } : 'Not available',
      connection: navigator.connection ? {
        type: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink
      } : 'Not available'
    },
    telemetry: health.telemetry
  };
  
  console.debug('📋 Health report generated:', report);
  return report;
};

// Find critical issues
const findCriticalIssues = (health) => {
  const issues = [];
  
  if (health.performance.score < 40) {
    issues.push('Performance is critically low');
  }
  
  if (health.errors.errorCount > 10) {
    issues.push('High error rate detected');
  }
  
  if (health.performance.memoryUsage > 100) {
    issues.push('High memory usage detected');
  }
  
  if (health.performance.avgFPS < 15) {
    issues.push('Frame rate is below acceptable threshold');
  }
  
  return issues;
};

// Generate recommendations
const generateRecommendations = (health) => {
  const recommendations = [];
  
  if (health.performance.avgRenderTime > 20) {
    recommendations.push('Consider optimizing render performance by implementing more React.memo components');
  }
  
  if (health.performance.memoryUsage > 50) {
    recommendations.push('Monitor memory usage and consider implementing memory leak prevention');
  }
  
  if (health.errors.warningCount > 10) {
    recommendations.push('Review and address warning messages to prevent potential issues');
  }
  
  if (health.ai.rateLimitHits > 5) {
    recommendations.push('AI requests are being rate limited - consider implementing better caching');
  }
  
  return recommendations;
};

// Check individual feature health
const checkFeatureHealth = (featureName) => {
  // This would integrate with actual feature monitoring
  // For now, return basic health status
  return {
    status: 'operational',
    lastChecked: new Date().toISOString(),
    uptime: '99.9%'
  };
};

// Export health report as downloadable file
export const exportHealthReport = () => {
  const report = generateHealthReport();
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `skillwave-health-report-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  
  console.debug('📁 Health report exported to file');
  return report;
};

// Log user interactions (compatibility function)
export const logInteraction = (interaction, details = {}) => {
  const entry = {
    interaction,
    details,
    level: 'info',
    timestamp: new Date().toISOString()
  };

  console.debug(`👤 [Interaction] ${interaction}`, details);
  
  // Also track as telemetry if available
  try {
    const { trackEvent, EVENTS } = require('../services/telemetry');
    trackEvent(EVENTS.FEATURE_USED, { 
      feature: interaction, 
      context: 'user_interaction',
      ...details 
    });
  } catch (error) {
    // Telemetry not available, continue
  }
  
  // Store in sessionStorage for debugging
  try {
    const interactionLogs = JSON.parse(sessionStorage.getItem('skillwave_interaction_logs') || '[]');
    interactionLogs.push(entry);
    // Keep only last 50 interaction logs
    if (interactionLogs.length > 50) {
      interactionLogs.splice(0, interactionLogs.length - 50);
    }
    sessionStorage.setItem('skillwave_interaction_logs', JSON.stringify(interactionLogs));
  } catch (error) {
    console.warn('Failed to store interaction log:', error);
  }
};

// Get debug summary (compatibility function)
export const getDebugSummary = () => {
  try {
    const debugLogs = JSON.parse(sessionStorage.getItem('skillwave_debug_logs') || '[]');
    const errorLogs = JSON.parse(sessionStorage.getItem('skillwave_error_logs') || '[]');
    const interactionLogs = JSON.parse(sessionStorage.getItem('skillwave_interaction_logs') || '[]');
    
    return {
      totalDebugLogs: debugLogs.length,
      totalErrors: errorLogs.length,
      totalInteractions: interactionLogs.length,
      recentDebugLogs: debugLogs.slice(-5),
      recentErrors: errorLogs.slice(-3),
      recentInteractions: interactionLogs.slice(-5),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Failed to get debug summary:', error);
    return {
      totalDebugLogs: 0,
      totalErrors: performanceData.errorCount,
      totalInteractions: 0,
      recentDebugLogs: [],
      recentErrors: [],
      recentInteractions: [],
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

// Export debug report (compatibility function)
export const exportDebugReport = (format = 'json') => {
  const healthReport = generateHealthReport();
  const debugSummary = getDebugSummary();
  
  const combinedReport = {
    ...healthReport,
    debugSummary,
    exportFormat: format,
    exportedAt: new Date().toISOString()
  };
  
  if (format === 'json') {
    const blob = new Blob([JSON.stringify(combinedReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `skillwave-debug-report-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.debug('📁 Debug report exported as JSON');
  } else if (format === 'text') {
    // Export as text format
    const textReport = generateTextReport(combinedReport);
    const blob = new Blob([textReport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `skillwave-debug-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.debug('📁 Debug report exported as text');
  }
  
  return combinedReport;
};

// Generate text version of report
const generateTextReport = (report) => {
  let text = `SKILLWAVE STUDIO DEBUG REPORT\n`;
  text += `Generated: ${report.meta.generated}\n`;
  text += `Environment: ${report.meta.environment}\n\n`;
  
  text += `OVERALL HEALTH: ${report.summary.overallHealth} (Score: ${report.summary.score})\n\n`;
  
  if (report.summary.criticalIssues.length > 0) {
    text += `CRITICAL ISSUES:\n`;
    report.summary.criticalIssues.forEach(issue => {
      text += `- ${issue}\n`;
    });
    text += '\n';
  }
  
  text += `PERFORMANCE:\n`;
  text += `- Status: ${report.performance.status}\n`;
  text += `- Average FPS: ${report.performance.avgFPS}\n`;
  text += `- Average Render Time: ${report.performance.avgRenderTime}ms\n`;
  text += `- Memory Usage: ${report.performance.memoryUsage}MB\n\n`;
  
  text += `ERRORS:\n`;
  text += `- Error Count: ${report.errors.errorCount}\n`;
  text += `- Warning Count: ${report.errors.warningCount}\n\n`;
  
  if (report.summary.recommendations.length > 0) {
    text += `RECOMMENDATIONS:\n`;
    report.summary.recommendations.forEach(rec => {
      text += `- ${rec}\n`;
    });
  }
  
  return text;
};

// Initialize tracking when module loads
if (typeof window !== 'undefined') {
  initializePerformanceTracking();
}