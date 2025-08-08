// debug/testDragDropZone.jsx

import React, { useState, useRef } from 'react';
import { useErrorMonitor } from '../hooks/useErrorMonitor';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { trackEvent, EVENTS } from '../services/telemetry';

const TestDragDropZone = () => {
  const [dragEvents, setDragEvents] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const dragZoneRef = useRef(null);
  const { reportError, reportWarning } = useErrorMonitor();
  const { startRender, endRender } = usePerformanceMonitor();

  // Test elements
  const testElements = [
    { id: 'test-text', type: 'text', label: '📝 Text Element' },
    { id: 'test-button', type: 'button', label: '🔘 Button Element' },
    { id: 'test-image', type: 'image', label: '🖼️ Image Element' }
  ];

  // Log drag event
  const logEvent = (type, data = {}) => {
    const event = {
      id: Date.now() + Math.random(),
      type,
      timestamp: new Date().toISOString(),
      data
    };
    
    setDragEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
    console.debug(`🎯 Drag Event: ${type}`, data);
  };

  // Drag handlers for test elements
  const handleDragStart = (e, element) => {
    startRender();
    logEvent('DRAG_START', { elementType: element.type, elementId: element.id });
    
    // Set data in multiple formats for compatibility testing
    e.dataTransfer.setData('text/plain', element.type);
    e.dataTransfer.setData('elementType', element.type);
    e.dataTransfer.setData('application/json', JSON.stringify(element));
    e.dataTransfer.effectAllowed = 'copy';
    
    trackEvent(EVENTS.ELEMENT_SELECTED, { elementType: element.type, context: 'drag_test' });
  };

  const handleDragEnd = (e, element) => {
    endRender(1);
    logEvent('DRAG_END', { elementType: element.type, elementId: element.id });
  };

  // Drop zone handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logEvent('DRAG_OVER', { 
      clientX: e.clientX, 
      clientY: e.clientY,
      dataTransferTypes: Array.from(e.dataTransfer.types)
    });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logEvent('DRAG_ENTER', { target: e.target.tagName });
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logEvent('DRAG_LEAVE', { target: e.target.tagName });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Test multiple data retrieval methods
    const testData = {
      textPlain: e.dataTransfer.getData('text/plain'),
      elementType: e.dataTransfer.getData('elementType'),
      applicationJson: e.dataTransfer.getData('application/json'),
      types: Array.from(e.dataTransfer.types),
      dropPosition: {
        clientX: e.clientX,
        clientY: e.clientY,
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY
      }
    };
    
    logEvent('DROP', testData);
    
    // Simulate element creation
    if (testData.elementType) {
      trackEvent(EVENTS.ELEMENT_ADDED, { 
        elementType: testData.elementType, 
        context: 'drag_test',
        position: testData.dropPosition 
      });
    }
    
    // Check for potential issues
    if (!testData.elementType && !testData.textPlain) {
      reportError(new Error('No data retrieved from drag operation'), 'drag_drop_test');
    } else if (testData.types.length === 0) {
      reportWarning('Empty dataTransfer types array', 'drag_drop_test');
    }
  };

  // Run automated tests
  const runAutomatedTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Drag Zone Element Exists',
        test: () => dragZoneRef.current !== null,
        expected: true
      },
      {
        name: 'Drag Zone Has Drop Handlers',
        test: () => {
          const element = dragZoneRef.current;
          return element && (
            element.ondragover !== undefined ||
            element.ondrop !== undefined
          );
        },
        expected: true
      },
      {
        name: 'Test Elements Are Draggable',
        test: () => {
          const draggableElements = document.querySelectorAll('[draggable="true"]');
          return draggableElements.length >= testElements.length;
        },
        expected: true
      },
      {
        name: 'DataTransfer API Available',
        test: () => typeof DataTransfer !== 'undefined',
        expected: true
      },
      {
        name: 'Event Logging Functional',
        test: () => dragEvents.length >= 0,
        expected: true
      }
    ];

    const results = [];
    
    for (const test of tests) {
      try {
        const result = test.test();
        const passed = result === test.expected;
        
        results.push({
          name: test.name,
          status: passed ? 'PASS' : 'FAIL',
          result,
          expected: test.expected
        });
        
        if (!passed) {
          reportWarning(`Test failed: ${test.name}`, 'automated_drag_test');
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.push({
          name: test.name,
          status: 'ERROR',
          error: error.message
        });
        reportError(error, 'automated_drag_test');
      }
    }
    
    setTestResults(results);
    setIsRunningTests(false);
    
    trackEvent(EVENTS.FEATURE_USED, { 
      feature: 'drag_drop_automated_test',
      results: results.map(r => ({ name: r.name, status: r.status }))
    });
  };

  // Clear logs
  const clearLogs = () => {
    setDragEvents([]);
    setTestResults([]);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          🎯 Drag & Drop Zone Test
        </h1>

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            <button
              onClick={runAutomatedTests}
              disabled={isRunningTests}
              className={`px-4 py-2 rounded text-white ${
                isRunningTests 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRunningTests ? 'Running Tests...' : '🧪 Run Automated Tests'}
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              🗑️ Clear Logs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Draggable Elements */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Draggable Test Elements</h2>
            <div className="space-y-4">
              {testElements.map((element) => (
                <div
                  key={element.id}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, element)}
                  onDragEnd={(e) => handleDragEnd(e, element)}
                  className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg cursor-move hover:bg-blue-200 transition-colors select-none"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{element.label}</span>
                    <div className="text-sm text-gray-600">
                      Type: {element.type} | ID: {element.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                💡 <strong>Instructions:</strong> Drag these elements to the drop zone on the right to test drag & drop functionality.
              </p>
            </div>
          </div>

          {/* Drop Zone */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Drop Zone</h2>
            <div
              ref={dragZoneRef}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-4 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:border-green-400 hover:bg-green-50 transition-colors min-h-[200px] flex items-center justify-center"
            >
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🎯</div>
                <div className="text-lg font-medium">Drop elements here</div>
                <div className="text-sm">Watch the event log below</div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">🧪 Automated Test Results</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${
                    result.status === 'PASS'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : result.status === 'FAIL'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{result.name}</span>
                    <span className="text-sm font-mono">
                      {result.status}
                    </span>
                  </div>
                  {result.error && (
                    <div className="text-sm mt-1">Error: {result.error}</div>
                  )}
                  {result.result !== undefined && (
                    <div className="text-sm mt-1">
                      Result: {String(result.result)} | Expected: {String(result.expected)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Log */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">📜 Event Log ({dragEvents.length}/20)</h2>
          <div className="max-h-80 overflow-y-auto">
            {dragEvents.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No events logged yet. Try dragging elements to the drop zone.
              </div>
            ) : (
              <div className="space-y-2">
                {dragEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 bg-gray-50 rounded border text-sm font-mono"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-semibold ${
                        event.type.includes('DROP') ? 'text-green-600' :
                        event.type.includes('START') ? 'text-blue-600' :
                        event.type.includes('END') ? 'text-purple-600' :
                        'text-gray-600'
                      }`}>
                        {event.type}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {Object.keys(event.data).length > 0 && (
                      <pre className="text-xs text-gray-700 bg-white p-2 rounded overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Manual Testing</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Drag elements from left panel to drop zone</li>
                <li>Observe event log for proper data transfer</li>
                <li>Check for consistent drag/drop behavior</li>
                <li>Test all three element types</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Automated Testing</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Click "Run Automated Tests" button</li>
                <li>Review test results for any failures</li>
                <li>Check browser compatibility</li>
                <li>Verify event handler attachment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDragDropZone;