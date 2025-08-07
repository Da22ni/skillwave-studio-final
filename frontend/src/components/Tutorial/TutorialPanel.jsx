// components/Tutorial/TutorialPanel.jsx

// 🧠 English:
// Interactive tutorial panel that guides users through learning web development step by step

// 💬 Español humano:
// Panel de tutorial interactivo que guía a los usuarios a través del aprendizaje de desarrollo web paso a paso

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../../hooks/useEditor';
import { useLogger } from '../../hooks/useLogger';
import { logDebug, logInteraction } from '../../debug/report';
import Button from '../UI/Button';

const TutorialPanel = ({ userLevel = 'beginner', isActive = false, onComplete }) => {
  const { t } = useTranslation();
  const { elements, addElement, selectedElement } = useEditor();
  const { actions } = useLogger();
  
  // 🧠 English: Comprehensive tutorial system with adaptive learning paths
  // 💬 Español humano: Sistema de tutorial completo con rutas de aprendizaje adaptativas
  const [tutorialState, setTutorialState] = useState({
    currentStep: 0,
    isVisible: isActive,
    userProgress: {
      completedSteps: [],
      currentModule: 'basics',
      learningPath: 'guided'
    },
    showHints: true,
    autoAdvance: false
  });

  // Tutorial modules based on user level
  const tutorialModules = {
    beginner: {
      title: '🎨 Web Development Basics',
      description: 'Learn to build websites visually',
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to Web Development!',
          content: 'You\'re about to learn how to build real websites using a visual editor. No coding experience needed!',
          action: 'none',
          highlight: null,
          success: 'Ready to start your web development journey!'
        },
        {
          id: 'add-text',
          title: 'Add Your First Text',
          content: 'Drag the "Text Block" from the left panel to the canvas. This creates HTML text on your website.',
          action: 'add_element',
          elementType: 'text',
          highlight: 'element-panel',
          success: 'Great! You just created your first HTML element!'
        },
        {
          id: 'edit-text',
          title: 'Customize Your Text',
          content: 'Click on your text element to select it, then look at the Properties panel on the right to change its content.',
          action: 'update_element',
          highlight: 'properties-panel',
          success: 'Perfect! You\'re editing like a pro!'
        },
        {
          id: 'add-button',
          title: 'Add a Button',
          content: 'Drag the "Button" element to your canvas. Buttons are interactive elements users can click.',
          action: 'add_element',
          elementType: 'button',
          highlight: 'element-panel',
          success: 'Awesome! Buttons make websites interactive!'
        },
        {
          id: 'view-code',
          title: 'See Your Code',
          content: 'Switch to "Code" view to see the actual HTML and CSS you\'re creating. This is real web code!',
          action: 'view_mode',
          highlight: 'toolbar',
          success: 'Amazing! You can see the real code behind your design!'
        },
        {
          id: 'responsive',
          title: 'Mobile-Friendly Design',
          content: 'Click the "Mobile" view to see how your website looks on phones. Good websites work on all devices!',
          action: 'responsive_mode',
          highlight: 'toolbar',
          success: 'You\'re thinking like a professional web developer!'
        },
        {
          id: 'complete',
          title: 'Congratulations! 🎉',
          content: 'You\'ve learned the basics of web development! You can now create elements, edit properties, view code, and design for mobile. Keep experimenting!',
          action: 'completion',
          highlight: null,
          success: 'Welcome to the world of web development!'
        }
      ]
    },
    intermediate: {
      title: '🚀 Advanced Techniques',
      description: 'Master layout, styling, and responsive design',
      steps: [
        {
          id: 'layout',
          title: 'Understanding Layout',
          content: 'Learn how positioning works by moving elements around. This teaches CSS positioning concepts.',
          action: 'move_elements',
          highlight: 'canvas',
          success: 'You understand CSS positioning!'
        },
        {
          id: 'styling',
          title: 'Advanced Styling',
          content: 'Experiment with colors, fonts, and spacing. These become CSS properties in your code.',
          action: 'style_elements',
          highlight: 'properties-panel',
          success: 'Your design skills are improving!'
        },
        {
          id: 'responsive-design',
          title: 'Responsive Design',
          content: 'Test your design on different screen sizes. Modern websites must work everywhere.',
          action: 'test_responsive',
          highlight: 'responsive-controls',
          success: 'You\'re thinking mobile-first!'
        }
      ]
    },
    advanced: {
      title: '💻 Professional Workflow',
      description: 'Export, optimize, and deploy your projects',
      steps: [
        {
          id: 'export',
          title: 'Export Your Project',
          content: 'Export your design as real HTML/CSS files that you can upload to any web server.',
          action: 'export_project',
          highlight: 'export-button',
          success: 'You have real, deployable code!'
        },
        {
          id: 'optimization',
          title: 'Code Quality',
          content: 'Review the generated code. Clean, semantic HTML and efficient CSS are professional standards.',
          action: 'review_code',
          highlight: 'code-panel',
          success: 'You understand code quality!'
        }
      ]
    }
  };

  const currentModule = tutorialModules[userLevel];
  const currentStepData = currentModule?.steps[tutorialState.currentStep];
  const totalSteps = currentModule?.steps.length || 0;

  useEffect(() => {
    if (!isActive) return;

    console.debug(`🎓 [TutorialPanel] Tutorial activated for ${userLevel} level`);
    logInteraction('tutorial_started', { userLevel, module: currentModule?.title });

    // Auto-advance tutorial based on user actions
    checkStepCompletion();
  }, [actions, elements, selectedElement, isActive]);

  const checkStepCompletion = () => {
    if (!currentStepData || tutorialState.userProgress.completedSteps.includes(currentStepData.id)) {
      return;
    }

    let isStepCompleted = false;

    // 🧠 English: Check if user has completed the required action for current step
    // 💬 Español humano: Verificar si el usuario ha completado la acción requerida para el paso actual
    switch (currentStepData.action) {
      case 'add_element':
        isStepCompleted = elements.some(el => el.type === currentStepData.elementType);
        break;
      case 'update_element':
        isStepCompleted = actions.some(action => action.message.includes('Updated'));
        break;
      case 'view_mode':
        isStepCompleted = actions.some(action => action.message.includes('view') && action.message.includes('mode'));
        break;
      case 'responsive_mode':
        isStepCompleted = actions.some(action => action.message.includes('mobile') || action.message.includes('tablet'));
        break;
      case 'export_project':
        isStepCompleted = actions.some(action => action.message.includes('Exported'));
        break;
      case 'move_elements':
        isStepCompleted = actions.some(action => action.message.includes('Moved'));
        break;
      case 'none':
      case 'completion':
        // These steps are manually advanced
        break;
      default:
        isStepCompleted = false;
    }

    if (isStepCompleted && tutorialState.autoAdvance) {
      setTimeout(() => handleNextStep(), 1500); // Auto-advance after 1.5 seconds
    }
  };

  const handleNextStep = () => {
    const nextStep = tutorialState.currentStep + 1;
    
    if (nextStep >= totalSteps) {
      handleTutorialComplete();
      return;
    }

    setTutorialState(prev => ({
      ...prev,
      currentStep: nextStep,
      userProgress: {
        ...prev.userProgress,
        completedSteps: [...prev.userProgress.completedSteps, currentStepData.id]
      }
    }));

    console.debug(`🎓 [TutorialPanel] Advanced to step ${nextStep}: ${currentModule.steps[nextStep]?.title}`);
    logInteraction('tutorial_step_advance', { 
      step: nextStep, 
      stepTitle: currentModule.steps[nextStep]?.title,
      userLevel 
    });
  };

  const handlePrevStep = () => {
    if (tutorialState.currentStep > 0) {
      setTutorialState(prev => ({
        ...prev,
        currentStep: prev.currentStep - 1
      }));
    }
  };

  const handleTutorialComplete = () => {
    console.debug(`🎓 [TutorialPanel] Tutorial completed for ${userLevel} level`);
    logInteraction('tutorial_completed', { 
      userLevel, 
      completedSteps: tutorialState.userProgress.completedSteps.length,
      totalSteps 
    });

    setTutorialState(prev => ({
      ...prev,
      isVisible: false,
      userProgress: {
        ...prev.userProgress,
        completedSteps: [...prev.userProgress.completedSteps, currentStepData?.id]
      }
    }));

    if (onComplete) {
      onComplete({
        level: userLevel,
        completedSteps: tutorialState.userProgress.completedSteps.length + 1,
        totalSteps
      });
    }
  };

  const handleSkipTutorial = () => {
    if (window.confirm('Skip tutorial? You can restart it anytime from settings.')) {
      console.debug(`🎓 [TutorialPanel] Tutorial skipped by user`);
      logInteraction('tutorial_skipped', { userLevel, currentStep: tutorialState.currentStep });
      
      setTutorialState(prev => ({ ...prev, isVisible: false }));
      if (onComplete) onComplete({ skipped: true });
    }
  };

  if (!isActive || !tutorialState.isVisible || !currentStepData) {
    return null;
  }

  const progressPercentage = ((tutorialState.currentStep + 1) / totalSteps) * 100;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-2xl border-2 border-blue-200 z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{currentModule.title}</h3>
            <p className="text-sm opacity-90">{currentModule.description}</p>
          </div>
          <button
            onClick={handleSkipTutorial}
            className="text-white hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Step {tutorialState.currentStep + 1} of {totalSteps}</span>
            <span className="text-sm">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {currentStepData.title}
        </h4>
        
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {currentStepData.content}
        </p>

        {/* Success Message */}
        {tutorialState.userProgress.completedSteps.includes(currentStepData.id) && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800">
              <span className="text-lg mr-2">✅</span>
              <span className="text-sm font-medium">{currentStepData.success}</span>
            </div>
          </div>
        )}

        {/* Hint System */}
        {tutorialState.showHints && currentStepData.action !== 'none' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start text-yellow-800">
              <span className="text-sm mr-2 mt-0.5">💡</span>
              <div className="text-sm">
                <strong>Hint:</strong> Look for the highlighted area to complete this step.
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handlePrevStep}
            disabled={tutorialState.currentStep === 0}
            variant="outline"
            size="small"
          >
            ← Previous
          </Button>

          <div className="flex items-center space-x-2">
            <label className="flex items-center text-xs text-gray-600">
              <input
                type="checkbox"
                checked={tutorialState.autoAdvance}
                onChange={(e) => setTutorialState(prev => ({ 
                  ...prev, 
                  autoAdvance: e.target.checked 
                }))}
                className="mr-1"
              />
              Auto-advance
            </label>
          </div>

          <Button
            onClick={handleNextStep}
            size="small"
            disabled={tutorialState.currentStep === totalSteps - 1 && currentStepData.action !== 'completion'}
          >
            {tutorialState.currentStep === totalSteps - 1 ? 'Finish 🎉' : 'Next →'}
          </Button>
        </div>
      </div>

      {/* Educational Note */}
      <div className="p-3 bg-gray-50 rounded-b-lg border-t">
        <p className="text-xs text-gray-600 text-center">
          🧠 This tutorial adapts to your learning pace and tracks your progress
        </p>
      </div>
    </div>
  );
};

export default TutorialPanel;