// utils/throwIf.js

// 🧠 English:
// Utility function for defensive programming - throws errors when conditions are met

// 💬 Español humano:
// Función de utilidad para programación defensiva - lanza errores cuando se cumplen condiciones

/**
 * Throws an error if the condition is true
 * @param {boolean} condition - Condition to check
 * @param {string} message - Error message to throw
 * @param {string} component - Component name for debugging
 */
export const throwIf = (condition, message, component = 'Unknown') => {
  if (condition) {
    const errorMsg = `[${component}] ${message}`;
    console.error(`❌ throwIf triggered: ${errorMsg}`);
    
    // Log to educational system for learning purposes
    console.debug(`🧠 Educational Note: throwIf is a defensive programming pattern that helps catch errors early`);
    
    throw new Error(errorMsg);
  }
};

/**
 * Throws error if value is null or undefined
 * @param {any} value - Value to check
 * @param {string} valueName - Name of the value for error message
 * @param {string} component - Component name
 */
export const throwIfNull = (value, valueName, component = 'Unknown') => {
  throwIf(
    value === null || value === undefined, 
    `${valueName} cannot be null or undefined`, 
    component
  );
};

/**
 * Throws error if array is empty
 * @param {Array} array - Array to check
 * @param {string} arrayName - Name of array for error message
 * @param {string} component - Component name
 */
export const throwIfEmpty = (array, arrayName, component = 'Unknown') => {
  throwIfNull(array, arrayName, component);
  throwIf(
    Array.isArray(array) && array.length === 0, 
    `${arrayName} cannot be empty`, 
    component
  );
};

/**
 * Throws error if string is empty or whitespace
 * @param {string} str - String to check
 * @param {string} strName - Name of string for error message
 * @param {string} component - Component name
 */
export const throwIfEmptyString = (str, strName, component = 'Unknown') => {
  throwIfNull(str, strName, component);
  throwIf(
    typeof str === 'string' && str.trim().length === 0, 
    `${strName} cannot be empty string`, 
    component
  );
};

console.debug('🛡️ Defensive programming utilities loaded - throwIf, throwIfNull, throwIfEmpty, throwIfEmptyString');