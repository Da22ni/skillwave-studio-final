// components/CodePreview/CodePanel.jsx

// 🧠 English:
// Real-time code preview panel showing generated HTML and CSS

// 💬 Español humano:
// Panel de vista previa de código en tiempo real mostrando HTML y CSS generado

import React, { useState } from 'react';
import { useEditor } from '../../hooks/useEditor';
import { useLogger } from '../../hooks/useLogger';
import Button from '../UI/Button';

const CodePanel = () => {
  const [activeTab, setActiveTab] = useState('html');
  const { generateHTML, generateCSS } = useEditor();
  const { logAction } = useLogger();

  const htmlCode = generateHTML();
  const cssCode = generateCSS();

  const handleCopyCode = () => {
    const code = activeTab === 'html' ? htmlCode : cssCode;
    navigator.clipboard.writeText(code);
    console.debug(`📋 Copied ${activeTab.toUpperCase()} code to clipboard`);
    logAction(`Copied ${activeTab.toUpperCase()} code to clipboard`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    console.debug(`👁️ Switched to ${tab.toUpperCase()} view`);
    logAction(`Switched to ${tab.toUpperCase()} code view`);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex space-x-1">
          <button
            onClick={() => handleTabChange('html')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'html'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            HTML
          </button>
          <button
            onClick={() => handleTabChange('css')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'css'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            CSS
          </button>
        </div>

        <Button
          onClick={handleCopyCode}
          variant="outline"
          size="small"
          className="text-white border-gray-600 hover:bg-gray-700"
        >
          📋 Copy
        </Button>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <pre className="text-sm text-gray-100 p-4 font-mono leading-relaxed">
          <code>
            {activeTab === 'html' ? htmlCode : cssCode}
          </code>
        </pre>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-400">
        {activeTab === 'html' 
          ? `${htmlCode.split('\n').length} lines of HTML`
          : `${cssCode.split('\n').length} lines of CSS`
        }
      </div>
    </div>
  );
};

export default CodePanel;