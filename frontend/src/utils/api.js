// frontend/src/utils/api.js
// API utility functions for fetching modules, scenarios, and options

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Fetch all modules with translations
 * @returns {Promise<Array>} Array of modules with translations
 */
export async function fetchModules() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(`${API_BASE}/modules`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Normalize module structure
    return data.modules.map(module => ({
      id: module.id,
      icon: module.icon,
      articles: module.articles || '',
      translations: module.translations || {}
    }));
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Module fetch timeout');
      throw new Error('Request timeout - please check your connection');
    }
    console.error('Failed to fetch modules:', error);
    throw error;
  }
}

/**
 * Fetch scenarios for a specific module
 * @param {string} moduleId - The module ID
 * @returns {Promise<Array>} Array of scenarios with translations and options
 */
export async function fetchScenarios(moduleId) {
  if (!moduleId) {
    throw new Error('Module ID is required');
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Use path parameter route: /api/scenarios/module/:moduleId
    const response = await fetch(`${API_BASE}/scenarios/module/${moduleId}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const scenarios = await response.json();
    
    // Normalize scenario structure
    return scenarios.map(scenario => ({
      id: scenario.id,
      moduleId: scenario.module_id || moduleId,
      correctAnswer: scenario.correct_answer,
      orderIndex: scenario.order_index || 0,
      translations: scenario.translations || {}
    }));
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Scenario fetch timeout');
      throw new Error('Request timeout - please check your connection');
    }
    console.error('Failed to fetch scenarios:', error);
    throw error;
  }
}

/**
 * Fetch all scenarios across all modules (for games that need random scenarios)
 * @returns {Promise<Array>} Array of all scenarios
 */
export async function fetchAllScenarios() {
  try {
    // Fetch all modules first, then fetch scenarios for each
    const modules = await fetchModules();
    const allScenarios = [];
    
    for (const module of modules) {
      try {
        const scenarios = await fetchScenarios(module.id);
        allScenarios.push(...scenarios);
      } catch (err) {
        console.warn(`Failed to fetch scenarios for module ${module.id}:`, err);
      }
    }
    
    return allScenarios;
  } catch (error) {
    console.error('Failed to fetch all scenarios:', error);
    throw error;
  }
}

/**
 * Get translation for a specific language with fallback to 'en'
 * @param {Object} translations - Translations object { en: {...}, hi: {...} }
 * @param {string} language - Language code (en, hi, ta)
 * @returns {Object} Translation object for the requested language
 */
export function getTranslation(translations, language = 'en') {
  if (!translations) return {};
  return translations[language] || translations.en || translations[Object.keys(translations)[0]] || {};
}

/**
 * Get scenario options for a specific language
 * @param {Object} scenario - Scenario object with translations
 * @param {string} language - Language code
 * @returns {Array} Array of option objects { id, text }
 */
export function getScenarioOptions(scenario, language = 'en') {
  const translation = getTranslation(scenario.translations, language);
  return translation.options || [];
}
