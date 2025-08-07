// hooks/useEditor.js

// 🧠 English:
// Custom hook for editor operations: adding, updating, deleting blocks in the visual canvas with full pedagogical support

// 💬 Español humano:
// Hook personalizado para operaciones del editor: agregar, actualizar, eliminar bloques en el canvas visual con soporte pedagógico completo

import { useEditorStore } from '../store/useEditorStore';
import { useLogger } from './useLogger';
import { validateElement, validateElements, safeValidate } from '../utils/validateBlocks';
import { throwIf } from '../utils/throwIf';
import { logDebug, logError, logPerformance } from '../debug/report';

export function useEditor() {
  const {
    elements,
    selectedElementId,
    viewMode,
    currentProject,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    clearSelection,
    setViewMode,
    setCurrentProject,
    clearCanvas,
    getSelectedElement,
    generateHTML,
    generateCSS
  } = useEditorStore();

  const { logAction } = useLogger();

  console.debug('[useEditor] Editor hook initialized with', elements.length, 'elements');

  const handleAddElement = (elementType, position) => {
    const startTime = Date.now();
    
    try {
      console.debug(`🧩 [useEditor] Adding ${elementType} element to canvas`);
      
      // 🧠 English: Validate input parameters before processing
      // 💬 Español humano: Validar parámetros de entrada antes de procesar
      throwIf(!elementType, 'Element type is required', 'useEditor.handleAddElement');
      throwIf(!position, 'Position is required', 'useEditor.handleAddElement');
      
      // Add element and validate result
      const newElement = addElement(elementType, position);
      
      // Validate the created element (but don't fail if validation fails - just warn)
      try {
        if (safeValidate(validateElement, newElement, 'useEditor.handleAddElement')) {
          console.debug(`✅ [useEditor] ${elementType} element validated successfully`);
        }
      } catch (validationError) {
        console.warn(`⚠️ [useEditor] Element validation failed but continuing:`, validationError.message);
      }
      
      // Log action for AI educational system
      logAction(`Added ${elementType} element to canvas`);
      logDebug('EDITOR_ADD_ELEMENT', 'Element added to canvas', {
        elementType,
        position,
        elementId: newElement.id,
        totalElements: elements.length + 1
      });
      
      const duration = Date.now() - startTime;
      logPerformance('add_element', duration, { elementType });
      
      // 🧠 English: Educational debug - help user understand what happened
      // 💬 Español humano: Debug educativo - ayudar al usuario a entender lo que pasó
      console.debug(`🧠 Educational: Added ${elementType} at position (${position.x}, ${position.y}). This creates new HTML element in your website.`);
      
      return newElement;
      
    } catch (error) {
      console.error(`❌ [useEditor] Failed to add ${elementType} element:`, error);
      logError('editor_add_element_failed', { elementType, position, error: error.message });
      throw error;
    }
  };

  const handleUpdateElement = (elementId, updates) => {
    const startTime = Date.now();
    
    try {
      console.debug(`🔧 [useEditor] Updating element ${elementId}`, updates);
      
      // 🧠 English: Validate inputs and current element state
      // 💬 Español humano: Validar entradas y estado actual del elemento
      throwIf(!elementId, 'Element ID is required', 'useEditor.handleUpdateElement');
      throwIf(!updates, 'Updates object is required', 'useEditor.handleUpdateElement');
      
      const currentElement = getSelectedElement();
      if (currentElement && safeValidate(validateElement, currentElement, 'useEditor.beforeUpdate')) {
        console.debug(`✅ [useEditor] Current element state is valid`);
      }
      
      updateElement(elementId, updates);
      
      // Log educational action
      const updateType = updates.properties ? 'properties' : updates.position ? 'position' : 'general';
      logAction(`Updated ${getElementTypeName(elementId)} ${updateType}`);
      logDebug('EDITOR_UPDATE_ELEMENT', 'Element updated', {
        elementId,
        updateType,
        updates: Object.keys(updates)
      });
      
      const duration = Date.now() - startTime;
      logPerformance('update_element', duration, { updateType });
      
      // 🧠 English: Educational explanation of what update means
      // 💬 Español humano: Explicación educativa de lo que significa la actualización
      console.debug(`🧠 Educational: Updated ${getElementTypeName(elementId)} ${updateType}. This modifies the CSS/HTML properties of your element.`);
      
    } catch (error) {
      console.error(`❌ [useEditor] Failed to update element ${elementId}:`, error);
      logError('editor_update_element_failed', { elementId, updates, error: error.message });
      throw error;
    }
  };

  const handleDeleteElement = (elementId) => {
    const startTime = Date.now();
    
    try {
      const elementType = getElementTypeName(elementId);
      console.debug(`🗑️ [useEditor] Deleting ${elementType} element`);
      
      // 🧠 English: Validate element exists before deletion
      // 💬 Español humano: Validar que el elemento existe antes de eliminarlo
      throwIf(!elementId, 'Element ID is required', 'useEditor.handleDeleteElement');
      
      const elementToDelete = elements.find(el => el.id === elementId);
      throwIf(!elementToDelete, `Element with ID ${elementId} not found`, 'useEditor.handleDeleteElement');
      
      deleteElement(elementId);
      
      // Log educational action
      logAction(`Deleted ${elementType} element`);
      logDebug('EDITOR_DELETE_ELEMENT', 'Element deleted', {
        elementId,
        elementType,
        remainingElements: elements.length - 1
      });
      
      const duration = Date.now() - startTime;
      logPerformance('delete_element', duration, { elementType });
      
      // 🧠 English: Educational note about deletion
      // 💬 Español humano: Nota educativa sobre la eliminación
      console.debug(`🧠 Educational: Deleted ${elementType} element. This removes the HTML element from your website code.`);
      
    } catch (error) {
      console.error(`❌ [useEditor] Failed to delete element ${elementId}:`, error);
      logError('editor_delete_element_failed', { elementId, error: error.message });
      throw error;
    }
  };

  const handleSelectElement = (elementId) => {
    try {
      console.debug(`👆 [useEditor] Selecting element ${elementId}`);
      
      selectElement(elementId);
      
      if (elementId) {
        const elementType = getElementTypeName(elementId);
        logAction(`Selected ${elementType} element`);
        logDebug('EDITOR_SELECT_ELEMENT', 'Element selected', { elementId, elementType });
        
        // 🧠 English: Educational note about selection
        // 💬 Español humano: Nota educativa sobre la selección
        console.debug(`🧠 Educational: Selected ${elementType} element. Now you can edit its properties in the right panel.`);
      }
      
    } catch (error) {
      console.error(`❌ [useEditor] Failed to select element ${elementId}:`, error);
      logError('editor_select_element_failed', { elementId, error: error.message });
    }
  };

  const handleViewModeChange = (mode) => {
    try {
      console.debug(`👁️ [useEditor] Changing view mode to: ${mode}`);
      
      // 🧠 English: Validate view mode is supported
      // 💬 Español humano: Validar que el modo de vista está soportado
      const validModes = ['canvas', 'code', 'both'];
      throwIf(!validModes.includes(mode), `Invalid view mode: ${mode}`, 'useEditor.handleViewModeChange');
      
      setViewMode(mode);
      logAction(`Changed view to ${mode} mode`);
      logDebug('EDITOR_VIEW_MODE_CHANGE', 'View mode changed', { mode, previousMode: viewMode });
      
      // 🧠 English: Educational explanation of view modes
      // 💬 Español humano: Explicación educativa de los modos de vista
      const explanations = {
        canvas: 'Visual editing mode - drag and drop elements like in design tools',
        code: 'Code view mode - see the HTML/CSS being generated in real-time',
        both: 'Split view mode - see both visual editor and code simultaneously'
      };
      
      console.debug(`🧠 Educational: Switched to ${mode} mode. ${explanations[mode]}`);
      
    } catch (error) {
      console.error(`❌ [useEditor] Failed to change view mode to ${mode}:`, error);
      logError('editor_view_mode_change_failed', { mode, error: error.message });
    }
  };

  const exportProject = () => {
    const startTime = Date.now();
    
    try {
      console.debug('📦 [useEditor] Exporting project');
      
      // 🧠 English: Validate elements before export
      // 💬 Español humano: Validar elementos antes de exportar
      if (safeValidate(validateElements, elements, 'useEditor.exportProject')) {
        console.debug(`✅ [useEditor] All ${elements.length} elements validated for export`);
      }
      
      const html = generateHTML();
      const css = generateCSS();
      
      // Validate generated code
      throwIf(!html || html.trim().length === 0, 'Generated HTML is empty', 'useEditor.exportProject');
      throwIf(!css || css.trim().length === 0, 'Generated CSS is empty', 'useEditor.exportProject');
      
      logAction('Exported project as HTML/CSS');
      logDebug('EDITOR_EXPORT_PROJECT', 'Project exported', {
        elementCount: elements.length,
        htmlLength: html.length,
        cssLength: css.length
      });
      
      const duration = Date.now() - startTime;
      logPerformance('export_project', duration, { elementCount: elements.length });
      
      // 🧠 English: Educational note about export
      // 💬 Español humano: Nota educativa sobre la exportación
      console.debug(`🧠 Educational: Exported project with ${elements.length} elements. Generated ${html.length} chars of HTML and ${css.length} chars of CSS.`);
      
      return { html, css };
      
    } catch (error) {
      console.error('❌ [useEditor] Failed to export project:', error);
      logError('editor_export_project_failed', { elementCount: elements.length, error: error.message });
      throw error;
    }
  };

  const getElementTypeName = (elementId) => {
    try {
      const element = elements.find(el => el.id === elementId);
      return element ? element.type : 'unknown';
    } catch (error) {
      console.warn(`⚠️ [useEditor] Could not determine element type for ${elementId}:`, error);
      return 'unknown';
    }
  };

  // 🧠 English: Return enhanced editor interface with validation and logging
  // 💬 Español humano: Devolver interfaz mejorada del editor con validación y logging
  return {
    // State
    elements,
    selectedElementId,
    viewMode,
    currentProject,
    selectedElement: getSelectedElement(),
    
    // Enhanced Actions with validation and educational logging
    addElement: handleAddElement,
    updateElement: handleUpdateElement,
    deleteElement: handleDeleteElement,
    selectElement: handleSelectElement,
    clearSelection,
    setViewMode: handleViewModeChange,
    setCurrentProject,
    clearCanvas,
    exportProject,
    
    // Utilities
    generateHTML,
    generateCSS,
    hasElements: elements.length > 0,
    getElementTypeName,
    
    // Validation utilities
    validateCurrentElements: () => safeValidate(validateElements, elements, 'useEditor.validateCurrentElements'),
    validateElement: (element) => safeValidate(validateElement, element, 'useEditor.validateElement')
  };
}

console.debug('🎣 Enhanced useEditor hook loaded with validation, logging, and educational features');