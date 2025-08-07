import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './hooks/useAuth';
import './i18n';
import './App.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    console.debug('🚀 Skillwave Studio MVP initialized');
    console.debug('🌐 Current language:', i18n.language);
  }, [i18n.language]);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/editor/:projectId" 
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
