// pages/Editor.jsx

// 🧠 English:
// Main editor page that combines all components: canvas, toolbar, panels, and AI assistant

// 💬 Español humano:
// Página principal del editor que combina todos los componentes: canvas, toolbar, paneles y asistente IA

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useEditor } from '../hooks/useEditor';
import { useLogger } from '../hooks/useLogger';

import { loadProject, saveProject } from '../services/projects';
import { logDebug, logError, logInteraction } from '../debug/report';

// Components
import Toolbar from '../components/Editor/Toolbar';
import ElementPanel from '../components/Editor/ElementPanel';
import Canvas from '../components/Editor/Canvas';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import CodePanel from '../components/CodePreview/CodePanel';
import AIAssistant from '../components/IA/AIAssistant';
import LoggerPanel from '../components/IA/LoggerPanel';
import ProjectExporter from '../components/Exporter/ProjectExporter';
import TutorialPanel from '../components/Tutorial/TutorialPanel';
import UserLevelSelector from '../components/Tutorial/UserLevelSelector';

// Debug Components
import TestCanvasScroll from '../debug/testCanvasScroll';
import TestDragDropZone from '../debug/testDragDropZone';

const Editor = () => {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, demoMode } = useAuth();
  const { 
    viewMode, 
    currentProject, 
    setCurrentProject,
    elements,
    selectedElementId,
    deleteElement
  } = useEditor();
  const { logAction } = useLogger();

  // 🧠 English: Enhanced state management with debugging and tutorial support
  // 💬 Español humano: Gestión de estado mejorada con soporte de debugging y tutorial
  const [editorState, setEditorState] = useState({
    isLoading: true,
    showExportModal: false,
    isSaving: false,
    
    // Debug features
    showDebugPanel: process.env.NODE_ENV === 'development',
    debugTests: {
      canvasScroll: false,
      dragDrop: false
    },
    
    // Tutorial system
    showTutorial: false,
    showUserLevelSelector: false,
    userLevel: localStorage.getItem('skillwave-user-level') || 'beginner',
    
    // Performance monitoring
    performanceMetrics: {
      loadTime: 0,
      renderTime: 0,
      lastActionTime: 0
    }
  });

  useEffect(() => {
    const startTime = Date.now();
    
    console.debug('📝 [Editor] Editor page loaded for project:', projectId);
    logDebug('EDITOR_LOAD', 'Editor page loaded', { projectId, userLevel: editorState.userLevel });
    
    if (!isAuthenticated) {
      console.debug('📝 [Editor] User not authenticated, redirecting to login');
      navigate('/');
      return;
    }

    loadProjectData();
    logAction('Opened editor');
    
    // Show user level selector for new users
    const hasSeenLevelSelector = localStorage.getItem('skillwave-level-selected');
    if (!hasSeenLevelSelector) {
      setEditorState(prev => ({ ...prev, showUserLevelSelector: true }));
    }

    // Performance tracking
    const loadTime = Date.now() - startTime;
    setEditorState(prev => ({
      ...prev,
      performanceMetrics: {
        ...prev.performanceMetrics,
        loadTime
      }
    }));

    logDebug('EDITOR_PERFORMANCE', 'Editor load time', { loadTime });
  }, [projectId, isAuthenticated, navigate]);

  // Add keyboard shortcuts for delete and debug
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        
        console.debug(`🗑️ [Editor] Delete key pressed for element: ${selectedElementId}`);
        logInteraction('keyboard_delete', { elementId: selectedElementId });
        
        if (window.confirm('Delete selected element?')) {
          deleteElement(selectedElementId);
          logAction('Deleted element using Delete key');
        }
      }

      // Debug shortcuts (Development only)
      if (process.env.NODE_ENV === 'development') {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'd':
              e.preventDefault();
              setEditorState(prev => ({ 
                ...prev, 
                showDebugPanel: !prev.showDebugPanel 
              }));
              logInteraction('debug_panel_toggle');
              break;
            case 'h':
              e.preventDefault();
              setEditorState(prev => ({ 
                ...prev, 
                showTutorial: !prev.showTutorial 
              }));
              logInteraction('tutorial_toggle');
              break;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElementId, deleteElement, logAction]);

  const loadProjectData = async () => {
    try {
      setEditorState(prev => ({ ...prev, isLoading: true }));
      console.debug('📂 [Editor] Loading project data for:', projectId);
      logDebug('PROJECT_LOAD', 'Loading project data', { projectId });

      const result = await loadProject(projectId);
      
      if (result.success) {
        console.debug('📂 [Editor] Project loaded successfully:', result.project.name);
        setCurrentProject(result.project);
        logAction(`Loaded project: ${result.project.name}`);
        logDebug('PROJECT_LOADED', 'Project loaded successfully', { 
          projectName: result.project.name,
          elementCount: result.project.elements?.length || 0 
        });
      } else {
        console.error('📂 [Editor] Failed to load project:', result.error);
        logError('project_load_failed', { projectId, error: result.error });
        
        // Create new project if not found
        const newProject = {
          id: projectId,
          name: 'New Project',
          userId: demoMode ? 'demo-user' : user?.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          elements: []
        };
        setCurrentProject(newProject);
        logAction('Created new project');
        logDebug('PROJECT_CREATED', 'New project created', { projectId });
      }
    } catch (error) {
      console.error('📂 [Editor] Error loading project:', error);
      logError('project_load_error', { projectId, error: error.message });
    } finally {
      setEditorState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleSave = async () => {
    if (!currentProject) return;

    try {
      setEditorState(prev => ({ ...prev, isSaving: true }));
      console.debug('💾 [Editor] Saving project:', currentProject.name);
      logInteraction('project_save', { projectId: currentProject.id, elementCount: elements.length });

      const projectToSave = {
        ...currentProject,
        elements: elements,
        updatedAt: new Date().toISOString()
      };

      const result = await saveProject(projectToSave);
      
      if (result.success) {
        console.debug('💾 [Editor] Project saved successfully');
        setCurrentProject(result.project);
        logAction('Project saved');
        logDebug('PROJECT_SAVED', 'Project saved successfully', { 
          projectId: result.project.id,
          elementCount: elements.length 
        });
        
        // Show success feedback
        // TODO: Add toast notification
      } else {
        console.error('💾 [Editor] Failed to save project:', result.error);
        logError('project_save_failed', { projectId: currentProject.id, error: result.error });
        alert('Failed to save project. Please try again.');
      }
    } catch (error) {
      console.error('💾 [Editor] Error saving project:', error);
      logError('project_save_error', { projectId: currentProject.id, error: error.message });
      alert('Error saving project. Please try again.');
    } finally {
      setEditorState(prev => ({ ...prev, isSaving: false }));
    }
  };

  const handleExport = () => {
    console.debug('📦 [Editor] Opening export modal');
    logInteraction('export_modal_open', { elementCount: elements.length });
    setEditorState(prev => ({ ...prev, showExportModal: true }));
  };

  const handleUserLevelSelect = (level) => {
    console.debug(`🎓 [Editor] User level selected: ${level.id}`);
    localStorage.setItem('skillwave-user-level', level.id);
    localStorage.setItem('skillwave-level-selected', 'true');
    
    setEditorState(prev => ({ 
      ...prev, 
      userLevel: level.id,
      showUserLevelSelector: false,
      showTutorial: true // Start tutorial after level selection
    }));
    
    logInteraction('user_level_confirmed', { level: level.id, title: level.title });
  };

  const handleTutorialComplete = (result) => {
    console.debug('🎓 [Editor] Tutorial completed:', result);
    setEditorState(prev => ({ ...prev, showTutorial: false }));
    logInteraction('tutorial_completed_editor', result);
  };

  const renderMainContent = () => {
    switch (viewMode) {
      case 'canvas':
        return (
          <div className="flex-1 flex">
            <ElementPanel />
            <div className="flex-1">
              <Canvas />
            </div>
            <PropertiesPanel />
          </div>
        );
      
      case 'code':
        return (
          <div className="flex-1">
            <CodePanel />
          </div>
        );
      
      case 'both':
      default:
        return (
          <div className="flex-1 flex">
            <ElementPanel />
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex">
                <div className="flex-1">
                  <Canvas />
                </div>
                <div className="w-1/2 border-l border-gray-200">
                  <CodePanel />
                </div>
              </div>
            </div>
            <PropertiesPanel />
          </div>
        );
    }
  };

  if (editorState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
          <p className="text-xs text-gray-500 mt-2">
            Initializing enhanced features and debugging tools...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* User Level Selector Modal */}
      <UserLevelSelector
        isOpen={editorState.showUserLevelSelector}
        onClose={() => setEditorState(prev => ({ ...prev, showUserLevelSelector: false }))}
        onLevelSelect={handleUserLevelSelect}
      />

      {/* Tutorial System */}
      <TutorialPanel
        userLevel={editorState.userLevel}
        isActive={editorState.showTutorial}
        onComplete={handleTutorialComplete}
      />

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && editorState.showDebugPanel && (
        <div className="fixed top-4 left-4 bg-white p-4 rounded-lg shadow-lg border-2 border-yellow-400 z-40 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-yellow-800">🔧 Debug Tools</h3>
            <button
              onClick={() => setEditorState(prev => ({ ...prev, showDebugPanel: false }))}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Debug Test Toggles */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Canvas Scroll Test:</span>
              <button
                onClick={() => setEditorState(prev => ({
                  ...prev,
                  debugTests: { ...prev.debugTests, canvasScroll: !prev.debugTests.canvasScroll }
                }))}
                className={`text-xs px-2 py-1 rounded ${
                  editorState.debugTests.canvasScroll 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {editorState.debugTests.canvasScroll ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Drag-Drop Test:</span>
              <button
                onClick={() => setEditorState(prev => ({
                  ...prev,
                  debugTests: { ...prev.debugTests, dragDrop: !prev.debugTests.dragDrop }
                }))}
                className={`text-xs px-2 py-1 rounded ${
                  editorState.debugTests.dragDrop 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {editorState.debugTests.dragDrop ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Performance Metrics */}
            <div className="border-t pt-2">
              <div className="text-xs text-gray-600 space-y-1">
                <div>Load: {editorState.performanceMetrics.loadTime}ms</div>
                <div>Elements: {elements.length}</div>
                <div>Level: {editorState.userLevel}</div>
              </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="border-t pt-2 text-xs text-gray-500">
              <div>Shortcuts:</div>
              <div>Ctrl+D: Toggle Debug</div>
              <div>Ctrl+H: Toggle Tutorial</div>
              <div>Delete: Remove Element</div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar 
        onSave={handleSave}
        onExport={handleExport}
        isSaving={editorState.isSaving}
      />

      {/* Main Editor Area */}
      <div className="flex-1 flex">
        {/* Main Content */}
        {renderMainContent()}
        
        {/* Right Sidebar - Enhanced with Debug Components */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 space-y-4 overflow-y-auto">
          {/* Debug Test Components */}
          {process.env.NODE_ENV === 'development' && (
            <div className="space-y-3">
              <TestCanvasScroll isActive={editorState.debugTests.canvasScroll} />
              <TestDragDropZone isActive={editorState.debugTests.dragDrop} />
            </div>
          )}
          
          {/* AI Assistant */}
          <AIAssistant />
          
          {/* Logger Panel */}
          <LoggerPanel />

          {/* Tutorial Quick Access */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-800">🎓 Learning Mode</h4>
              <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
                {editorState.userLevel}
              </span>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setEditorState(prev => ({ ...prev, showTutorial: true }))}
                className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
              >
                Restart Tutorial
              </button>
              
              <button
                onClick={() => setEditorState(prev => ({ ...prev, showUserLevelSelector: true }))}
                className="w-full text-xs bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-3 py-2 rounded"
              >
                Change Level
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ProjectExporter
        isOpen={editorState.showExportModal}
        onClose={() => setEditorState(prev => ({ ...prev, showExportModal: false }))}
        projectName={currentProject?.name || 'skillwave-project'}
      />

      {/* Enhanced Save Status */}
      {editorState.isSaving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
            <div>
              <div className="font-medium">Saving project...</div>
              <div className="text-xs opacity-90">{elements.length} elements • {editorState.userLevel} mode</div>
            </div>
          </div>
        </div>
      )}

      {/* 🧠 English: Educational footer with development info
          💬 Español humano: Pie educativo con información de desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-800 text-white text-xs text-center py-1">
          🔧 Development Mode: Enhanced debugging, tutorials, and educational AI active
        </div>
      )}
    </div>
  );
};

export default Editor;