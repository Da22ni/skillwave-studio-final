// components/Editor/DraggableElement.jsx

// 🧠 English:
// Optimized draggable element component with React.memo for performance
// Handles rendering of individual elements in the canvas with memoization

// 💬 Español humano:
// Componente de elemento arrastrable optimizado con React.memo para rendimiento
// Maneja renderizado de elementos individuales en el canvas con memoización

import React, { memo, useMemo } from 'react';
import { useEditor } from '../../hooks/useEditor';
import { useLogger } from '../../hooks/useLogger';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

const DraggableElement = memo(({ element, onSelect, onUpdate, isSelected }) => {
  const { updateElement, deleteElement } = useEditor();
  const { logAction } = useLogger();
  const { startRender, endRender } = usePerformanceMonitor();

  // Performance monitoring
  React.useEffect(() => {
    startRender();
    return () => endRender(1);
  }, [startRender, endRender]);

  // Memoize element styles for performance
  const elementStyle = useMemo(() => ({
    position: 'absolute',
    left: `${element.position.x}px`,
    top: `${element.position.y}px`,
    cursor: 'move',
    userSelect: 'none',
    zIndex: isSelected ? 1000 : 1,
    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: isSelected 
      ? '0 4px 12px rgba(59, 130, 246, 0.3), 0 0 0 2px #3B82F6' 
      : '0 2px 4px rgba(0, 0, 0, 0.1)',
  }), [element.position.x, element.position.y, isSelected]);

  // Memoize content rendering
  const renderContent = useMemo(() => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            style={{
              color: element.properties.color || '#333',
              fontSize: element.properties.fontSize || '16px',
              fontWeight: element.properties.fontWeight || 'normal',
              padding: '8px 12px',
              minWidth: '100px',
              minHeight: '32px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
            }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const newContent = e.target.innerText;
              if (newContent !== element.properties.content) {
                updateElement(element.id, {
                  ...element.properties,
                  content: newContent
                });
                logAction(`Updated text element: "${newContent}"`);
              }
            }}
          >
            {element.properties.content || 'Click to edit'}
          </div>
        );

      case 'button':
        return (
          <button
            style={{
              backgroundColor: element.properties.backgroundColor || '#3B82F6',
              color: element.properties.color || 'white',
              padding: element.properties.padding || '8px 16px',
              border: 'none',
              borderRadius: element.properties.borderRadius || '4px',
              fontSize: element.properties.fontSize || '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              minWidth: '80px',
              minHeight: '36px'
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              const newText = prompt('Button text:', element.properties.content || 'Button');
              if (newText !== null) {
                updateElement(element.id, {
                  ...element.properties,
                  content: newText
                });
                logAction(`Updated button text: "${newText}"`);
              }
            }}
          >
            {element.properties.content || 'Button'}
          </button>
        );

      case 'image':
        return (
          <div
            style={{
              width: element.properties.width || '150px',
              height: element.properties.height || '100px',
              backgroundColor: '#f3f4f6',
              border: '2px dashed #d1d5db',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              const newSrc = prompt('Image URL:', element.properties.src || '');
              if (newSrc !== null) {
                updateElement(element.id, {
                  ...element.properties,
                  src: newSrc
                });
                logAction(`Updated image source: "${newSrc}"`);
              }
            }}
          >
            {element.properties.src ? (
              <img
                src={element.properties.src}
                alt={element.properties.alt || 'Image'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="color: #ef4444; font-size: 12px; text-align: center;">❌ Failed to load image</div>';
                }}
              />
            ) : (
              <div style={{ 
                color: '#6b7280', 
                fontSize: '12px', 
                textAlign: 'center',
                padding: '8px'
              }}>
                🖼️ Double-click to add image
              </div>
            )}
          </div>
        );

      default:
        return (
          <div style={{
            padding: '16px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            color: '#dc2626',
            fontSize: '12px'
          }}>
            Unknown element type: {element.type}
          </div>
        );
    }
  }, [element, updateElement, logAction]);

  // Handle drag start
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', element.id);
    logAction(`Started dragging ${element.type} element`);
  };

  // Handle click to select
  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(element.id);
    logAction(`Selected ${element.type} element`);
  };

  // Handle delete key
  const handleKeyDown = (e) => {
    if (isSelected && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      deleteElement(element.id);
      logAction(`Deleted ${element.type} element`);
    }
  };

  return (
    <div
      style={elementStyle}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      data-element-id={element.id}
      data-element-type={element.type}
    >
      {renderContent}
      
      {/* Delete button when selected */}
      {isSelected && (
        <button
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001
          }}
          onClick={(e) => {
            e.stopPropagation();
            deleteElement(element.id);
            logAction(`Deleted ${element.type} element via delete button`);
          }}
        >
          ×
        </button>
      )}
    </div>
  );
});

// Display name for debugging
DraggableElement.displayName = 'DraggableElement';

// Custom comparison function for React.memo
const arePropsEqual = (prevProps, nextProps) => {
  return (
    prevProps.element.id === nextProps.element.id &&
    prevProps.element.position.x === nextProps.element.position.x &&
    prevProps.element.position.y === nextProps.element.position.y &&
    JSON.stringify(prevProps.element.properties) === JSON.stringify(nextProps.element.properties) &&
    prevProps.isSelected === nextProps.isSelected
  );
};

export default memo(DraggableElement, arePropsEqual);