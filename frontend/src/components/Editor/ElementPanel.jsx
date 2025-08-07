// components/Editor/ElementPanel.jsx

// 🧠 English:
// Panel showing available elements that can be dragged onto the canvas

// 💬 Español humano:
// Panel que muestra elementos disponibles que se pueden arrastrar al canvas

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLogger } from '../../hooks/useLogger';

const ElementPanel = () => {
  const { t } = useTranslation();
  const { logAction } = useLogger();

  const elements = [
    {
      type: 'text',
      name: t('editor.textBlock'),
      icon: 'T',
      description: 'Add text content',
      color: 'bg-blue-500'
    },
    {
      type: 'button',
      name: t('editor.buttonBlock'),
      icon: '□',
      description: 'Interactive button',
      color: 'bg-green-500'
    },
    {
      type: 'image',
      name: t('editor.imageBlock'),
      icon: '🖼',
      description: 'Image element',
      color: 'bg-purple-500'
    }
  ];

  const handleDragStart = (e, elementType) => {
    console.debug(`🎯 Starting drag for element: ${elementType}`);
    e.dataTransfer.setData('elementType', elementType);
    e.dataTransfer.effectAllowed = 'copy';
    
    logAction(`Started dragging ${elementType} element`);
  };

  return (
    <div className="w-60 bg-white border-r border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('editor.addElement')}
      </h3>

      <div className="space-y-3">
        {elements.map((element) => (
          <div
            key={element.type}
            className="group cursor-move"
            draggable
            onDragStart={(e) => handleDragStart(e, element.type)}
          >
            <div className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
              <div className={`w-10 h-10 ${element.color} rounded-lg flex items-center justify-center text-white font-bold mr-3`}>
                {element.icon}
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {element.name}
                </h4>
                <p className="text-xs text-gray-500">
                  {element.description}
                </p>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">How to use:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Drag elements to canvas</li>
          <li>• Click to select elements</li>
          <li>• Edit properties on right panel</li>
          <li>• View code in real-time</li>
        </ul>
      </div>
    </div>
  );
};

export default ElementPanel;