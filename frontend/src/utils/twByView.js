// utils/twByView.js

// 🧠 English:
// Tailwind CSS utility functions that adapt styles based on responsive view modes

// 💬 Español humano:
// Funciones de utilidad de Tailwind CSS que adaptan estilos según los modos de vista responsivos

/**
 * Returns Tailwind classes based on current device view
 * @param {string} device - Current device: 'desktop', 'tablet', 'mobile'
 * @param {Object} classes - Classes for each device
 * @returns {string} - Tailwind classes for current device
 */
export const twByView = (device, classes = {}) => {
  console.debug(`🎨 [twByView] Generating classes for device: ${device}`);
  
  const defaultClasses = {
    desktop: '',
    tablet: '',
    mobile: '',
    ...classes
  };
  
  const result = defaultClasses[device] || defaultClasses.desktop;
  
  console.debug(`🎨 [twByView] Applied classes: "${result}"`);
  return result;
};

/**
 * Returns responsive Tailwind classes with breakpoint prefixes
 * @param {Object} breakpoints - Classes for each breakpoint
 * @returns {string} - Complete responsive Tailwind classes
 */
export const twResponsive = (breakpoints = {}) => {
  console.debug(`🎨 [twResponsive] Generating responsive classes`);
  
  const {
    base = '',
    sm = '',
    md = '',
    lg = '',
    xl = ''
  } = breakpoints;
  
  const classes = [
    base,
    sm && `sm:${sm}`,
    md && `md:${md}`,
    lg && `lg:${lg}`,
    xl && `xl:${xl}`
  ].filter(Boolean).join(' ');
  
  console.debug(`🎨 [twResponsive] Applied responsive classes: "${classes}"`);
  return classes;
};

/**
 * Generates container classes based on current view
 * @param {string} device - Current device view
 * @returns {string} - Container Tailwind classes
 */
export const twContainer = (device) => {
  console.debug(`📦 [twContainer] Generating container for: ${device}`);
  
  return twByView(device, {
    desktop: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    tablet: 'max-w-4xl mx-auto px-4 sm:px-6',
    mobile: 'max-w-sm mx-auto px-2'
  });
};

/**
 * Generates text size classes based on device
 * @param {string} device - Current device view
 * @param {string} size - Base size: 'xs', 'sm', 'base', 'lg', 'xl', '2xl', etc.
 * @returns {string} - Text size Tailwind classes
 */
export const twTextSize = (device, size = 'base') => {
  console.debug(`📝 [twTextSize] Generating text size ${size} for: ${device}`);
  
  const sizeMap = {
    xs: { desktop: 'text-xs', tablet: 'text-xs', mobile: 'text-xs' },
    sm: { desktop: 'text-sm', tablet: 'text-sm', mobile: 'text-xs' },
    base: { desktop: 'text-base', tablet: 'text-sm', mobile: 'text-xs' },
    lg: { desktop: 'text-lg', tablet: 'text-base', mobile: 'text-sm' },
    xl: { desktop: 'text-xl', tablet: 'text-lg', mobile: 'text-base' },
    '2xl': { desktop: 'text-2xl', tablet: 'text-xl', mobile: 'text-lg' },
    '3xl': { desktop: 'text-3xl', tablet: 'text-2xl', mobile: 'text-xl' }
  };
  
  return twByView(device, sizeMap[size] || sizeMap.base);
};

console.debug('🎨 Tailwind view utilities loaded - twByView, twResponsive, twContainer, twTextSize');