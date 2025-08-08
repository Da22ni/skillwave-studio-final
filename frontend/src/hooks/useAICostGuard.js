// hooks/useAICostGuard.js

import { useState, useCallback, useRef, useEffect } from 'react';

export const useAICostGuard = () => {
  const [requestCount, setRequestCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cache, setCache] = useState(new Map());
  const [stats, setStats] = useState({
    totalRequests: 0,
    cacheHits: 0,
    rateLimitHits: 0,
    totalTokensUsed: 0,
    estimatedCost: 0
  });

  const requestTimestamps = useRef([]);
  const cacheRef = useRef(cache);
  
  // Configuration
  const config = {
    maxRequestsPerMinute: 10,
    maxRequestsPerHour: 50,
    maxPromptTokens: 2000,
    maxCacheSize: 100,
    cacheExpirationTime: 30 * 60 * 1000, // 30 minutes
    costPerToken: 0.0001, // Estimated cost per token
  };

  // Update cache ref when cache state changes
  useEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  // Clean old timestamps
  const cleanOldTimestamps = useCallback(() => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneMinuteAgo = now - 60 * 1000;
    
    requestTimestamps.current = requestTimestamps.current.filter(timestamp => timestamp > oneHourAgo);
    
    const recentRequests = requestTimestamps.current.filter(timestamp => timestamp > oneMinuteAgo);
    setRequestCount(recentRequests.length);
  }, []);

  // Check if request is within rate limits
  const checkRateLimit = useCallback(() => {
    cleanOldTimestamps();
    
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const requestsLastMinute = requestTimestamps.current.filter(timestamp => timestamp > oneMinuteAgo).length;
    const requestsLastHour = requestTimestamps.current.filter(timestamp => timestamp > oneHourAgo).length;
    
    const isLimited = requestsLastMinute >= config.maxRequestsPerMinute || requestsLastHour >= config.maxRequestsPerHour;
    
    setIsRateLimited(isLimited);
    
    if (isLimited) {
      setStats(prev => ({ ...prev, rateLimitHits: prev.rateLimitHits + 1 }));
      console.warn('🚫 AI request rate limited', {
        requestsLastMinute,
        requestsLastHour,
        maxPerMinute: config.maxRequestsPerMinute,
        maxPerHour: config.maxRequestsPerHour
      });
    }
    
    return !isLimited;
  }, [cleanOldTimestamps, config.maxRequestsPerMinute, config.maxRequestsPerHour]);

  // Generate cache key from prompt
  const generateCacheKey = useCallback((prompt, context = '') => {
    const normalizedPrompt = prompt.toLowerCase().trim();
    const contextKey = context ? `-${context}` : '';
    return btoa(normalizedPrompt + contextKey).slice(0, 32);
  }, []);

  // Check cache for existing response
  const getCachedResponse = useCallback((cacheKey) => {
    const cachedItem = cacheRef.current.get(cacheKey);
    
    if (!cachedItem) return null;
    
    const now = Date.now();
    if (now - cachedItem.timestamp > config.cacheExpirationTime) {
      // Expired cache entry
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(cacheKey);
        return newCache;
      });
      return null;
    }
    
    // Cache hit
    setStats(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
    console.debug('💰 AI Cache hit for key:', cacheKey);
    
    return cachedItem.response;
  }, [config.cacheExpirationTime]);

  // Store response in cache
  const setCachedResponse = useCallback((cacheKey, response, tokenCount = 0) => {
    setCache(prev => {
      const newCache = new Map(prev);
      
      // If cache is full, remove oldest entry
      if (newCache.size >= config.maxCacheSize) {
        const oldestKey = newCache.keys().next().value;
        newCache.delete(oldestKey);
      }
      
      newCache.set(cacheKey, {
        response,
        timestamp: Date.now(),
        tokenCount
      });
      
      return newCache;
    });
    
    console.debug('💾 AI Response cached for key:', cacheKey);
  }, [config.maxCacheSize]);

  // Validate prompt size
  const validatePromptSize = useCallback((prompt) => {
    // Rough token estimation: ~4 characters per token
    const estimatedTokens = Math.ceil(prompt.length / 4);
    
    if (estimatedTokens > config.maxPromptTokens) {
      console.warn('📏 Prompt too large:', {
        estimatedTokens,
        maxTokens: config.maxPromptTokens,
        promptLength: prompt.length
      });
      return false;
    }
    
    return true;
  }, [config.maxPromptTokens]);

  // Main function to check if AI request can proceed
  const canMakeRequest = useCallback((prompt, context = '') => {
    // Check prompt size
    if (!validatePromptSize(prompt)) {
      return { 
        allowed: false, 
        reason: 'Prompt too large',
        estimatedTokens: Math.ceil(prompt.length / 4),
        maxTokens: config.maxPromptTokens
      };
    }
    
    // Check rate limits
    if (!checkRateLimit()) {
      const nextAllowedTime = Math.max(
        requestTimestamps.current[requestTimestamps.current.length - config.maxRequestsPerMinute] + 60 * 1000,
        requestTimestamps.current[0] + 60 * 60 * 1000
      ) - Date.now();
      
      return { 
        allowed: false, 
        reason: 'Rate limited',
        retryAfter: Math.max(0, nextAllowedTime)
      };
    }
    
    // Check cache
    const cacheKey = generateCacheKey(prompt, context);
    const cachedResponse = getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      return {
        allowed: true,
        cached: true,
        response: cachedResponse,
        cacheKey
      };
    }
    
    return {
      allowed: true,
      cached: false,
      cacheKey
    };
  }, [validatePromptSize, checkRateLimit, generateCacheKey, getCachedResponse, config.maxPromptTokens, config.maxRequestsPerMinute]);

  // Record successful request
  const recordRequest = useCallback((tokenCount = 0, cacheKey = null, response = null) => {
    const now = Date.now();
    requestTimestamps.current.push(now);
    
    setStats(prev => ({
      ...prev,
      totalRequests: prev.totalRequests + 1,
      totalTokensUsed: prev.totalTokensUsed + tokenCount,
      estimatedCost: prev.estimatedCost + (tokenCount * config.costPerToken)
    }));
    
    // Cache the response if provided
    if (cacheKey && response) {
      setCachedResponse(cacheKey, response, tokenCount);
    }
    
    console.debug('📊 AI request recorded:', {
      tokenCount,
      totalRequests: stats.totalRequests + 1,
      estimatedCost: (stats.estimatedCost + (tokenCount * config.costPerToken)).toFixed(4)
    });
  }, [config.costPerToken, setCachedResponse, stats.totalRequests, stats.estimatedCost]);

  // Get current status
  const getStatus = useCallback(() => {
    cleanOldTimestamps();
    
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const requestsLastMinute = requestTimestamps.current.filter(timestamp => timestamp > oneMinuteAgo).length;
    const requestsLastHour = requestTimestamps.current.filter(timestamp => timestamp > oneHourAgo).length;
    
    return {
      requestsLastMinute,
      requestsLastHour,
      maxRequestsPerMinute: config.maxRequestsPerMinute,
      maxRequestsPerHour: config.maxRequestsPerHour,
      cacheSize: cache.size,
      maxCacheSize: config.maxCacheSize,
      isRateLimited,
      stats
    };
  }, [cleanOldTimestamps, cache.size, config.maxCacheSize, config.maxRequestsPerHour, config.maxRequestsPerMinute, isRateLimited, stats]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache(new Map());
    console.debug('🗑️ AI cache cleared');
  }, []);

  // Reset stats
  const resetStats = useCallback(() => {
    setStats({
      totalRequests: 0,
      cacheHits: 0,
      rateLimitHits: 0,
      totalTokensUsed: 0,
      estimatedCost: 0
    });
    requestTimestamps.current = [];
    setRequestCount(0);
    setIsRateLimited(false);
    console.debug('📊 AI stats reset');
  }, []);

  // Cleanup effect
  useEffect(() => {
    const interval = setInterval(cleanOldTimestamps, 60000); // Clean every minute
    return () => clearInterval(interval);
  }, [cleanOldTimestamps]);

  return {
    canMakeRequest,
    recordRequest,
    getStatus,
    clearCache,
    resetStats,
    isRateLimited,
    requestCount,
    cacheSize: cache.size,
    stats
  };
};