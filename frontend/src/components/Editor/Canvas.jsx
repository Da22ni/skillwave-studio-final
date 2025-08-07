// components/Editor/Canvas.jsx

// 🧠 English:
// Visual drag-and-drop canvas for building websites with real-time editing

// 💬 Español humano:
// Canvas visual de arrastrar y soltar para construir sitios web con edición en tiempo real

import React, { useRef, useState } from 'react';
import { useEditor } from '../../hooks/useEditor';
import { useLogger } from '../../hooks/useLogger';
import { useResponsiveStore } from '../../store/useResponsiveStore';
import DraggableElement from './DraggableElement';

const Canvas = () => {
  const canvasRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const { elements, addElement, selectElement, selectedElementId } = useEditor();
  const { logAction } = useLogger();
  const { getCanvasStyle } = useResponsiveStore();

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    console.debug('🎯 Canvas drop event triggered');

    // Try multiple dataTransfer formats to ensure compatibility
    let elementType = e.dataTransfer.getData('elementType');
    if (!elementType) {
      elementType = e.dataTransfer.getData('text/plain');
    }
    if (!elementType) {
      elementType = e.dataTransfer.getData('application/json');
    }
    
    console.debug('🎯 Element type from dataTransfer:', elementType);
    
    if (!elementType) {
      console.error('❌ No element type data found in drag transfer');
      logAction('Failed to drop element: No element type data found');
      return;
    }

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    console.debug(`📍 Drop position: x=${x}, y=${y}`);

    // 🧠 English: Add element at drop position and log the action
    // 💬 Español humano: Agrega elemento en la posición de drop y registra la acción
    
    try {
      console.debug('🎯 Adding element:', elementType, 'at position:', { x, y });
      
      const newElement = addElement(elementType, { x, y });
      console.debug('✅ Element added successfully:', newElement?.id);
      
      logAction(`Dropped ${elementType} element on canvas at position (${Math.round(x)}, ${Math.round(y)})`);
      return newElement;
      
    } catch (error) {
      console.error('❌ Failed to add element:', error.message);
      logAction(`Failed to drop ${elementType} element: ${error.message}`);
    }
  };

  const handleCanvasClick = (e) => {
    // Only clear selection if clicking on canvas background
    if (e.target === canvasRef.current) {
      console.debug('🖱️ Canvas background clicked, clearing selection');
      selectElement(null);
    }
  };

  const canvasStyle = getCanvasStyle();

  return (
    <div className="w-full h-full overflow-auto bg-gray-100 p-4">
      <div
        ref={canvasRef}
        className={`relative bg-white border-2 transition-all duration-200 ${
          dragOver 
            ? 'border-blue-500 border-dashed bg-blue-50' 
            : 'border-gray-300'
        }`}
        style={canvasStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
      >
        {/* Grid Background for Visual Aid */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Render Elements */}
        {elements.map((element) => (
          <DraggableElement
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            onSelect={() => selectElement(element.id)}
          />
        ))}

        {/* Drop Zone Hint */}
        {elements.length === 0 && !dragOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-lg font-medium">Drag elements here to start building</p>
              <p className="text-sm">Your visual website will appear here</p>
            </div>
          </div>
        )}

        {/* Drop Zone Visual Feedback */}
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-75 pointer-events-none">
            <div className="text-center text-blue-600">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-lg font-semibold">Drop element here</p>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Canvas: {canvasStyle.width} × {canvasStyle.height} | Elements: {elements.length}
      </div>
    </div>
  );
};

export default Canvas;