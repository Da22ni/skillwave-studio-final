// store/useResponsiveStore.js

// 🧠 English:
// Responsive design state management. Handles device view modes and canvas sizing.

// 💬 Español humano:
// Manejo del estado de diseño responsivo. Controla modos de vista de dispositivos y tamaños del canvas.

import { create } from 'zustand';

export const useResponsiveStore = create((set, get) => ({
  // State
  currentDevice: 'desktop', // 'desktop', 'tablet', 'mobile'
  deviceSizes: {
    desktop: { width: 1200, height: 800 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  },
  
  // Actions
  setDevice: (device) => {
    console.debug(`📱 Device view changed to: ${device}`);
    
    // 🧠 English: Log the responsive change for educational AI
    // 💬 Español humano: Registra el cambio responsivo para la IA educativa
    
    set({ currentDevice: device });
  },

  // Getters
  getCurrentSize: () => {
    const { currentDevice, deviceSizes } = get();
    return deviceSizes[currentDevice];
  },

  getDeviceClass: () => {
    const { currentDevice } = get();
    return `device-${currentDevice}`;
  },

  isDesktop: () => get().currentDevice === 'desktop',
  isTablet: () => get().currentDevice === 'tablet',
  isMobile: () => get().currentDevice === 'mobile',

  // Utility methods
  getCanvasStyle: () => {
    const size = get().getCurrentSize();
    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
      maxWidth: '100%',
      margin: '0 auto',
      border: '1px solid #ddd',
      backgroundColor: '#fff',
      position: 'relative',
      overflow: 'hidden'
    };
  }
}));