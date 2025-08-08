// hooks/usePerformanceMonitor.js

import { useState, useEffect, useCallback, useRef } from 'react';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    renderTime: 0,
    elementCount: 0,
    memoryUsage: 0,
    lastUpdate: Date.now()
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef(null);
  const renderStartTime = useRef(0);

  // FPS Calculation
  const calculateFPS = useCallback(() => {
    frameCount.current++;
    const now = performance.now();
    const elapsed = now - lastTime.current;

    if (elapsed >= 1000) { // Update every second
      const fps = Math.round((frameCount.current * 1000) / elapsed);
      
      setMetrics(prev => ({
        ...prev,
        fps,
        lastUpdate: Date.now(),
        memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0
      }));

      frameCount.current = 0;
      lastTime.current = now;
    }

    animationFrameId.current = requestAnimationFrame(calculateFPS);
  }, []);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    animationFrameId.current = requestAnimationFrame(calculateFPS);
  }, [calculateFPS]);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  // Measure render time
  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRender = useCallback((elementCount = 0) => {
    const renderTime = performance.now() - renderStartTime.current;
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.round(renderTime * 100) / 100,
      elementCount
    }));
  }, []);

  // Performance benchmark for stress testing
  const runStressTest = useCallback(async (elementCount = 100) => {
    const results = {
      elementCount,
      averageRenderTime: 0,
      minFPS: Infinity,
      maxFPS: 0,
      memoryIncrease: 0
    };

    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const samples = [];
    const fpsReadings = [];

    // Take samples over 10 seconds
    const startTime = Date.now();
    while (Date.now() - startTime < 10000) {
      const renderStart = performance.now();
      
      // Simulate heavy render
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          const renderEnd = performance.now();
          samples.push(renderEnd - renderStart);
          fpsReadings.push(metrics.fps);
          resolve();
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps target
    }

    results.averageRenderTime = samples.reduce((a, b) => a + b, 0) / samples.length;
    results.minFPS = Math.min(...fpsReadings.filter(fps => fps > 0));
    results.maxFPS = Math.max(...fpsReadings);
    results.memoryIncrease = performance.memory 
      ? Math.round((performance.memory.usedJSHeapSize - initialMemory) / 1024 / 1024) 
      : 0;

    return results;
  }, [metrics.fps]);

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  return {
    metrics,
    startRender,
    endRender,
    runStressTest,
    startMonitoring,
    stopMonitoring
  };
};