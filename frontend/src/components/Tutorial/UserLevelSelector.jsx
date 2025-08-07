// components/Tutorial/UserLevelSelector.jsx

// 🧠 English:
// User level selector component that determines learning path and tutorial complexity

// 💬 Español humano:
// Componente selector de nivel de usuario que determina la ruta de aprendizaje y complejidad del tutorial

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../../store/useEditorStore';
import { logInteraction } from '../../debug/report';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const UserLevelSelector = ({ isOpen, onClose, onLevelSelect }) => {
  const { t } = useTranslation();
  const userLevel = useEditorStore(state => state.userLevel);
  const setUserLevel = useEditorStore(state => state.setUserLevel);
  const [selectedLevel, setSelectedLevel] = useState(userLevel);
  const [showDetails, setShowDetails] = useState({});

  // 🧠 English: Define user levels with comprehensive learning paths
  // 💬 Español humano: Definir niveles de usuario con rutas de aprendizaje comprensivas
  const userLevels = [
    {
      id: 'beginner',
      title: '🌱 Complete Beginner',
      subtitle: 'New to web development',
      description: 'Perfect if you\'ve never built a website before. Learn HTML, CSS basics through visual building.',
      features: [
        'Step-by-step guided tutorials',
        'Visual drag-and-drop learning',
        'Code explanations in simple terms',
        'Basic HTML/CSS concepts',
        'Immediate visual feedback'
      ],
      timeEstimate: '2-4 hours to complete basics',
      nextLevel: 'intermediate',
      color: 'green'
    },
    {
      id: 'intermediate',
      title: '🚀 Some Experience',
      subtitle: 'Know basic HTML/CSS',
      description: 'You understand HTML tags and CSS properties. Ready to learn advanced layout and responsive design.',
      features: [
        'Advanced styling techniques',
        'Responsive design patterns',
        'CSS Grid and Flexbox concepts',
        'Performance optimization tips',
        'Professional workflow practices'
      ],
      timeEstimate: '1-2 hours focused learning',
      nextLevel: 'advanced',
      color: 'blue'
    },
    {
      id: 'advanced',
      title: '💻 Web Developer',
      subtitle: 'Experienced with coding',
      description: 'You can write HTML/CSS from scratch. Use this to speed up prototyping and learn visual design.',
      features: [
        'Rapid prototyping workflow',
        'Design system creation',
        'Code export and optimization',
        'Advanced animation techniques',
        'Integration with development tools'
      ],
      timeEstimate: '30 minutes to master tools',
      nextLevel: null,
      color: 'purple'
    }
  ];

  const handleLevelSelect = (level) => {
    setSelectedLevel(level.id);
    console.debug(`🎓 [UserLevelSelector] User selected level: ${level.id}`);
    logInteraction('user_level_selected', { 
      level: level.id, 
      title: level.title,
      hasNextLevel: !!level.nextLevel 
    });
  };

  const handleConfirm = () => {
    const level = userLevels.find(l => l.id === selectedLevel);
    if (level && onLevelSelect) {
      onLevelSelect(level);
      onClose();
    }
  };

  const toggleDetails = (levelId) => {
    setShowDetails(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }));
  };

  const getColorClasses = (color, isSelected = false) => {
    const colorMap = {
      green: {
        bg: isSelected ? 'bg-green-100 border-green-500' : 'bg-green-50 border-green-200 hover:border-green-300',
        text: 'text-green-800',
        button: 'bg-green-600 hover:bg-green-700'
      },
      blue: {
        bg: isSelected ? 'bg-blue-100 border-blue-500' : 'bg-blue-50 border-blue-200 hover:border-blue-300',
        text: 'text-blue-800',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      purple: {
        bg: isSelected ? 'bg-purple-100 border-purple-500' : 'bg-purple-50 border-purple-200 hover:border-purple-300',
        text: 'text-purple-800',
        button: 'bg-purple-600 hover:bg-purple-700'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Your Learning Path" size="large">
      <div className="space-y-6">
        {/* Introduction */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            🎯 What's your web development experience?
          </h3>
          <p className="text-gray-600">
            This helps us customize your learning experience and tutorial complexity
          </p>
        </div>

        {/* Level Options */}
        <div className="space-y-4">
          {userLevels.map((level) => {
            const isSelected = selectedLevel === level.id;
            const colorClasses = getColorClasses(level.color, isSelected);
            
            return (
              <div
                key={level.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${colorClasses.bg}`}
                onClick={() => handleLevelSelect(level)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        isSelected 
                          ? `bg-${level.color}-600 border-${level.color}-600` 
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>}
                      </div>
                      <h4 className={`text-lg font-semibold ${colorClasses.text}`}>
                        {level.title}
                      </h4>
                    </div>
                    
                    <p className={`text-sm ${colorClasses.text} opacity-80 mb-2`}>
                      {level.subtitle}
                    </p>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {level.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        ⏱️ {level.timeEstimate}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDetails(level.id);
                        }}
                        className={`text-xs ${colorClasses.text} hover:underline`}
                      >
                        {showDetails[level.id] ? 'Hide details ↑' : 'Show details ↓'}
                      </button>
                    </div>

                    {/* Detailed Features */}
                    {showDetails[level.id] && (
                      <div className="mt-4 p-3 bg-white rounded-lg border">
                        <h5 className="text-sm font-medium text-gray-800 mb-2">
                          What you'll learn:
                        </h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {level.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2 mt-0.5">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        {level.nextLevel && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            📈 After mastering this level, you can advance to: {
                              userLevels.find(l => l.id === level.nextLevel)?.title
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assessment Questions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-800 mb-3">
            🤔 Not sure? Answer these quick questions:
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 min-w-0 flex-1">
                Have you ever written HTML tags like &lt;div&gt; or &lt;p&gt;?
              </span>
              <div className="flex space-x-2">
                <span className="text-green-600">Yes → Intermediate+</span>
                <span className="text-blue-600">No → Beginner</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 min-w-0 flex-1">
                Do you know CSS properties like margin, padding, flexbox?
              </span>
              <div className="flex space-x-2">
                <span className="text-purple-600">Yes → Advanced</span>
                <span className="text-blue-600">Some → Intermediate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4">
          <Button
            onClick={onClose}
            variant="outline"
          >
            Skip for now
          </Button>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedLevel ? `Selected: ${userLevels.find(l => l.id === selectedLevel)?.title}` : 'Choose your level'}
            </span>
            
            <Button
              onClick={handleConfirm}
              disabled={!selectedLevel}
              className={selectedLevel ? getColorClasses(
                userLevels.find(l => l.id === selectedLevel)?.color
              ).button : ''}
            >
              Start Learning 🚀
            </Button>
          </div>
        </div>

        {/* Educational Note */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Don't worry!</strong> You can change your level anytime in settings. 
            The tutorials adapt to help you learn at your own pace.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default UserLevelSelector;