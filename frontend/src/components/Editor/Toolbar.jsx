// components/Editor/Toolbar.jsx

// 🧠 English:
// Main toolbar with view controls, responsive toggles, and editor actions

// 💬 Español humano:
// Barra de herramientas principal con controles de vista, botones responsive y acciones del editor

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../../hooks/useEditor';
import { useResponsiveStore } from '../../store/useResponsiveStore';
import { useLogger } from '../../hooks/useLogger';
import Button from '../UI/Button';

const Toolbar = ({ onExport, onSave }) => {
  const { t } = useTranslation();
  const { viewMode, setViewMode, hasElements } = useEditor();
  const { currentDevice, setDevice } = useResponsiveStore();
  const { logAction } = useLogger();

  const viewModes = [
    { key: 'canvas', label: t('editor.canvas'), icon: '🎨' },
    { key: 'code', label: t('editor.code'), icon: '💻' },
    { key: 'both', label: t('editor.both'), icon: '📱' }
  ];

  const devices = [
    { key: 'desktop', label: t('editor.desktop'), icon: '🖥️' },
    { key: 'tablet', label: t('editor.tablet'), icon: '📱' },
    { key: 'mobile', label: t('editor.mobile'), icon: '📲' }
  ];

  const handleViewModeChange = (mode) => {
    console.debug(`👁️ Changing view mode to: ${mode}`);
    setViewMode(mode);
    logAction(`Switched to ${mode} view mode`);
  };

  const handleDeviceChange = (device) => {
    console.debug(`📱 Changing device view to: ${device}`);
    setDevice(device);
    logAction(`Switched to ${device} device view`);
  };

  const handleSave = () => {
    console.debug('💾 Save project requested');
    logAction('Saved project');
    onSave?.();
  };

  const handleExport = () => {
    console.debug('📦 Export project requested');
    logAction('Exported project');
    onExport?.();
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section - View Controls */}
        <div className="flex items-center space-x-6">
          {/* View Mode Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {viewModes.map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => handleViewModeChange(mode.key)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === mode.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.icon} {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Device Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Device:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {devices.map((device) => (
                <button
                  key={device.key}
                  onClick={() => handleDeviceChange(device.key)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    currentDevice === device.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {device.icon} {device.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Section - Project Info */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Visual Editor
          </h2>
          <p className="text-sm text-gray-500">
            {hasElements ? 'Building your website...' : 'Start by adding elements'}
          </p>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleSave}
            variant="outline"
            size="small"
          >
            💾 {t('editor.save')}
          </Button>

          <Button
            onClick={handleExport}
            variant="primary"
            size="small"
            disabled={!hasElements}
          >
            📦 {t('editor.export')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;