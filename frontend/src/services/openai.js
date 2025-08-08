// services/openai.js

// 🧠 English:
// OpenAI service for educational AI explanations with cost guard, rate limiting and caching

// 💬 Español humano:
// Servicio de OpenAI para explicaciones educativas con protección de costos, rate limiting y cache

import OpenAI from 'openai';
import { logDebug, logError, logPerformance } from '../debug/report';

// Cost guard instance (will be initialized from components)
let costGuardInstance = null;

export const initializeCostGuard = (costGuard) => {
  costGuardInstance = costGuard;
  console.debug('✅ OpenAI service: Cost guard initialized');
};

const getCostGuard = () => costGuardInstance;

// Initialize OpenAI client
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

if (!apiKey || apiKey.includes('your-') || apiKey.includes('sk-your')) {
  console.warn('🤖 [OpenAI] No valid API key provided - AI features will be disabled');
}

const openai = apiKey && !apiKey.includes('your-') && !apiKey.includes('sk-your')
  ? new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    })
  : null;

console.debug('🤖 OpenAI Educational AI service initialized with cost protection');

/**
 * Educational AI helper for explaining user actions with deep pedagogical context
 * @param {string} action - User action to explain
 * @param {Object} context - Context including elements, user level, etc.
 * @returns {Object} - AI response with explanation and educational content
 */
export const explainUserAction = async (action, context = {}) => {
  const startTime = Date.now();
  const costGuard = getCostGuard();
  
  try {
    console.debug(`🤖 [explainUserAction] Generating AI explanation for: ${action}`);
    logDebug('AI_REQUEST', 'User action explanation requested', { action, context });

    // Enhanced prompt with pedagogical approach
    const prompt = `You are Skillwave AI - an expert web development teacher in a visual website builder similar to Webflow. 

User Action: "${action}"
Context: ${JSON.stringify(context, null, 2)}
User Level: ${context.userLevel || 'beginner'}
Project Elements: ${context.elements?.length || 0} elements

EDUCATIONAL RESPONSE RULES:
1. Start with what the user just accomplished (positive reinforcement)
2. Explain the technical concept behind their action in simple terms
3. Connect it to real web development (HTML/CSS/JS)
4. Provide a helpful next step or tip
5. Use encouraging, teaching tone
6. Keep response under 100 words but informative

RESPONSE FORMAT:
✨ Great work! [What they did]
🧠 This means: [Technical explanation in simple terms]
💡 Web Dev Connection: [How this relates to real web development]
🚀 Next Tip: [Helpful suggestion for next step]

Respond in ${context.language || 'English'}.`;

    // Check with cost guard before making request
    if (costGuard) {
      const checkResult = costGuard.canMakeRequest(prompt, `action-${action}-${context.userLevel || 'beginner'}`);
      
      if (!checkResult.allowed) {
        console.warn('🚫 AI request blocked by cost guard:', checkResult.reason);
        const fallbackExplanation = generateFallbackExplanation(action, context);
        const duration = Date.now() - startTime;
        
        logPerformance('ai_explain_user_action_fallback', duration, { 
          reason: checkResult.reason,
          action, 
          cached: false 
        });
        
        return {
          explanation: fallbackExplanation,
          source: 'cost_guard_fallback',
          rateLimited: checkResult.reason === 'Rate limited',
          retryAfter: checkResult.retryAfter
        };
      }
      
      // Check if we have a cached response
      if (checkResult.cached) {
        console.debug('💰 Using cached AI response');
        const duration = Date.now() - startTime;
        logPerformance('ai_explain_user_action_cache', duration, { action, cached: true });
        
        return {
          explanation: checkResult.response,
          source: 'cache',
          cached: true
        };
      }
    }

    // Check if OpenAI is available
    if (!openai) {
      console.warn('🤖 [explainUserAction] OpenAI not available - using fallback');
      const fallbackExplanation = generateFallbackExplanation(action, context);
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: 'OpenAI API key not configured',
        explanation: fallbackExplanation,
        duration,
        context: 'fallback'
      };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Skillwave AI - an encouraging, knowledgeable web development teacher. Always be positive, educational, and help users learn while building."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
      presence_penalty: 0.1
    });

    const explanation = completion.choices[0].message.content.trim();
    const duration = Date.now() - startTime;
    
    console.debug('🤖 [explainUserAction] AI explanation generated:', explanation);
    logPerformance('openai_explain_action', duration, { action, responseLength: explanation.length });
    
    // Educational logging
    console.debug('🧠 Educational Note: AI explanations help users understand what they\'re doing while building');
    
    return {
      success: true,
      explanation,
      usage: completion.usage,
      duration,
      context: 'educational'
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('🤖 [explainUserAction] OpenAI API error:', error);
    logError('openai_explain_error', { action, error: error.message, duration });
    
    // Fallback educational explanation
    const fallbackExplanation = generateFallbackExplanation(action, context);
    
    return {
      success: false,
      error: error.message,
      explanation: fallbackExplanation,
      duration,
      context: 'fallback'
    };
  }
};

/**
 * Generate code suggestions with educational context
 * @param {Array} elements - Current elements in canvas
 * @param {string} userRequest - What the user wants to do
 * @param {Object} context - Additional context
 * @returns {Object} - Code suggestions with explanations
 */
export const generateCodeSuggestion = async (elements, userRequest, context = {}) => {
  const startTime = Date.now();
  
  try {
    console.debug(`🤖 [generateCodeSuggestion] Generating code for: ${userRequest}`);
    logDebug('AI_CODE_REQUEST', 'Code suggestion requested', { userRequest, elementCount: elements.length });

    const prompt = `You are Skillwave AI - a coding mentor for web development students.

Current Elements: ${JSON.stringify(elements, null, 2)}
User Request: "${userRequest}"
User Level: ${context.userLevel || 'beginner'}

TASK: Provide educational code suggestions that teach while solving the problem.

RESPONSE FORMAT (JSON):
{
  "explanation": "Brief explanation of the approach in teaching terms",
  "html": "Clean HTML code snippet with comments",
  "css": "Clean CSS code snippet with comments",
  "tip": "Educational tip about the concept",
  "nextSteps": ["suggestion 1", "suggestion 2"],
  "webDevConcept": "What web development concept this teaches"
}

Keep code clean, commented, and educational. Focus on teaching best practices.`;

    // Check if OpenAI is available
    if (!openai) {
      console.warn('🤖 [generateCodeSuggestion] OpenAI not available - using fallback');
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: 'OpenAI API key not configured',
        suggestion: generateFallbackCodeSuggestion(userRequest),
        duration,
        context: 'fallback'
      };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert web development teacher. Always provide clean, educational code with explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const responseText = completion.choices[0].message.content.trim();
    const duration = Date.now() - startTime;
    
    let suggestion;
    try {
      suggestion = JSON.parse(responseText);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      suggestion = {
        explanation: "I can help you with that code request!",
        html: "<!-- Code suggestion will go here -->",
        css: "/* CSS styles will go here */",
        tip: "Keep practicing to improve your coding skills!",
        nextSteps: ["Try experimenting with the code", "Look up CSS documentation"],
        webDevConcept: "Web development fundamentals"
      };
    }

    console.debug('🤖 [generateCodeSuggestion] Code suggestion generated');
    logPerformance('openai_generate_code', duration, { userRequest, codeLength: suggestion.html?.length || 0 });

    return {
      success: true,
      suggestion,
      usage: completion.usage,
      duration,
      context: 'educational'
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('🤖 [generateCodeSuggestion] OpenAI error:', error);
    logError('openai_code_error', { userRequest, error: error.message, duration });

    return {
      success: false,
      error: error.message,
      suggestion: generateFallbackCodeSuggestion(userRequest),
      duration,
      context: 'fallback'
    };
  }
};

/**
 * Ask AI a general question about web development
 * @param {string} question - User's question
 * @param {Object} context - Current context
 * @returns {Object} - AI response
 */
export const askAI = async (question, context = {}) => {
  const startTime = Date.now();
  
  try {
    console.debug(`🤖 [askAI] Answering question: ${question}`);
    logDebug('AI_QUESTION', 'User asked a question', { question, context });

    const prompt = `You are Skillwave AI - a friendly web development mentor.

Question: "${question}"
Context: Building a website in a visual editor similar to Webflow
Current Elements: ${context.elements?.length || 0} elements
User Level: ${context.userLevel || 'beginner'}

RESPONSE RULES:
1. Answer the question clearly and educationally
2. Relate it to their current project if possible
3. Provide practical tips they can apply immediately
4. Use encouraging tone
5. Keep response under 150 words
6. Include emojis to make it engaging

Format:
🎯 [Direct answer to their question]
💡 [Practical tip they can use now]
🚀 [Encouragement or next step]`;

    // Check if OpenAI is available
    if (!openai) {
      console.warn('🤖 [askAI] OpenAI not available - using fallback');
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: 'OpenAI API key not configured',
        answer: generateFallbackAnswer(question),
        duration,
        context: 'fallback'
      };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a supportive web development teacher. Always be encouraging and provide practical, actionable advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.8
    });

    const answer = completion.choices[0].message.content.trim();
    const duration = Date.now() - startTime;
    
    console.debug('🤖 [askAI] Question answered:', answer);
    logPerformance('openai_ask_ai', duration, { question, answerLength: answer.length });

    return {
      success: true,
      answer,
      usage: completion.usage,
      duration,
      context: 'educational'
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('🤖 [askAI] OpenAI error:', error);
    logError('openai_ask_error', { question, error: error.message, duration });

    return {
      success: false,
      error: error.message,
      answer: generateFallbackAnswer(question),
      duration,
      context: 'fallback'
    };
  }
};

/**
 * Generate fallback explanation when AI is not available
 * @param {string} action - User action
 * @param {Object} context - Context
 * @returns {string} - Fallback explanation
 */
function generateFallbackExplanation(action, context = {}) {
  const fallbacks = {
    'add': '✨ Great work adding an element! 🧠 This creates a new building block for your website. 💡 In web development, each element becomes HTML code. 🚀 Try customizing its properties next!',
    'delete': '✨ Element removed successfully! 🧠 This cleans up your design and removes the corresponding HTML. 💡 Less code means faster websites. 🚀 Keep building with confidence!',
    'update': '✨ Nice customization! 🧠 You just modified the element\'s properties. 💡 This changes the CSS styling in real web development. 🚀 Experiment with different values!',
    'move': '✨ Perfect positioning! 🧠 You moved an element to improve your layout. 💡 This adjusts the CSS positioning properties. 🚀 Good layouts make great websites!'
  };
  
  // Find matching fallback or use generic
  const actionType = Object.keys(fallbacks).find(key => action.toLowerCase().includes(key));
  const fallback = fallbacks[actionType] || 
    '✨ Great work! 🧠 You\'re building your website step by step. 💡 Each action helps you learn web development. 🚀 Keep experimenting and creating!';
  
  console.debug('🤖 [generateFallbackExplanation] Using fallback explanation for:', action);
  return fallback;
}

/**
 * Generate fallback code suggestion
 * @param {string} userRequest - User's request
 * @returns {Object} - Fallback suggestion
 */
function generateFallbackCodeSuggestion(userRequest) {
  return {
    explanation: "I'd love to help with that code request! The AI service is currently unavailable.",
    html: `<!-- ${userRequest} -->
<div class="custom-element">
  <!-- Your code will go here -->
</div>`,
    css: `/* ${userRequest} */
.custom-element {
  /* Add your styles here */
  display: block;
}`,
    tip: "Try experimenting with different CSS properties to achieve your desired effect!",
    nextSteps: ["Check online CSS documentation", "Experiment with different values", "Ask the community for help"],
    webDevConcept: "CSS styling and HTML structure"
  };
}

/**
 * Generate fallback answer for questions
 * @param {string} question - User's question
 * @returns {string} - Fallback answer
 */
function generateFallbackAnswer(question) {
  return `🎯 That's a great question about "${question}"! 💡 The AI assistant is temporarily unavailable, but you're on the right track with your learning. 🚀 Keep experimenting with the visual editor - hands-on practice is the best way to learn web development!`;
}

export default openai;

console.debug('🤖 Educational OpenAI service fully loaded with fallbacks and performance tracking');