// i18n configuration for Skillwave Studio
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslations from './en.json';
import esTranslations from './es.json';

// 🧠 English: Enhanced i18n with language detection and persistence
// 💬 Español humano: i18n mejorado con detección de idioma y persistencia

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      es: {
        translation: esTranslations
      }
    },
    lng: undefined, // Let LanguageDetector determine the language
    fallbackLng: 'en',
    
    detection: {
      // Define the order of language detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Cache user language
      caches: ['localStorage'],
      
      // localStorage key for language preference
      lookupLocalStorage: 'skillwave-language',
      
      // Language code normalization
      convertDetectedLanguage: (lng) => {
        // Normalize complex language codes to simple ones
        if (lng.startsWith('en')) return 'en';
        if (lng.startsWith('es')) return 'es';
        return lng;
      },
      
      // Exclude cookies for privacy
      excludeCacheFor: ['cimode']
    },
    
    interpolation: {
      escapeValue: false
    },
    
    // Debug logging in development
    debug: process.env.NODE_ENV === 'development'
  });

// Log language initialization
console.debug('🌍 [i18n] Language system initialized with persistence');
console.debug('🌍 [i18n] Current language:', i18n.language);

// Listen for language changes to log them
i18n.on('languageChanged', (lng) => {
  console.debug('🌍 [i18n] Language changed to:', lng);
});

export default i18n;