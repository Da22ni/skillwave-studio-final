// services/projects.js

// 🧠 English:
// Project management service for saving/loading user projects

// 💬 Español humano:
// Servicio de gestión de proyectos para guardar/cargar proyectos del usuario

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Mock implementation for demo/development
// TODO: Replace with actual backend API calls

export const saveProject = async (project) => {
  try {
    console.debug(`💾 Saving project: ${project.name}`);

    // For now, save to localStorage
    const savedProjects = JSON.parse(localStorage.getItem('skillwave-projects') || '[]');
    const existingIndex = savedProjects.findIndex(p => p.id === project.id);
    
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      savedProjects[existingIndex] = updatedProject;
    } else {
      savedProjects.push(updatedProject);
    }

    localStorage.setItem('skillwave-projects', JSON.stringify(savedProjects));
    
    console.debug('💾 Project saved successfully');
    return { success: true, project: updatedProject };

  } catch (error) {
    console.error('💾 Error saving project:', error);
    return { success: false, error: error.message };
  }
};

export const loadProject = async (projectId) => {
  try {
    console.debug(`📂 Loading project: ${projectId}`);

    // For now, load from localStorage
    const savedProjects = JSON.parse(localStorage.getItem('skillwave-projects') || '[]');
    const project = savedProjects.find(p => p.id === projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    console.debug('📂 Project loaded successfully:', project.name);
    return { success: true, project };

  } catch (error) {
    console.error('📂 Error loading project:', error);
    return { success: false, error: error.message };
  }
};

export const deleteProject = async (projectId) => {
  try {
    console.debug(`🗑️ Deleting project: ${projectId}`);

    // For now, delete from localStorage
    const savedProjects = JSON.parse(localStorage.getItem('skillwave-projects') || '[]');
    const updatedProjects = savedProjects.filter(p => p.id !== projectId);
    
    localStorage.setItem('skillwave-projects', JSON.stringify(updatedProjects));
    
    console.debug('🗑️ Project deleted successfully');
    return { success: true };

  } catch (error) {
    console.error('🗑️ Error deleting project:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProjects = async (userId) => {
  try {
    console.debug(`📊 Loading projects for user: ${userId}`);

    // For now, load from localStorage
    const savedProjects = JSON.parse(localStorage.getItem('skillwave-projects') || '[]');
    const userProjects = savedProjects.filter(p => p.userId === userId);

    console.debug(`📊 Found ${userProjects.length} projects`);
    return { success: true, projects: userProjects };

  } catch (error) {
    console.error('📊 Error loading user projects:', error);
    return { success: false, error: error.message };
  }
};