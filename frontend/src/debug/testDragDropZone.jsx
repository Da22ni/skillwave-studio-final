// debug/testDragDropZone.jsx

// 🧠 English:
// Debug component to test drag and drop functionality and detect interaction issues

// 💬 Español humano:
// Componente de debug para probar la funcionalidad drag and drop y detectar problemas de interacción

import React, { useState, useEffect, useRef } from 'react';

const TestDragDropZone = ({ isActive = false }) => {
  const [dragData, setDragData] = useState({
    isDragging: false,
    dragOver: false,
    lastDrop: null,
    dragCount: 0,
    dropCount: 0,
    errors: []
  });

  const [testResults, setTestResults] = useState([]);
  const testZoneRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;

    console.debug('🎯 [testDragDropZone] Starting drag-drop tests');

    const runDragDropTests = () => {
      const tests = [];
      const errors = [];

      // Test 1: Drag elements exist
      const dragElements = document.querySelectorAll('[draggable="true"]');
      tests.push({
        name: 'Draggable Elements',
        status: dragElements.length > 0 ? 'PASS' : 'FAIL',
        message: `Found ${dragElements.length} draggable elements`
      });

      // Test 2: Drop zones exist
      const dropZones = document.querySelectorAll('[class*="drop"], [class*="canvas"]');
      tests.push({
        name: 'Drop Zones',
        status: dropZones.length > 0 ? 'PASS' : 'FAIL',
        message: `Found ${dropZones.length} potential drop zones`
      });

      // Test 3: Event listeners
      let hasEventListeners = false;
      if (dragElements.length > 0) {
        const firstDragElement = dragElements[0];
        // Check if ondragstart is set
        hasEventListeners = firstDragElement.ondragstart !== null;
      }

      tests.push({
        name: 'Drag Event Listeners',
        status: hasEventListeners ? 'PASS' : 'WARN',
        message: hasEventListeners ? 'Drag events detected' : 'No drag events found'
      });

      // Test 4: Browser drag and drop support
      const supportsDragDrop = 'draggable' in document.createElement('span');
      tests.push({
        name: 'Browser Support',
        status: supportsDragDrop ? 'PASS' : 'FAIL',
        message: supportsDragDrop ? 'Drag and drop supported' : 'Drag and drop not supported'
      });

      setTestResults(tests);

      if (errors.length > 0) {
        console.warn('🚨 [testDragDropZone] Drag-drop issues:', errors);
        console.debug('🧠 Educational Note: Drag-drop issues can prevent users from building their websites');
        setDragData(prev => ({ ...prev, errors }));
      }
    };

    runDragDropTests();

    // Add test drag and drop listeners
    const handleDragStart = (e) => {
      console.debug('🎯 [testDragDropZone] Drag started');
      setDragData(prev => ({
        ...prev,
        isDragging: true,
        dragCount: prev.dragCount + 1
      }));
    };

    const handleDragEnd = (e) => {
      console.debug('🎯 [testDragDropZone] Drag ended');
      setDragData(prev => ({ ...prev, isDragging: false }));
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      setDragData(prev => ({ ...prev, dragOver: true }));
    };

    const handleDragLeave = (e) => {
      setDragData(prev => ({ ...prev, dragOver: false }));
    };

    const handleDrop = (e) => {
      e.preventDefault();
      console.debug('🎯 [testDragDropZone] Drop detected');
      
      setDragData(prev => ({
        ...prev,
        dragOver: false,
        isDragging: false,
        dropCount: prev.dropCount + 1,
        lastDrop: new Date().toLocaleTimeString()
      }));
    };

    // Attach global listeners for testing
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);
    
    if (testZoneRef.current) {
      testZoneRef.current.addEventListener('dragover', handleDragOver);
      testZoneRef.current.addEventListener('dragleave', handleDragLeave);
      testZoneRef.current.addEventListener('drop', handleDrop);
    }

    return () => {
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      
      if (testZoneRef.current) {
        testZoneRef.current.removeEventListener('dragover', handleDragOver);
        testZoneRef.current.removeEventListener('dragleave', handleDragLeave);
        testZoneRef.current.removeEventListener('drop', handleDrop);
      }
    };
  }, [isActive]);

  if (!isActive) {
    return (
      <div className="bg-gray-100 p-2 rounded text-xs text-gray-600">
        Drag-Drop Test: Inactive
      </div>
    );
  }

  return (
    <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg text-xs">
      <h4 className="font-semibold text-purple-800 mb-2">🎯 Drag-Drop Debug</h4>
      
      {/* Test Results */}
      <div className="space-y-1 mb-3">
        {testResults.map((test, index) => (
          <div key={index} className={`flex justify-between ${
            test.status === 'PASS' ? 'text-green-700' : 
            test.status === 'FAIL' ? 'text-red-700' : 
            test.status === 'WARN' ? 'text-yellow-700' : 'text-blue-700'
          }`}>
            <span>{test.name}:</span>
            <span>{test.status} - {test.message}</span>
          </div>
        ))}
      </div>

      {/* Test Drop Zone */}
      <div 
        ref={testZoneRef}
        className={`border-2 border-dashed p-4 rounded transition-colors ${
          dragData.dragOver ? 'border-purple-500 bg-purple-100' : 'border-purple-300'
        }`}
      >
        <div className="text-center text-purple-700">
          Test Drop Zone
          {dragData.isDragging && <div>🎯 Dragging...</div>}
          {dragData.dragOver && <div>✨ Drop here!</div>}
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <div className="bg-purple-100 p-1 rounded">
          <div className="font-semibold">{dragData.dragCount}</div>
          <div>Drags</div>
        </div>
        <div className="bg-purple-100 p-1 rounded">
          <div className="font-semibold">{dragData.dropCount}</div>
          <div>Drops</div>
        </div>
        <div className="bg-purple-100 p-1 rounded">
          <div className="font-semibold text-xs">
            {dragData.lastDrop || 'None'}
          </div>
          <div>Last Drop</div>
        </div>
      </div>

      {/* Errors */}
      {dragData.errors.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <strong className="text-red-800">Issues:</strong>
          <ul className="text-red-700">
            {dragData.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TestDragDropZone;