// hooks/useAuth.js

// 🧠 English:
// Custom hook for Firebase authentication management and user session handling

// 💬 Español humano:
// Hook personalizado para manejo de autenticación Firebase y sesión de usuario

import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { auth, googleProvider } from '../services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const { user, isAuthenticated, isLoading, demoMode, setUser, setLoading, logout, enableDemoMode } = useAuthStore();

  useEffect(() => {
    // 🧠 English: Listen for authentication state changes
    // 💬 Español humano: Escucha cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.debug('🔐 Firebase user authenticated:', firebaseUser.displayName);
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL
        });
        setLoading(false);
      } else if (!demoMode) {
        console.debug('🔐 No authenticated user');
        setUser(null);
        setLoading(false);
      } else {
        console.debug('🔐 No Firebase user, but demo mode is active');
      }
    });

    return () => unsubscribe();
  }, [setUser, demoMode, setLoading]);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      console.debug('🔐 Attempting Google login');
      
      const result = await signInWithPopup(auth, googleProvider);
      console.debug('🔐 Google login successful:', result.user.displayName);
      
      return { success: true, user: result.user };
    } catch (error) {
      console.error('🔐 Google login failed:', error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      console.debug('🔐 Logging out user');
      await signOut(auth);
      logout();
      return { success: true };
    } catch (error) {
      console.error('🔐 Logout failed:', error);
      return { success: false, error: error.message };
    }
  };

  const startDemoMode = () => {
    console.debug('🔐 Starting demo mode');
    setLoading(true);
    enableDemoMode();
    setLoading(false); // Clear loading after demo mode is enabled
    return { success: true };
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    demoMode,
    loginWithGoogle,
    logout: handleLogout,
    startDemoMode
  };
}