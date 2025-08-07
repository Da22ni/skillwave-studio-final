// components/Exporter/ProjectExporter.jsx

// 🧠 English:
// Project exporter component that creates downloadable ZIP files with HTML/CSS

// 💬 Español humano:
// Componente exportador de proyectos que crea archivos ZIP descargables con HTML/CSS

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useEditor } from '../../hooks/useEditor';
import { useLogger } from '../../hooks/useLogger';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';

const ProjectExporter = ({ isOpen, onClose, projectName = 'skillwave-project' }) => {
  const { t } = useTranslation();
  const { generateHTML, generateCSS, hasElements } = useEditor();
  const { logAction } = useLogger();
  
  const [fileName, setFileName] = useState(projectName);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    if (!hasElements) {
      alert('Add some elements to your canvas before exporting!');
      return;
    }

    try {
      setIsExporting(true);
      console.debug(`📦 Starting export process for: ${fileName}`);

      // Create new JSZip instance
      const zip = new JSZip();

      // Generate HTML and CSS
      const htmlContent = generateHTML();
      const cssContent = generateCSS();

      // Add files to ZIP
      zip.file('index.html', htmlContent);
      zip.file('styles.css', cssContent);

      // Add README file
      const readmeContent = `# ${fileName}

This project was created with Skillwave Studio - Visual Website Builder

## Files Included:
- index.html - Main HTML file
- styles.css - Stylesheet with all CSS

## How to Use:
1. Open index.html in any web browser
2. Edit the files to customize your website
3. Upload to any web hosting service

Generated on: ${new Date().toLocaleString()}
Built with ❤️ using Skillwave Studio
`;

      zip.file('README.md', readmeContent);

      // Generate ZIP file and download
      const content = await zip.generateAsync({ type: 'blob' });
      const zipFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      saveAs(content, `${zipFileName}.zip`);
      
      console.debug('📦 Export completed successfully');
      logAction(`Exported project as ${zipFileName}.zip`);
      
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('📦 Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('export.title')}
      size="medium"
    >
      <div className="space-y-6">
        {/* Export Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            What's included in your export:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• index.html - Your complete webpage</li>
            <li>• styles.css - All styling and layout</li>
            <li>• README.md - Instructions and info</li>
          </ul>
        </div>

        {/* File Name Input */}
        <div>
          <Input
            label="Project Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="my-awesome-website"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            This will be the name of your downloaded ZIP file
          </p>
        </div>

        {/* Preview */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Export Preview:</h4>
          <div className="space-y-2 text-sm font-mono text-gray-600">
            <div>📁 {fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip</div>
            <div className="ml-4">├── 📄 index.html</div>
            <div className="ml-4">├── 🎨 styles.css</div>
            <div className="ml-4">└── 📖 README.md</div>
          </div>
        </div>

        {/* Success Message */}
        {exportSuccess && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-green-900">
                {t('export.success')}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isExporting}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleExport}
            loading={isExporting}
            disabled={!fileName.trim() || !hasElements}
          >
            {isExporting ? 'Creating ZIP...' : t('export.download')}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 text-center">
          Your project will be downloaded as a ZIP file that you can extract and open in any browser
        </div>
      </div>
    </Modal>
  );
};

export default ProjectExporter;