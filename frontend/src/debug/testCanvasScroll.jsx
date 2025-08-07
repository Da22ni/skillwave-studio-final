// debug/testCanvasScroll.jsx

// 🧠 English:
// Debug component to test canvas scrolling behavior and detect scroll-related issues

// 💬 Español humano:
// Componente de debug para probar el comportamiento de scroll del canvas y detectar problemas relacionados

import React, { useState, useEffect, useRef } from 'react';

const TestCanvasScroll = ({ isActive = false }) => {
  const [scrollData, setScrollData] = useState({
    canvasScroll: { x: 0, y: 0 },
    windowScroll: { x: 0, y: 0 },
    canvasSize: { width: 0, height: 0 },
    issues: []
  });
  
  const canvasRef = useRef(null);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    if (!isActive) return;

    console.debug('🔍 [testCanvasScroll] Starting canvas scroll tests');

    const runScrollTests = () => {
      const tests = [];
      const issues = [];

      // Test 1: Canvas element exists
      const canvas = canvasRef.current || document.querySelector('[class*="canvas"]');
      if (!canvas) {
        issues.push('Canvas element not found');
        tests.push({ name: 'Canvas Element', status: 'FAIL', message: 'Canvas not found' });
      } else {
        tests.push({ name: 'Canvas Element', status: 'PASS', message: 'Canvas found' });
        
        // Test 2: Canvas scroll behavior
        const scrollTop = canvas.scrollTop;
        const scrollLeft = canvas.scrollLeft;
        
        tests.push({ 
          name: 'Canvas Scroll Position', 
          status: 'INFO', 
          message: `ScrollTop: ${scrollTop}, ScrollLeft: ${scrollLeft}` 
        });

        // Test 3: Canvas overflow settings
        const computedStyle = window.getComputedStyle(canvas);
        const overflowX = computedStyle.overflowX;
        const overflowY = computedStyle.overflowY;
        
        if (overflowX === 'hidden' && overflowY === 'hidden') {
          issues.push('Canvas has overflow hidden - may cause scroll issues');
        }
        
        tests.push({ 
          name: 'Canvas Overflow', 
          status: overflowX === 'auto' || overflowY === 'auto' ? 'PASS' : 'WARN',
          message: `OverflowX: ${overflowX}, OverflowY: ${overflowY}` 
        });

        // Test 4: Check for scroll event listeners
        const hasScrollListener = canvas.onscroll !== null;
        tests.push({ 
          name: 'Scroll Listeners', 
          status: hasScrollListener ? 'PASS' : 'INFO',
          message: hasScrollListener ? 'Scroll listener attached' : 'No scroll listener' 
        });
      }

      // Test 5: Window scroll interference
      const windowScrollY = window.scrollY;
      const windowScrollX = window.scrollX;
      
      if (windowScrollY > 0 || windowScrollX > 0) {
        issues.push('Window scroll detected - may interfere with canvas');
      }
      
      tests.push({ 
        name: 'Window Scroll', 
        status: windowScrollY === 0 && windowScrollX === 0 ? 'PASS' : 'WARN',
        message: `Window ScrollY: ${windowScrollY}, ScrollX: ${windowScrollX}` 
      });

      setTestResults(tests);
      setScrollData(prev => ({ ...prev, issues }));

      console.debug('🔍 [testCanvasScroll] Tests completed:', tests.length);
      
      // Log issues for educational purposes
      if (issues.length > 0) {
        console.warn('🚨 [testCanvasScroll] Scroll issues detected:', issues);
        console.debug('🧠 Educational Note: Canvas scroll issues can affect user experience in drag-and-drop editors');
      }
    };

    // Run tests immediately and on scroll
    runScrollTests();
    
    const handleScroll = () => {
      setScrollData(prev => ({
        ...prev,
        canvasScroll: { 
          x: canvasRef.current?.scrollLeft || 0, 
          y: canvasRef.current?.scrollTop || 0 
        },
        windowScroll: { x: window.scrollX, y: window.scrollY }
      }));
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isActive]);

  if (!isActive) {
    return (
      <div className="bg-gray-100 p-2 rounded text-xs text-gray-600">
        Canvas Scroll Test: Inactive
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs">
      <h4 className="font-semibold text-yellow-800 mb-2">🔍 Canvas Scroll Debug</h4>
      
      <div className="space-y-2">
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

      {scrollData.issues.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <strong className="text-red-800">Issues:</strong>
          <ul className="text-red-700">
            {scrollData.issues.map((issue, index) => (
              <li key={index}>• {issue}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-2 text-gray-600">
        Canvas: ({scrollData.canvasScroll.x}, {scrollData.canvasScroll.y}) | 
        Window: ({scrollData.windowScroll.x}, {scrollData.windowScroll.y})
      </div>
    </div>
  );
};

export default TestCanvasScroll;