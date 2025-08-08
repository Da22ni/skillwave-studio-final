// debug/testCanvasScroll.jsx

import React, { useState, useRef, useEffect } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

const TestCanvasScroll = () => {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [isStressTest, setIsStressTest] = useState(false);
  const { metrics, runStressTest } = usePerformanceMonitor();
  const [testResults, setTestResults] = useState(null);

  // Generate test elements
  const generateTestElements = (count = 50) => {
    const newElements = [];
    for (let i = 0; i < count; i++) {
      newElements.push({
        id: `test-element-${i}`,
        type: ['text', 'button', 'image'][i % 3],
        position: {
          x: Math.random() * 1500,
          y: Math.random() * 1500
        },
        properties: {
          content: `Test Element ${i + 1}`,
          backgroundColor: `hsl(${i * 36 % 360}, 70%, 60%)`,
          width: '100px',
          height: '40px'
        }
      });
    }
    setElements(newElements);
  };

  // Handle scroll
  const handleScroll = (e) => {
    const { scrollLeft, scrollTop } = e.target;
    setScrollPosition({ x: scrollLeft, y: scrollTop });
  };

  // Run performance stress test
  const handleStressTest = async () => {
    setIsStressTest(true);
    generateTestElements(100);
    
    try {
      const results = await runStressTest(100);
      setTestResults(results);
    } catch (error) {
      console.error('Stress test failed:', error);
    } finally {
      setIsStressTest(false);
    }
  };

  useEffect(() => {
    generateTestElements(20);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          🧪 Canvas Scroll Performance Test
        </h1>

        {/* Controls */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4 items-center flex-wrap">
            <button
              onClick={() => generateTestElements(20)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Generate 20 Elements
            </button>
            <button
              onClick={() => generateTestElements(50)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Generate 50 Elements
            </button>
            <button
              onClick={() => generateTestElements(100)}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Generate 100 Elements
            </button>
            <button
              onClick={handleStressTest}
              disabled={isStressTest}
              className={`px-4 py-2 rounded text-white ${
                isStressTest 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {isStressTest ? 'Running Stress Test...' : '🔥 Stress Test'}
            </button>
            <button
              onClick={() => setElements([])}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">FPS</div>
            <div className={`text-2xl font-bold ${
              metrics.fps > 30 ? 'text-green-600' : 
              metrics.fps > 15 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.fps}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Render Time</div>
            <div className={`text-2xl font-bold ${
              metrics.renderTime < 16 ? 'text-green-600' : 
              metrics.renderTime < 32 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.renderTime}ms
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Elements</div>
            <div className="text-2xl font-bold text-blue-600">
              {elements.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Memory</div>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.memoryUsage}MB
            </div>
          </div>
        </div>

        {/* Stress Test Results */}
        {testResults && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-3">🔥 Stress Test Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Avg Render:</span>
                <span className="ml-2 font-medium">{testResults.averageRenderTime.toFixed(2)}ms</span>
              </div>
              <div>
                <span className="text-gray-600">Min FPS:</span>
                <span className="ml-2 font-medium">{testResults.minFPS}</span>
              </div>
              <div>
                <span className="text-gray-600">Max FPS:</span>
                <span className="ml-2 font-medium">{testResults.maxFPS}</span>
              </div>
              <div>
                <span className="text-gray-600">Memory +:</span>
                <span className="ml-2 font-medium">{testResults.memoryIncrease}MB</span>
              </div>
            </div>
          </div>
        )}

        {/* Scroll Info */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold mb-2">📍 Scroll Position</h3>
          <div className="text-sm text-gray-600">
            X: {scrollPosition.x}px | Y: {scrollPosition.y}px
          </div>
        </div>

        {/* Scrollable Canvas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold">Canvas Viewport</h3>
            <p className="text-sm text-gray-600">
              Scroll around to test performance with {elements.length} elements
            </p>
          </div>
          
          <div 
            ref={canvasRef}
            className="relative overflow-auto bg-gray-50"
            style={{ 
              width: '100%', 
              height: '600px',
            }}
            onScroll={handleScroll}
          >
            <div 
              className="relative bg-white border-2 border-dashed border-gray-300"
              style={{ 
                width: '2000px', 
                height: '2000px',
                backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)',
                backgroundSize: '50px 50px'
              }}
            >
              {elements.map((element) => (
                <div
                  key={element.id}
                  className="absolute border border-gray-400 rounded shadow-sm bg-white cursor-move select-none"
                  style={{
                    left: element.position.x,
                    top: element.position.y,
                    width: element.properties.width,
                    height: element.properties.height,
                    backgroundColor: element.properties.backgroundColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}
                >
                  {element.properties.content}
                </div>
              ))}
              
              {/* Grid markers */}
              <div className="absolute top-4 left-4 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                Origin (0, 0)
              </div>
              <div className="absolute top-4 right-4 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                (2000, 0)
              </div>
              <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                (0, 2000)
              </div>
              <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                (2000, 2000)
              </div>
            </div>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📋 Test Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Generate different numbers of elements and observe FPS changes</li>
            <li>Scroll around the canvas and monitor render performance</li>
            <li>Run stress tests to see how the system performs under load</li>
            <li>Watch for memory usage increases over time</li>
            <li>Good performance: FPS &gt; 30, Render time &lt; 16ms</li>
            <li>Warning signs: FPS &lt; 15, Render time &gt; 32ms, Memory growing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestCanvasScroll;