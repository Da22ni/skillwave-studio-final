// components/IA/AIAssistant.jsx

// 🧠 English:
// Enhanced AI assistant panel with complete educational explanations, code suggestions, and interactive help

// 💬 Español humano:
// Panel mejorado del asistente de IA con explicaciones educativas completas, sugerencias de código y ayuda interactiva

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLogger } from '../../hooks/useLogger';
import { useEditor } from '../../hooks/useEditor';
import { useEditorStore } from '../../store/useEditorStore';
import { explainUserAction, generateCodeSuggestion, askAI } from '../../services/openai';
import { logDebug, logError, logInteraction } from '../../debug/report';
import Button from '../UI/Button';
import Input from '../UI/Input';

const AIAssistant = () => {
  const { t, i18n } = useTranslation();
  const { actions, getRecentActions } = useLogger();
  const { elements, selectedElement, currentProject } = useEditor();
  const userLevel = useEditorStore(state => state.userLevel);
  const setUserLevel = useEditorStore(state => state.setUserLevel);
  
  // 🧠 English: Enhanced state management for complete AI functionality
  // 💬 Español humano: Gestión de estado mejorada para funcionalidad completa de IA
  const [aiState, setAiState] = useState({
    isExplaining: false,
    currentExplanation: '',
    userQuestion: '',
    isAnswering: false,
    isGeneratingCode: false,
    codeRequest: '',
    conversationHistory: [],
    aiPersonality: 'encouraging', // encouraging, technical, casual
    showAdvancedOptions: false
  });

  const [quickActions, setQuickActions] = useState([
    { id: 1, text: 'How do I change colors?', category: 'styling' },
    { id: 2, text: 'What is CSS?', category: 'concept' },
    { id: 3, text: 'How to make it responsive?', category: 'responsive' },
    { id: 4, text: 'Export my website?', category: 'export' },
    { id: 5, text: 'Add animations?', category: 'advanced' },
    { id: 6, text: 'Best practices?', category: 'learning' }
  ]);

  // Auto-explain recent actions with enhanced context
  useEffect(() => {
    const recentActions = getRecentActions(1);
    if (recentActions.length > 0 && !aiState.isExplaining) {
      const latestAction = recentActions[0];
      handleAutoExplain(latestAction.message);
    }
  }, [actions]);

  const handleAutoExplain = async (action) => {
    if (aiState.isExplaining) return;

    try {
      setAiState(prev => ({ ...prev, isExplaining: true }));
      
      console.debug(`🤖 [AIAssistant] Auto-explaining action: ${action}`);
      logDebug('AI_AUTO_EXPLAIN', 'Auto explanation started', { action });

      // Enhanced context for better explanations
      const context = {
        action,
        elements: elements,
        selectedElement: selectedElement,
        projectElementCount: elements.length,
        userLevel: userLevel,
        hasProject: !!currentProject,
        language: i18n.language === 'es' ? 'Spanish' : 'English'
      };

      const result = await explainUserAction(action, context);
      
      if (result.success) {
        setAiState(prev => ({
          ...prev,
          currentExplanation: result.explanation,
          conversationHistory: [
            ...prev.conversationHistory.slice(-4), // Keep last 4 interactions
            { type: 'auto_explain', action, explanation: result.explanation, timestamp: new Date() }
          ]
        }));
        
        console.debug('🤖 [AIAssistant] Auto explanation received:', result.explanation);
        logInteraction('ai_auto_explanation', { action, success: true });
      } else {
        console.error('🤖 [AIAssistant] Auto explanation failed:', result.error);
        logError('ai_auto_explain_failed', { action, error: result.error });
        
        setAiState(prev => ({
          ...prev,
          currentExplanation: `I noticed you ${action.toLowerCase()}. Great work building your website! Each action helps you learn web development.`
        }));
      }
    } catch (error) {
      console.error('🤖 [AIAssistant] Error in auto explain:', error);
      logError('ai_auto_explain_error', { action, error: error.message });
    } finally {
      setAiState(prev => ({ ...prev, isExplaining: false }));
    }
  };

  const handleUserQuestion = async () => {
    if (!aiState.userQuestion.trim() || aiState.isAnswering) return;

    try {
      setAiState(prev => ({ ...prev, isAnswering: true }));
      
      console.debug(`🤖 [AIAssistant] User asked: ${aiState.userQuestion}`);
      logInteraction('ai_user_question', { question: aiState.userQuestion });

      const context = {
        elements: elements,
        selectedElement: selectedElement,
        userLevel: userLevel,
        projectElements: elements.length,
        currentProject: currentProject?.name
      };

      const result = await askAI(aiState.userQuestion, context);
      
      if (result.success) {
        setAiState(prev => ({
          ...prev,
          currentExplanation: result.answer,
          conversationHistory: [
            ...prev.conversationHistory.slice(-4),
            { 
              type: 'user_question', 
              question: prev.userQuestion, 
              answer: result.answer, 
              timestamp: new Date() 
            }
          ],
          userQuestion: ''
        }));
        
        console.debug('🤖 [AIAssistant] User question answered:', result.answer);
      } else {
        console.error('🤖 [AIAssistant] Failed to answer question:', result.error);
        logError('ai_question_failed', { question: aiState.userQuestion, error: result.error });
      }
      
    } catch (error) {
      console.error('🤖 [AIAssistant] Error answering question:', error);
      logError('ai_question_error', { question: aiState.userQuestion, error: error.message });
    } finally {
      setAiState(prev => ({ ...prev, isAnswering: false }));
    }
  };

  const handleCodeRequest = async () => {
    if (!aiState.codeRequest.trim() || aiState.isGeneratingCode) return;

    try {
      setAiState(prev => ({ ...prev, isGeneratingCode: true }));
      
      console.debug(`🤖 [AIAssistant] Generating code for: ${aiState.codeRequest}`);
      logInteraction('ai_code_request', { request: aiState.codeRequest });

      const context = {
        elements: elements,
        userLevel: userLevel,
        selectedElement: selectedElement
      };

      const result = await generateCodeSuggestion(elements, aiState.codeRequest, context);
      
      if (result.success) {
        setAiState(prev => ({
          ...prev,
          currentExplanation: formatCodeSuggestion(result.suggestion),
          conversationHistory: [
            ...prev.conversationHistory.slice(-4),
            { 
              type: 'code_request', 
              request: prev.codeRequest, 
              suggestion: result.suggestion, 
              timestamp: new Date() 
            }
          ],
          codeRequest: ''
        }));
        
        console.debug('🤖 [AIAssistant] Code suggestion generated');
      }
      
    } catch (error) {
      console.error('🤖 [AIAssistant] Error generating code:', error);
      logError('ai_code_error', { request: aiState.codeRequest, error: error.message });
    } finally {
      setAiState(prev => ({ ...prev, isGeneratingCode: false }));
    }
  };

  const handleQuickAction = (action) => {
    console.debug(`🤖 [AIAssistant] Quick action: ${action.text}`);
    setAiState(prev => ({ ...prev, userQuestion: action.text }));
    logInteraction('ai_quick_action', { actionId: action.id, text: action.text, category: action.category });
  };

  const formatCodeSuggestion = (suggestion) => {
    return `💻 Code Suggestion:\n\n${suggestion.explanation}\n\n🔧 HTML:\n${suggestion.html}\n\n🎨 CSS:\n${suggestion.css}\n\n💡 Tip: ${suggestion.tip}`;
  };

  const handlePersonalityChange = (personality) => {
    setAiState(prev => ({ ...prev, aiPersonality: personality }));
    logInteraction('ai_personality_change', { personality });
    console.debug(`🤖 [AIAssistant] AI personality changed to: ${personality}`);
  };

  const handleUserLevelChange = (level) => {
    setUserLevel(level);
    logInteraction('ai_user_level_change', { level });
    console.debug(`🤖 [AIAssistant] User level changed to: ${level}`);
  };

  return (
    <div className="bg-gradient-to-b from-purple-50 to-blue-50 p-4 rounded-lg">
      {/* Enhanced Header with Settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t('editor.aiHelper')}
            </h3>
            <p className="text-xs text-gray-600">
              {aiState.userLevel} mode • {aiState.aiPersonality} style
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setAiState(prev => ({ ...prev, showAdvancedOptions: !prev.showAdvancedOptions }))}
          className="text-gray-500 hover:text-gray-700 p-1"
        >
          ⚙️
        </button>
      </div>

      {/* Advanced Options Panel */}
      {aiState.showAdvancedOptions && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
          <h4 className="text-sm font-medium mb-2">AI Settings</h4>
          
          {/* User Level */}
          <div className="mb-2">
            <label className="text-xs text-gray-600 block mb-1">Your Level:</label>
            <div className="flex space-x-2">
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => handleUserLevelChange(level)}
                  className={`text-xs px-2 py-1 rounded ${
                    aiState.userLevel === level
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          {/* AI Personality */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">AI Style:</label>
            <div className="flex space-x-2">
              {['encouraging', 'technical', 'casual'].map(personality => (
                <button
                  key={personality}
                  onClick={() => handlePersonalityChange(personality)}
                  className={`text-xs px-2 py-1 rounded ${
                    aiState.aiPersonality === personality
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {personality}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced AI Explanation Display */}
      <div className="mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100 min-h-[100px]">
          {aiState.isExplaining ? (
            <div className="flex items-center text-gray-600">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Analyzing your last action...</span>
            </div>
          ) : aiState.currentExplanation ? (
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-purple-600 text-sm mr-2 mt-0.5">🤖</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                    {aiState.currentExplanation}
                  </p>
                  {/* Educational Context */}
                  <div className="mt-2 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                    💡 Context: Working with {elements.length} elements • Current project: {currentProject?.name || 'Untitled'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              <div className="mb-2">👋</div>
              <p className="text-sm">Hi! I'm your AI web development tutor.</p>
              <p className="text-xs">Start building and I'll explain what you're doing!</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Question Interface */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Ask me anything:</h4>
        
        {/* Main Question Input */}
        <div className="flex space-x-2">
          <Input
            value={aiState.userQuestion}
            onChange={(e) => setAiState(prev => ({ ...prev, userQuestion: e.target.value }))}
            placeholder="How do I make this button bigger?"
            className="flex-1 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleUserQuestion()}
          />
          
          <Button
            onClick={handleUserQuestion}
            disabled={!aiState.userQuestion.trim() || aiState.isAnswering}
            loading={aiState.isAnswering}
            size="small"
          >
            Ask
          </Button>
        </div>

        {/* Code Request Input */}
        <div className="flex space-x-2">
          <Input
            value={aiState.codeRequest}
            onChange={(e) => setAiState(prev => ({ ...prev, codeRequest: e.target.value }))}
            placeholder="Generate code for a navigation menu"
            className="flex-1 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleCodeRequest()}
          />
          
          <Button
            onClick={handleCodeRequest}
            disabled={!aiState.codeRequest.trim() || aiState.isGeneratingCode}
            loading={aiState.isGeneratingCode}
            size="small"
            variant="outline"
          >
            💻
          </Button>
        </div>

        {/* Enhanced Quick Questions */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Quick questions:</p>
          <div className="grid grid-cols-2 gap-1">
            {quickActions
              .filter(action => 
                aiState.userLevel === 'beginner' ? 
                  ['styling', 'concept', 'export'].includes(action.category) :
                  aiState.userLevel === 'intermediate' ?
                    !['concept'].includes(action.category) :
                    action.category !== 'concept'
              )
              .slice(0, 6)
              .map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="text-xs bg-white hover:bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-200 transition-colors text-left"
                >
                  {action.text}
                </button>
              ))}
          </div>
        </div>

        {/* Conversation History */}
        {aiState.conversationHistory.length > 0 && (
          <div className="mt-4 p-2 bg-white rounded border border-purple-100">
            <h5 className="text-xs font-medium text-gray-700 mb-1">Recent Conversations:</h5>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {aiState.conversationHistory.slice(-3).map((conv, index) => (
                <div key={index} className="text-xs text-gray-600">
                  <span className="font-medium">{conv.type}:</span> {conv.question || conv.action || conv.request}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🧠 English: Educational note about AI assistant functionality
          💬 Español humano: Nota educativa sobre la funcionalidad del asistente de IA */}
      <div className="mt-4 text-xs text-center text-gray-500">
        🧠 This AI helps you learn web development while building
      </div>
    </div>
  );
};

export default AIAssistant;