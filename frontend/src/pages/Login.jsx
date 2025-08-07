// pages/Login.jsx

// 🧠 English:
// Login page with Google authentication and demo mode option

// 💬 Español humano:
// Página de login con autenticación de Google y opción de modo demo

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { auth, googleProvider } from '../services/firebase';
import Button from '../components/UI/Button';

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, startDemoMode, isAuthenticated, isLoading } = useAuth();

  // Check for demo mode parameter
  const urlParams = new URLSearchParams(location.search);
  const isDemoMode = urlParams.get('demo') === 'true';

  useEffect(() => {
    console.debug('🔐 Login page loaded, checking auth state');
    console.debug('🔐 isAuthenticated:', isAuthenticated);
    console.debug('🔐 isDemoMode from URL:', isDemoMode);
    
    // Handle URL demo mode parameter
    if (isDemoMode && !isAuthenticated) {
      console.debug('🔐 Demo mode requested via URL parameter');
      handleDemoMode();
    }
  }, [isDemoMode]);

  // Separate effect for navigation when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.debug('🔐 User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    console.debug('🔐 Attempting Google login');
    
    const result = await loginWithGoogle();
    if (result.success) {
      console.debug('🔐 Login successful, redirecting to dashboard');
      navigate('/dashboard');
    } else {
      console.error('🔐 Login failed:', result.error);
    }
  };

  const handleDemoMode = () => {
    console.debug('🔐 Starting demo mode');
    
    const result = startDemoMode();
    console.debug('🔐 startDemoMode result:', result);
    
    if (result.success) {
      console.debug('🔐 Demo mode activated, redirecting to dashboard');
      navigate('/dashboard');
    } else {
      console.error('🔐 Demo mode failed:', result);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    console.debug(`🌐 Language changed to: ${newLang}`);
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">SW</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900">
            {t('auth.loginTitle')}
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="space-y-6">
            {/* Google Login Button */}
            <Button
              onClick={handleGoogleLogin}
              loading={isLoading}
              className="w-full flex justify-center items-center"
              size="large"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth.loginButton')}
            </Button>

            {/* Demo Mode Button */}
            <div className="text-center">
              <span className="text-sm text-gray-500">{t('auth.orText')}</span>
            </div>
            
            <Button
              onClick={handleDemoMode}
              variant="outline"
              className="w-full"
              size="large"
            >
              {t('auth.demoButton')}
            </Button>

            {/* Language Toggle */}
            <div className="text-center">
              <button
                onClick={toggleLanguage}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {i18n.language === 'en' ? 'Español' : 'English'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            {t('auth.footer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;