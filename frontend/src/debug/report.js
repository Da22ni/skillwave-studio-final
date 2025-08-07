// debug/report.js

// 🧠 English:
// Debug reporting system that collects, analyzes and exports debugging information

// 💬 Español humano:
// Sistema de reportes de debug que recopila, analiza y exporta información de debugging

/**
 * Debug report collector and analyzer
 */
class DebugReport {
  constructor() {
    this.reports = [];
    this.sessionId = `session_${Date.now()}`;
    this.startTime = new Date();
    
    console.debug(`📊 [DebugReport] Started debug session: ${this.sessionId}`);
    
    // Initialize error tracking
    this.initErrorTracking();
  }

  /**
   * Initialize global error tracking
   */
  initErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    console.debug('📊 [DebugReport] Error tracking initialized');
  }

  /**
   * Log a debug event
   * @param {string} category - Event category
   * @param {string} message - Event message
   * @param {Object} data - Additional data
   */
  log(category, message, data = {}) {
    const report = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.reports.push(report);
    
    console.debug(`📊 [DebugReport] Logged: [${category}] ${message}`, data);

    // Auto-export if too many reports
    if (this.reports.length >= 100) {
      this.exportReports();
    }

    return report;
  }

  /**
   * Log an error specifically
   * @param {string} errorType - Type of error
   * @param {Object} errorData - Error details
   */
  logError(errorType, errorData) {
    return this.log('ERROR', errorType, {
      ...errorData,
      severity: 'HIGH',
      needsAttention: true
    });
  }

  /**
   * Log a warning
   * @param {string} warning - Warning message
   * @param {Object} data - Additional data
   */
  logWarning(warning, data = {}) {
    return this.log('WARNING', warning, {
      ...data,
      severity: 'MEDIUM'
    });
  }

  /**
   * Log performance data
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in milliseconds
   * @param {Object} metadata - Additional metadata
   */
  logPerformance(operation, duration, metadata = {}) {
    return this.log('PERFORMANCE', operation, {
      duration,
      ...metadata,
      category: 'PERFORMANCE'
    });
  }

  /**
   * Log user interaction
   * @param {string} interaction - Type of interaction
   * @param {Object} details - Interaction details
   */
  logInteraction(interaction, details = {}) {
    return this.log('USER_INTERACTION', interaction, {
      ...details,
      category: 'UX'
    });
  }

  /**
   * Analyze current reports
   * @returns {Object} Analysis results
   */
  analyzeReports() {
    console.debug('📊 [DebugReport] Analyzing reports...');
    
    const analysis = {
      totalReports: this.reports.length,
      categories: {},
      errors: [],
      warnings: [],
      performance: {
        slowOperations: [],
        avgDuration: 0
      },
      timeRange: {
        start: this.startTime.toISOString(),
        end: new Date().toISOString()
      },
      topIssues: []
    };

    this.reports.forEach(report => {
      // Count by category
      analysis.categories[report.category] = (analysis.categories[report.category] || 0) + 1;

      // Collect errors and warnings
      if (report.category === 'ERROR') {
        analysis.errors.push(report);
      } else if (report.category === 'WARNING') {
        analysis.warnings.push(report);
      } else if (report.category === 'PERFORMANCE') {
        if (report.data.duration > 1000) { // > 1 second
          analysis.performance.slowOperations.push(report);
        }
      }
    });

    // Calculate performance averages
    const perfReports = this.reports.filter(r => r.category === 'PERFORMANCE');
    if (perfReports.length > 0) {
      analysis.performance.avgDuration = 
        perfReports.reduce((sum, r) => sum + (r.data.duration || 0), 0) / perfReports.length;
    }

    // Identify top issues
    analysis.topIssues = [
      ...analysis.errors.slice(0, 5),
      ...analysis.warnings.slice(0, 3),
      ...analysis.performance.slowOperations.slice(0, 2)
    ];

    console.debug('📊 [DebugReport] Analysis complete:', analysis);
    
    // Educational logging
    if (analysis.errors.length > 0) {
      console.debug('🧠 Educational Note: Errors found - these help identify problems in the application');
    }
    
    return analysis;
  }

  /**
   * Export reports as downloadable file
   * @param {string} format - Export format: 'json', 'csv', 'txt'
   */
  exportReports(format = 'json') {
    console.debug(`📊 [DebugReport] Exporting ${this.reports.length} reports as ${format}`);

    const analysis = this.analyzeReports();
    const exportData = {
      meta: {
        sessionId: this.sessionId,
        exportTime: new Date().toISOString(),
        totalReports: this.reports.length,
        format
      },
      analysis,
      reports: this.reports
    };

    let content, filename, mimeType;

    switch (format.toLowerCase()) {
      case 'csv':
        content = this.reportsToCSV();
        filename = `debug_report_${this.sessionId}.csv`;
        mimeType = 'text/csv';
        break;
      
      case 'txt':
        content = this.reportsToText();
        filename = `debug_report_${this.sessionId}.txt`;
        mimeType = 'text/plain';
        break;
      
      default: // json
        content = JSON.stringify(exportData, null, 2);
        filename = `debug_report_${this.sessionId}.json`;
        mimeType = 'application/json';
    }

    this.downloadFile(content, filename, mimeType);
    
    console.debug(`📊 [DebugReport] Report exported as ${filename}`);
    console.debug('🧠 Educational Note: Debug reports help developers understand what happened during a session');
  }

  /**
   * Convert reports to CSV format
   */
  reportsToCSV() {
    const headers = ['Timestamp', 'Category', 'Message', 'Data', 'URL'];
    const rows = this.reports.map(report => [
      report.timestamp,
      report.category,
      report.message,
      JSON.stringify(report.data),
      report.url
    ]);

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }

  /**
   * Convert reports to text format
   */
  reportsToText() {
    let text = `Skillwave Studio Debug Report\n`;
    text += `Session: ${this.sessionId}\n`;
    text += `Generated: ${new Date().toISOString()}\n`;
    text += `Total Reports: ${this.reports.length}\n\n`;

    text += `=== ANALYSIS ===\n`;
    const analysis = this.analyzeReports();
    text += `Errors: ${analysis.errors.length}\n`;
    text += `Warnings: ${analysis.warnings.length}\n`;
    text += `Performance Issues: ${analysis.performance.slowOperations.length}\n\n`;

    text += `=== DETAILED REPORTS ===\n`;
    this.reports.forEach((report, index) => {
      text += `[${index + 1}] ${report.timestamp}\n`;
      text += `    Category: ${report.category}\n`;
      text += `    Message: ${report.message}\n`;
      text += `    Data: ${JSON.stringify(report.data, null, 2)}\n`;
      text += `    URL: ${report.url}\n\n`;
    });

    return text;
  }

  /**
   * Download file to user's computer
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all reports
   */
  clear() {
    const count = this.reports.length;
    this.reports = [];
    console.debug(`📊 [DebugReport] Cleared ${count} reports`);
  }

  /**
   * Get summary of current session
   */
  getSummary() {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      totalReports: this.reports.length,
      categories: this.analyzeReports().categories,
      duration: new Date() - this.startTime
    };
  }
}

// Create global debug reporter instance
const debugReport = new DebugReport();

// Export functions for easy use
export const logDebug = (category, message, data) => debugReport.log(category, message, data);
export const logError = (errorType, errorData) => debugReport.logError(errorType, errorData);
export const logWarning = (warning, data) => debugReport.logWarning(warning, data);
export const logPerformance = (operation, duration, metadata) => debugReport.logPerformance(operation, duration, metadata);
export const logInteraction = (interaction, details) => debugReport.logInteraction(interaction, details);
export const analyzeReports = () => debugReport.analyzeReports();
export const exportDebugReport = (format) => debugReport.exportReports(format);
export const clearReports = () => debugReport.clear();
export const getDebugSummary = () => debugReport.getSummary();

export default debugReport;

console.debug('📊 Debug reporting system loaded - use logDebug, logError, logWarning, exportDebugReport');