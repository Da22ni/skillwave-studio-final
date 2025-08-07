// pages/Dashboard.jsx

// 🧠 English:
// User dashboard displaying saved projects with create/open/delete functionality

// 💬 Español humano:
// Dashboard del usuario mostrando proyectos guardados con funcionalidad crear/abrir/eliminar

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogger } from '../hooks/useLogger';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout, demoMode } = useAuth();
  const { logAction } = useLogger();

  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    console.debug('📊 Dashboard loaded, fetching projects');
    loadProjects();
    logAction('Accessed dashboard');
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call
      // For now, load from localStorage for demo
      const savedProjects = JSON.parse(localStorage.getItem('skillwave-projects') || '[]');
      const userProjects = demoMode 
        ? savedProjects.filter(p => p.userId === 'demo-user')
        : savedProjects.filter(p => p.userId === user?.uid);
      
      console.debug(`📊 Loaded ${userProjects.length} projects`);
      setProjects(userProjects);
    } catch (error) {
      console.error('📊 Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      setIsCreating(true);
      console.debug(`📊 Creating new project: ${newProjectName}`);

      const newProject = {
        id: `project-${Date.now()}`,
        name: newProjectName.trim(),
        userId: demoMode ? 'demo-user' : user?.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        elements: []
      };

      // TODO: Replace with actual API call
      const savedProjects = JSON.parse(localStorage.getItem('skillwave-projects') || '[]');
      savedProjects.push(newProject);
      localStorage.setItem('skillwave-projects', JSON.stringify(savedProjects));

      setProjects([...projects, newProject]);
      setShowCreateModal(false);
      setNewProjectName('');
      
      logAction(`Created new project: ${newProjectName}`);
      
      // Navigate to editor
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      console.error('📊 Error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenProject = (project) => {
    console.debug(`📊 Opening project: ${project.name}`);
    logAction(`Opened project: ${project.name}`);
    navigate(`/editor/${project.id}`);
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(t('dashboard.confirmDelete'))) return;

    try {
      console.debug(`📊 Deleting project: ${project.name}`);

      // TODO: Replace with actual API call
      const savedProjects = JSON.parse(localStorage.getItem('skillwave-projects') || '[]');
      const updatedProjects = savedProjects.filter(p => p.id !== project.id);
      localStorage.setItem('skillwave-projects', JSON.stringify(updatedProjects));

      setProjects(projects.filter(p => p.id !== project.id));
      logAction(`Deleted project: ${project.name}`);
    } catch (error) {
      console.error('📊 Error deleting project:', error);
    }
  };

  const handleLogout = async () => {
    console.debug('📊 Logging out from dashboard');
    const result = await logout();
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-white">SW</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Skillwave Studio</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {demoMode ? 'Demo Mode' : `Hello, ${user?.displayName}`}
              </span>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="small"
              >
                {t('auth.logout')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
            
            <Button
              onClick={() => setShowCreateModal(true)}
              size="large"
            >
              {t('dashboard.createNew')}
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.projectsEmpty')}</h3>
            <Button onClick={() => setShowCreateModal(true)}>
              {t('dashboard.createNew')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {t('dashboard.lastModified')}: {new Date(project.updatedAt).toLocaleDateString()}
                </p>
                
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => handleOpenProject(project)}
                    size="small"
                  >
                    {t('dashboard.openProject')}
                  </Button>
                  
                  <button
                    onClick={() => handleDeleteProject(project)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    {t('dashboard.deleteProject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('dashboard.createNew')}
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Enter project name"
            required
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowCreateModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleCreateProject}
              loading={isCreating}
              disabled={!newProjectName.trim()}
            >
              Create Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;