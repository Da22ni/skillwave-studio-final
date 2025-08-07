// components/Editor/PropertiesPanel.jsx

// 🧠 English:
// Properties panel for editing selected element attributes and styling

// 💬 Español humano:
// Panel de propiedades para editar atributos y estilos del elemento seleccionado

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../../hooks/useEditor';
import { HexColorPicker } from 'react-colorful';
import Input from '../UI/Input';
import Button from '../UI/Button';

const PropertiesPanel = () => {
  const { t } = useTranslation();
  const { selectedElement, updateElement, deleteElement } = useEditor();

  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('elements.properties')}
        </h3>
        
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property, value) => {
    console.debug(`🔧 Updating ${selectedElement.type} property: ${property} = ${value}`);
    
    updateElement(selectedElement.id, {
      properties: {
        ...selectedElement.properties,
        [property]: value
      }
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete this ${selectedElement.type} element?`)) {
      console.debug(`🗑️ Deleting ${selectedElement.type} element`);
      deleteElement(selectedElement.id);
    }
  };

  const renderProperties = () => {
    const { type, properties } = selectedElement;

    switch (type) {
      case 'text':
        return (
          <div className="space-y-4">
            <Input
              label={t('elements.content')}
              value={properties.content}
              onChange={(e) => handlePropertyChange('content', e.target.value)}
              placeholder="Enter text content"
            />

            <Input
              label={t('elements.fontSize')}
              value={properties.fontSize}
              onChange={(e) => handlePropertyChange('fontSize', e.target.value)}
              placeholder="16px"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('elements.color')}
              </label>
              <HexColorPicker
                color={properties.color}
                onChange={(color) => handlePropertyChange('color', color)}
                style={{ width: '100%', height: '120px' }}
              />
              <Input
                value={properties.color}
                onChange={(e) => handlePropertyChange('color', e.target.value)}
                placeholder="#000000"
                className="mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Weight
              </label>
              <select
                value={properties.fontWeight}
                onChange={(e) => handlePropertyChange('fontWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="lighter">Light</option>
                <option value="bolder">Bolder</option>
              </select>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <Input
              label={t('elements.content')}
              value={properties.content}
              onChange={(e) => handlePropertyChange('content', e.target.value)}
              placeholder="Button text"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <HexColorPicker
                color={properties.backgroundColor}
                onChange={(color) => handlePropertyChange('backgroundColor', color)}
                style={{ width: '100%', height: '120px' }}
              />
              <Input
                value={properties.backgroundColor}
                onChange={(e) => handlePropertyChange('backgroundColor', e.target.value)}
                placeholder="#007bff"
                className="mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Color
              </label>
              <HexColorPicker
                color={properties.color}
                onChange={(color) => handlePropertyChange('color', color)}
                style={{ width: '100%', height: '120px' }}
              />
              <Input
                value={properties.color}
                onChange={(e) => handlePropertyChange('color', e.target.value)}
                placeholder="#ffffff"
                className="mt-2"
              />
            </div>

            <Input
              label="Padding"
              value={properties.padding}
              onChange={(e) => handlePropertyChange('padding', e.target.value)}
              placeholder="10px 20px"
            />

            <Input
              label="Border Radius"
              value={properties.borderRadius}
              onChange={(e) => handlePropertyChange('borderRadius', e.target.value)}
              placeholder="4px"
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <Input
              label="Image URL"
              value={properties.src}
              onChange={(e) => handlePropertyChange('src', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />

            <Input
              label="Alt Text"
              value={properties.alt}
              onChange={(e) => handlePropertyChange('alt', e.target.value)}
              placeholder="Image description"
            />

            <Input
              label="Width"
              value={properties.width}
              onChange={(e) => handlePropertyChange('width', e.target.value)}
              placeholder="200px"
            />

            <Input
              label="Height"
              value={properties.height}
              onChange={(e) => handlePropertyChange('height', e.target.value)}
              placeholder="150px"
            />
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-gray-500">
            No properties available for this element type.
          </div>
        );
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('elements.properties')}
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {selectedElement.type}
          </span>
        </div>
      </div>

      {/* Properties */}
      <div className="space-y-6">
        {renderProperties()}

        {/* Position Info */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Position</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500">X</label>
              <p className="text-sm font-mono">{Math.round(selectedElement.position.x)}px</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500">Y</label>
              <p className="text-sm font-mono">{Math.round(selectedElement.position.y)}px</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t pt-4">
          <Button
            onClick={handleDelete}
            variant="danger"
            className="w-full"
          >
            {t('elements.delete')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;