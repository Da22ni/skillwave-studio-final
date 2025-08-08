// components/Debug/ErrorConsole.jsx

import React, { useState } from 'react';
import { useErrorMonitor } from '../../hooks/useErrorMonitor';

const ErrorConsole = () => {
  const { 
    errors, 
    warnings, 
    isVisible, 
    setIsVisible, 
    clearErrors, 
    totalErrorCount, 
    totalWarningCount 
  } = useErrorMonitor();
  
  const [activeTab, setActiveTab] = useState('errors');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className={`px-3 py-2 rounded-lg text-white text-sm font-medium shadow-lg transition-all ${
            totalErrorCount > 0 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : totalWarningCount > 0 
                ? 'bg-yellow-500 hover:bg-yellow-600' 
                : 'bg-gray-500 hover:bg-gray-600'
          }`}
        >
          🐛 {totalErrorCount > 0 && `${totalErrorCount} Errors`}
          {totalWarningCount > 0 && totalErrorCount === 0 && `${totalWarningCount} Warnings`}
          {totalErrorCount === 0 && totalWarningCount === 0 && 'Console'}
        </button>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">🐛 Error Console</span>
            <div className="flex space-x-2">
              {totalErrorCount > 0 && (
                <span className="bg-red-500 px-2 py-0.5 rounded text-xs">
                  {totalErrorCount} errors
                </span>
              )}
              {totalWarningCount > 0 && (
                <span className="bg-yellow-500 px-2 py-0.5 rounded text-xs">
                  {totalWarningCount} warnings
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-300 hover:text-white"
            >
              {isMinimized ? '⬆️' : '⬇️'}
            </button>
            <button
              onClick={clearErrors}
              className="text-gray-300 hover:text-white"
              title="Clear all"
            >
              🗑️
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <>
            {/* Tabs */}
            <div className="flex bg-gray-100 border-b">
              <button
                onClick={() => setActiveTab('errors')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'errors' 
                    ? 'bg-white text-red-600 border-b-2 border-red-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Errors ({errors.length})
              </button>
              <button
                onClick={() => setActiveTab('warnings')}
                className={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab === 'warnings' 
                    ? 'bg-white text-yellow-600 border-b-2 border-yellow-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Warnings ({warnings.length})
              </button>
            </div>

            {/* Log entries */}
            <div className="max-h-64 overflow-y-auto">
              {activeTab === 'errors' && (
                <div className="p-2 space-y-2">
                  {errors.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No errors captured ✅
                    </div>
                  ) : (
                    errors.map((error) => (
                      <div
                        key={error.id}
                        className={`p-2 rounded text-xs border-l-4 border-red-500 ${getLevelColor(error.level)}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{error.context}</span>
                          <span className="text-gray-500">{formatTime(error.timestamp)}</span>
                        </div>
                        <div className="mt-1 font-mono text-xs">{error.message}</div>
                        {error.stack && (
                          <details className="mt-1">
                            <summary className="cursor-pointer text-gray-600">Stack trace</summary>
                            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'warnings' && (
                <div className="p-2 space-y-2">
                  {warnings.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No warnings captured ✅
                    </div>
                  ) : (
                    warnings.map((warning) => (
                      <div
                        key={warning.id}
                        className={`p-2 rounded text-xs border-l-4 border-yellow-500 ${getLevelColor(warning.level)}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{warning.context}</span>
                          <span className="text-gray-500">{formatTime(warning.timestamp)}</span>
                        </div>
                        <div className="mt-1 font-mono text-xs">{warning.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ErrorConsole;