// utils/validateBlocks.js

// 🧠 English:
// Validation utilities for editor blocks to ensure data integrity and prevent errors

// 💬 Español humano:
// Utilidades de validación para bloques del editor que aseguran integridad de datos y previenen errores

import { throwIf, throwIfNull, throwIfEmptyString } from './throwIf';

/**
 * Validates a single editor element/block
 * @param {Object} element - Element to validate
 * @param {string} context - Context for error messages
 * @returns {boolean} - True if valid
 */
export const validateElement = (element, context = 'validateElement') => {
  console.debug(`🔍 [${context}] Validating element:`, element?.type || 'unknown');

  // Check if element exists
  throwIfNull(element, 'element', context);
  
  // Validate required properties
  throwIfEmptyString(element.id, 'element.id', context);
  throwIfEmptyString(element.type, 'element.type', context);
  throwIfNull(element.position, 'element.position', context);
  throwIfNull(element.properties, 'element.properties', context);

  // Validate position object
  throwIfNull(element.position.x, 'element.position.x', context);
  throwIfNull(element.position.y, 'element.position.y', context);
  
  throwIf(
    typeof element.position.x !== 'number' || typeof element.position.y !== 'number',
    'Position coordinates must be numbers',
    context
  );

  // Validate element type
  const validTypes = ['text', 'button', 'image'];
  throwIf(
    !validTypes.includes(element.type),
    `Invalid element type: ${element.type}. Valid types: ${validTypes.join(', ')}`,
    context
  );

  // Type-specific validations
  switch (element.type) {
    case 'text':
      throwIfEmptyString(element.properties.content, 'text content', context);
      break;
    case 'button':
      throwIfEmptyString(element.properties.content, 'button content', context);
      break;
    case 'image':
      throwIfEmptyString(element.properties.src, 'image src', context);
      break;
  }

  console.debug(`✅ [${context}] Element validation passed for ${element.type}`);
  return true;
};

/**
 * Validates an array of elements
 * @param {Array} elements - Array of elements to validate
 * @param {string} context - Context for error messages
 * @returns {boolean} - True if all valid
 */
export const validateElements = (elements, context = 'validateElements') => {
  console.debug(`🔍 [${context}] Validating ${elements?.length || 0} elements`);

  throwIfNull(elements, 'elements array', context);
  
  throwIf(
    !Array.isArray(elements),
    'Elements must be an array',
    context
  );

  // Validate each element
  elements.forEach((element, index) => {
    try {
      validateElement(element, `${context}[${index}]`);
    } catch (error) {
      throw new Error(`Element at index ${index} failed validation: ${error.message}`);
    }
  });

  // Check for duplicate IDs
  const ids = elements.map(el => el.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  
  throwIf(
    duplicateIds.length > 0,
    `Duplicate element IDs found: ${duplicateIds.join(', ')}`,
    context
  );

  console.debug(`✅ [${context}] All ${elements.length} elements validated successfully`);
  return true;
};

/**
 * Validates project data structure
 * @param {Object} project - Project to validate
 * @param {string} context - Context for error messages
 * @returns {boolean} - True if valid
 */
export const validateProject = (project, context = 'validateProject') => {
  console.debug(`🔍 [${context}] Validating project:`, project?.name || 'unnamed');

  throwIfNull(project, 'project', context);
  throwIfEmptyString(project.id, 'project.id', context);
  throwIfEmptyString(project.name, 'project.name', context);
  throwIfEmptyString(project.userId, 'project.userId', context);
  
  if (project.elements) {
    validateElements(project.elements, `${context}.elements`);
  }

  console.debug(`✅ [${context}] Project validation passed for "${project.name}"`);
  return true;
};

/**
 * Safe wrapper for validation functions - catches and logs errors instead of throwing
 * @param {Function} validator - Validation function to call
 * @param {...any} args - Arguments to pass to validator
 * @returns {boolean} - True if valid, false if error
 */
export const safeValidate = (validator, ...args) => {
  try {
    return validator(...args);
  } catch (error) {
    console.warn(`🚨 Validation failed (non-critical):`, error.message);
    
    // Log for educational purposes
    console.debug(`🧠 Educational Note: Validation caught an error - this helps prevent crashes`);
    
    return false;
  }
};

console.debug('🔍 Validation utilities loaded - validateElement, validateElements, validateProject, safeValidate');