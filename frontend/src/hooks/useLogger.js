// hooks/useLogger.js

// 🧠 English:
// Custom hook for logging user actions and educational AI interactions

// 💬 Español humano:
// Hook personalizado para registrar acciones del usuario e interacciones educativas con IA

import { create } from 'zustand';

// Logger store for maintaining action history
const useLoggerStore = create((set, get) => ({
  actions: [],
  maxActions: 50, // Keep last 50 actions

  addAction: (action) => {
    const newAction = {
      id: Date.now(),
      message: action,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString()
    };

    set(state => ({
      actions: [...state.actions.slice(-(state.maxActions - 1)), newAction]
    }));

    return newAction;
  },

  clearActions: () => {
    set({ actions: [] });
  },

  getRecentActions: (count = 10) => {
    const { actions } = get();
    return actions.slice(-count);
  }
}));

export function useLogger() {
  const { actions, addAction, clearActions, getRecentActions } = useLoggerStore();

  const logAction = (message) => {
    console.debug(`📝 Action logged: ${message}`);
    
    // 🧠 English: Log action with timestamp for educational AI system
    // 💬 Español humano: Registra acción con timestamp para sistema educativo de IA
    
    const action = addAction(message);
    
    // Optional: Send to AI service for educational explanations
    // This will be implemented when AI service is ready
    
    return action;
  };

  const logDebug = (message, data = null) => {
    console.debug(`🐛 Debug: ${message}`, data);
    
    const debugMessage = data ? `${message} - ${JSON.stringify(data, null, 2)}` : message;
    return addAction(`[DEBUG] ${debugMessage}`);
  };

  const logError = (message, error = null) => {
    console.error(`❌ Error: ${message}`, error);
    
    const errorMessage = error ? `${message} - ${error.message}` : message;
    return addAction(`[ERROR] ${errorMessage}`);
  };

  const getActivitySummary = () => {
    const recentActions = getRecentActions(10);
    return {
      totalActions: actions.length,
      recentActions,
      lastAction: actions[actions.length - 1] || null
    };
  };

  return {
    actions,
    logAction,
    logDebug,
    logError,
    clearActions,
    getRecentActions,
    getActivitySummary,
    hasActions: actions.length > 0
  };
}