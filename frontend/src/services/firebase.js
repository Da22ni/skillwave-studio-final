// services/firebase.js

// 🧠 English:
// Firebase configuration and authentication setup for Google login

// 💬 Español humano:
// Configuración de Firebase y autenticación para login con Google

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'skillwave-studio.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'skillwave-studio',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'skillwave-studio.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:demo'
};

// Initialize Firebase
console.debug('🔥 Initializing Firebase');
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Removed prompt: 'select_account' to prevent popup auto-closing
console.debug('🔥 Google Auth Provider configured');

console.debug('🔥 Firebase services initialized');

export default app;