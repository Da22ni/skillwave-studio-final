// store/useAuthStore.js

// 🧠 English:
// Authentication state management using Zustand. Handles user login, logout, and session persistence.

// 💬 Español humano:
// Manejo del estado de autenticación con Zustand. Controla login, logout y persistencia de sesión.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      demoMode: false,

      // Actions
      setUser: (user) => {
        console.debug('🔐 User set in auth store:', user?.displayName || 'Demo User');
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      logout: () => {
        console.debug('🔐 User logged out');
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false,
          demoMode: false 
        });
      },

      enableDemoMode: () => {
        console.debug('🔐 Demo mode enabled');
        set({ 
          demoMode: true,
          isAuthenticated: true,
          user: {
            uid: 'demo-user',
            displayName: 'Demo User',
            email: 'demo@skillwave.studio'
          }
        });
      },

      // Getters
      getCurrentUser: () => get().user,
      isDemo: () => get().demoMode
    }),
    {
      name: 'skillwave-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        demoMode: state.demoMode
      })
    }
  )
);