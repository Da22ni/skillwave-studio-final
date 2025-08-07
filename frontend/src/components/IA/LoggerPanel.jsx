// components/IA/LoggerPanel.jsx

// 🧠 English:
// Enhanced activity logger panel with educational insights, performance tracking, and export functionality

// 💬 Español humano:
// Panel mejorado de registro de actividad con insights educativos, seguimiento de rendimiento y funcionalidad de exportación

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLogger } from '../../hooks/useLogger';
import { logDebug, logInteraction, exportDebugReport, getDebugSummary } from '../../debug/report';
import Button from '../UI/Button';

const LoggerPanel = () => {
  const { t } = useTranslation();
  const { actions, clearActions, hasActions, getActivitySummary } = useLogger();
  
  // 🧠 English: Enhanced state for comprehensive logging features
  // 💬 Español humano: Estado mejorado para características completas de logging
  const [loggerState, setLoggerState] = useState({
    filter: 'all', // all, recent, errors, achievements
    showDetails: false,
    autoScroll: true,
    showPerformance: false,
    showEducationalTips: true,
    sessionStats: {
      totalActions: 0,
      learningMilestones: 0,
      timeSpent: 0
    }
  });

  const [educationalInsights, setEducationalInsights] = useState([]);

  useEffect(() => {
    // Update session statistics
    const summary = getActivitySummary();
    const debugSummary = getDebugSummary();
    
    setLoggerState(prev => ({
      ...prev,
      sessionStats: {
        totalActions: summary.totalActions,
        learningMilestones: calculateLearningMilestones(actions),
        timeSpent: Math.floor(debugSummary.duration / 60000) // Convert to minutes
      }
    }));

    // Generate educational insights
    generateEducationalInsights();
    
    console.debug(`📊 [LoggerPanel] Stats updated: ${summary.totalActions} actions`);
  }, [actions]);

  const calculateLearningMilestones = (actions) => {
    let milestones = 0;
    const milestoneActions = [
      'first element added',
      'first property changed', 
      'first element deleted',
      'view mode changed',
      'project exported',
      'responsive view used'
    ];

    const actionTexts = actions.map(a => a.message.toLowerCase());
    milestoneActions.forEach(milestone => {
      if (actionTexts.some(action => action.includes(milestone.split(' ')[0]))) {
        milestones++;
      }
    });

    return milestones;
  };

  const generateEducationalInsights = () => {
    const insights = [];
    const recentActions = actions.slice(-10);

    // 🧠 English: Generate contextual learning insights based on user behavior
    // 💬 Español humano: Generar insights de aprendizaje contextual basados en comportamiento del usuario
    
    if (recentActions.some(a => a.message.includes('Added'))) {
      insights.push({
        type: 'achievement',
        message: '🎉 Great! You\'re building elements. Each element becomes HTML code.',
        level: 'beginner'
      });
    }

    if (recentActions.some(a => a.message.includes('Updated'))) {
      insights.push({
        type: 'learning',
        message: '🔧 Property updates change CSS styles. This is how websites get their look!',
        level: 'intermediate'
      });
    }

    if (recentActions.some(a => a.message.includes('Exported'))) {
      insights.push({
        type: 'milestone',
        message: '🚀 Awesome! You exported real code. You just created an actual website!',
        level: 'advanced'
      });
    }

    if (actions.length >= 10) {
      insights.push({
        type: 'progress',
        message: `💪 ${actions.length} actions completed! You're becoming a web developer.`,
        level: 'motivational'
      });
    }

    setEducationalInsights(insights);
  };

  const handleClearActions = () => {
    if (window.confirm('Clear all activity logs? This will reset your learning progress.')) {
      console.debug('🗑️ [LoggerPanel] Clearing activity logs');
      logInteraction('logger_clear', { actionCount: actions.length });
      clearActions();
    }
  };

  const handleExportLogs = (format = 'json') => {
    console.debug(`📊 [LoggerPanel] Exporting logs as ${format}`);
    logInteraction('logger_export', { format, actionCount: actions.length });
    exportDebugReport(format);
  };

  const getFilteredActions = () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
    
    switch (loggerState.filter) {
      case 'recent':
        return actions.filter(action => new Date(action.timestamp) > fiveMinutesAgo);
      case 'errors':
        return actions.filter(action => action.message.includes('ERROR') || action.message.includes('failed'));
      case 'achievements':
        return actions.filter(action => 
          action.message.includes('Added') || 
          action.message.includes('Exported') ||
          action.message.includes('Created')
        );
      default:
        return actions;
    }
  };

  const getActionIcon = (message) => {
    if (message.includes('Added')) return '➕';
    if (message.includes('Updated')) return '✏️';
    if (message.includes('Deleted')) return '🗑️';
    if (message.includes('Moved')) return '📍';
    if (message.includes('Switched') || message.includes('Changed')) return '👁️';
    if (message.includes('Exported')) return '📦';
    if (message.includes('Created')) return '🆕';
    if (message.includes('Loaded') || message.includes('Opened')) return '📂';
    return '📝';
  };

  const getActionImportance = (message) => {
    // High importance actions for learning
    const highImportance = ['Added', 'Exported', 'Created', 'project'];
    const isHighImportance = highImportance.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return isHighImportance ? 'high' : 'normal';
  };

  const filteredActions = getFilteredActions();

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      {/* Enhanced Header with Statistics */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm">📊</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('editor.logger')}
            </h3>
            <div className="text-xs text-gray-600 space-x-2">
              <span>{loggerState.sessionStats.totalActions} actions</span>
              <span>•</span>
              <span>{loggerState.sessionStats.learningMilestones} milestones</span>
              <span>•</span>
              <span>{loggerState.sessionStats.timeSpent}min</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {hasActions && (
            <>
              <button
                onClick={() => handleExportLogs('json')}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                title="Export debug report"
              >
                📊
              </button>
              
              <Button
                onClick={handleClearActions}
                variant="outline"
                size="small"
                className="text-xs"
              >
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Filter Options */}
      <div className="flex space-x-1 mb-3">
        {[
          { key: 'all', label: 'All', icon: '📋' },
          { key: 'recent', label: 'Recent', icon: '🕐' },
          { key: 'achievements', label: 'Wins', icon: '🏆' },
          { key: 'errors', label: 'Issues', icon: '⚠️' }
        ].map(filter => (
          <button
            key={filter.key}
            onClick={() => setLoggerState(prev => ({ ...prev, filter: filter.key }))}
            className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${
              loggerState.filter === filter.key
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Educational Insights */}
      {loggerState.showEducationalTips && educationalInsights.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">🧠 Learning Insights</h4>
          <div className="space-y-1">
            {educationalInsights.slice(0, 2).map((insight, index) => (
              <div key={index} className={`text-sm ${
                insight.type === 'achievement' ? 'text-green-700' :
                insight.type === 'milestone' ? 'text-blue-700' :
                insight.type === 'learning' ? 'text-purple-700' :
                'text-gray-700'
              }`}>
                {insight.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Activity Log */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {!hasActions ? (
          <div className="text-center text-gray-500 py-8">
            <div className="mb-2">👋</div>
            <p className="text-sm">No activity yet</p>
            <p className="text-xs">Start building to see your learning progress!</p>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p className="text-sm">No {loggerState.filter} activities</p>
            <p className="text-xs">Try a different filter</p>
          </div>
        ) : (
          filteredActions
            .slice()
            .reverse()
            .slice(0, 20) // Show last 20 filtered actions
            .map((action) => {
              const importance = getActionImportance(action.message);
              return (
                <div
                  key={action.id}
                  className={`bg-white p-3 rounded-lg border transition-colors hover:shadow-sm ${
                    importance === 'high' 
                      ? 'border-green-300 hover:border-green-400' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-sm mr-2">
                          {getActionIcon(action.message)}
                        </span>
                        <p className={`text-sm ${importance === 'high' ? 'font-medium text-green-800' : 'text-gray-800'}`}>
                          {action.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {action.time}
                        </p>
                        
                        {importance === 'high' && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Learning Milestone
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Enhanced Summary Statistics */}
      {hasActions && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {filteredActions.length}
              </div>
              <div className="text-xs text-gray-500">
                {loggerState.filter === 'all' ? 'Total' : loggerState.filter}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-green-600">
                {loggerState.sessionStats.learningMilestones}
              </div>
              <div className="text-xs text-gray-500">Milestones</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-blue-600">
                {loggerState.sessionStats.timeSpent}
              </div>
              <div className="text-xs text-gray-500">Minutes</div>
            </div>
          </div>
        </div>
      )}

      {/* Educational Note */}
      <div className="mt-4 p-3 bg-green-100 rounded-lg">
        <h4 className="text-sm font-medium text-green-900 mb-1">🎓 Learning Mode Active</h4>
        <p className="text-xs text-green-700">
          This enhanced logger tracks your progress and helps you understand web development. 
          Each action is a step towards becoming a developer!
        </p>
      </div>

      {/* 🧠 English: Debug information for development
          💬 Español humano: Información de debug para desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          🔧 Dev Mode: Enhanced logging with performance tracking active
        </div>
      )}
    </div>
  );
};

export default LoggerPanel;