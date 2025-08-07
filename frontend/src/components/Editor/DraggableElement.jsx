// components/Editor/DraggableElement.jsx

// 🧠 English:
// Individual draggable element component that renders text, buttons, images, etc. on the canvas

// 💬 Español humano:
// Componente de elemento arrastrable individual que renderiza texto, botones, imágenes, etc. en el canvas

import React, { useState, useRef } from 'react';
import { useEditor } from '../../hooks/useEditor';
import { useLogger } from '../../hooks/useLogger';

const DraggableElement = ({ element, isSelected, onSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);
  const { updateElement } = useEditor();
  const { logAction } = useLogger();

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    onSelect();

    const rect = elementRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    console.debug(`🖱️ Started dragging element ${element.type}`);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();
    const canvas = elementRef.current.offsetParent;
    const canvasRect = canvas.getBoundingClientRect();

    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;

    // Constrain to canvas bounds
    const maxX = canvas.offsetWidth - elementRef.current.offsetWidth;
    const maxY = canvas.offsetHeight - elementRef.current.offsetHeight;

    const constrainedX = Math.max(0, Math.min(newX, maxX));
    const constrainedY = Math.max(0, Math.min(newY, maxY));

    updateElement(element.id, {
      position: { x: constrainedX, y: constrainedY }
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      console.debug(`🖱️ Finished dragging element ${element.type}`);
      logAction(`Moved ${element.type} element to position (${Math.round(element.position.x)}, ${Math.round(element.position.y)})`);
    }
  };

  // Attach global mouse events when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, dragOffset]);

  const renderElementContent = () => {
    const { type, properties } = element;

    switch (type) {
      case 'text':
        return (
          <div
            style={{
              fontSize: properties.fontSize,
              color: properties.color,
              fontFamily: properties.fontFamily,
              fontWeight: properties.fontWeight
            }}
          >
            {properties.content}
          </div>
        );

      case 'button':
        return (
          <button
            style={{
              backgroundColor: properties.backgroundColor,
              color: properties.color,
              padding: properties.padding,
              border: properties.border,
              borderRadius: properties.borderRadius,
              fontSize: properties.fontSize,
              cursor: 'pointer'
            }}
            onClick={(e) => e.preventDefault()} // Prevent actual button clicks in editor
          >
            {properties.content}
          </button>
        );

      case 'image':
        return (
          <img
            src={properties.src}
            alt={properties.alt}
            style={{
              width: properties.width,
              height: properties.height,
              objectFit: 'cover'
            }}
            draggable={false}
          />
        );

      default:
        return (
          <div className="bg-gray-200 p-2 rounded">
            Unknown Element: {type}
          </div>
        );
    }
  };

  const elementStyle = {
    position: 'absolute',
    left: `${element.position.x}px`,
    top: `${element.position.y}px`,
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isSelected ? 1000 : 1,
    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
    transition: isDragging ? 'none' : 'transform 0.2s ease'
  };

  return (
    <div
      ref={elementRef}
      className={`
        inline-block transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-75' : ''}
        ${isDragging ? 'shadow-lg' : 'hover:shadow-sm'}
      `}
      style={elementStyle}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {renderElementContent()}

      {/* Selection Handles */}
      {isSelected && !isDragging && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-nw-resize"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-ne-resize"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-sw-resize"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-se-resize"></div>
        </>
      )}

      {/* Element Type Badge */}
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          {element.type}
        </div>
      )}
    </div>
  );
};

export default DraggableElement;