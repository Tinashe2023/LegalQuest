// src/components/WritQuest.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchModules, fetchScenarios, getTranslation, getScenarioOptions } from '../utils/api';

const WritQuest = ({ language = 'en', onComplete }) => {
  const [scenario, setScenario] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);

  // Fallback data
  const fallbackData = {
    en: {
      prompt: 'A citizen is illegally detained without lawful order. Which writ applies?',
      options: [
        { id: 'a', text: 'Habeas Corpus (unlawful detention)' },
        { id: 'b', text: 'Mandamus (public duty enforcement)' },
        { id: 'c', text: 'Quo Warranto (challenge right to office)' },
        { id: 'd', text: 'Certiorari (quash illegal order)' }
      ],
      correct: 'a',
      explanation: 'Habeas Corpus is the remedy for unlawful detention; Article 32 enables Supreme Court remedies.'
    },
    hi: {
      prompt: 'एक नागरिक को बिना वैध आदेश अवैध रूप से हिरासत में रखा गया है। कौन सा राइट लागू होता है?',
      options: [
        { id: 'a', text: 'हैबियस कॉर्पस (अवैध हिरासत)' },
        { id: 'b', text: 'मंडामस (सार्वजनिक कर्तव्य लागू कराना)' },
        { id: 'c', text: 'क्वो वारंटो (पद की वैधता पर प्रश्न)' },
        { id: 'd', text: 'सर्टिओरारी (अवैध आदेश रद्द करना)' }
      ],
      correct: 'a',
      explanation: 'हैबियस कॉर्पस अवैध हिरासत हेतु है; अनु.32 सर्वोच्च न्यायालय उपचार देता है।'
    }
  };

  // Fetch writ scenario from DB
  useEffect(() => {
    const loadWritScenario = async () => {
      try {
        setLoading(true);
        
        // Try to find remedies module and get writ scenarios
        const modules = await fetchModules();
        const remediesModule = modules.find(m => {
          const translation = getTranslation(m.translations || {}, language);
          return m.id === 'constitutional-remedies' || 
                 translation.title?.toLowerCase().includes('remedy') ||
                 translation.title?.toLowerCase().includes('writ');
        });

        if (remediesModule) {
          const scenarios = await fetchScenarios(remediesModule.id);
          // Look for writ-related scenarios
          const writScenario = scenarios.find(s => {
            const translation = getTranslation(s.translations || {}, language);
            return s.id.includes('writ') || 
                   translation.concept?.toLowerCase().includes('writ') ||
                   translation.story?.toLowerCase().includes('writ');
          });

          if (writScenario) {
            setScenario(writScenario);
            setError(null);
            setLoading(false);
            return;
          }
        }

        // Fallback to local data
        setError('Using offline data');
        setScenario({
          id: 'writ_fallback',
          correctAnswer: fallbackData[language]?.correct || fallbackData.en.correct,
          translations: {
            [language]: {
              story: fallbackData[language]?.prompt || fallbackData.en.prompt,
              options: (fallbackData[language]?.options || fallbackData.en.options).map(opt => ({
                id: opt.id,
                text: opt.text
              })),
              feedbackCorrect: fallbackData[language]?.explanation || fallbackData.en.explanation,
              feedbackIncorrect: language === 'en' 
                ? 'Incorrect. The correct writ is Habeas Corpus for unlawful detention.'
                : 'गलत। सही राइट अवैध हिरासत के लिए हैबियस कॉर्पस है।'
            }
          }
        });
      } catch (err) {
        console.warn('Failed to fetch writ scenario, using fallback:', err);
        setError('Using offline data');
        setScenario({
          id: 'writ_fallback',
          correctAnswer: fallbackData[language]?.correct || fallbackData.en.correct,
          translations: {
            [language]: {
              story: fallbackData[language]?.prompt || fallbackData.en.prompt,
              options: (fallbackData[language]?.options || fallbackData.en.options).map(opt => ({
                id: opt.id,
                text: opt.text
              })),
              feedbackCorrect: fallbackData[language]?.explanation || fallbackData.en.explanation,
              feedbackIncorrect: language === 'en' 
                ? 'Incorrect. The correct writ is Habeas Corpus for unlawful detention.'
                : 'गलत। सही राइट अवैध हिरासत के लिए हैबियस कॉर्पस है।'
            }
          }
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadWritScenario();
  }, [language]);

  const handleSubmit = () => {
    if (!selectedOption || showFeedback) return;
    
    setShowFeedback(true);
    const isCorrect = selectedOption === scenario.correctAnswer;
    
    if (isCorrect) {
      onComplete && onComplete({ 
        points: 10, 
        badge: 'Writ Champion',
        completed_module: null
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 text-center transition-colors">
        <div className="animate-pulse text-gray-800 dark:text-gray-200">Loading writ scenario...</div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 text-center transition-colors">
        <p className="text-gray-800 dark:text-gray-200">{language === 'en' ? 'No scenario available' : 'कोई परिदृश्य उपलब्ध नहीं'}</p>
      </div>
    );
  }

  const translation = getTranslation(scenario.translations || {}, language);
  const options = getScenarioOptions(scenario, language);
  const isCorrect = selectedOption === scenario.correctAnswer;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          {language === 'en' ? 'Writ Quest' : 'राइट क्वेस्ट'}
        </h3>
        <button
          onClick={() => setShowTutorial(!showTutorial)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          {showTutorial ? '✕' : '?'} {language === 'en' ? 'Help' : 'सहायता'}
        </button>
      </div>

      {/* Tutorial Tooltip */}
      {showTutorial && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <h4 className="font-semibold mb-2">
            {language === 'en' ? 'About Constitutional Writs' : 'संवैधानिक राइट्स के बारे में'}
          </h4>
          <p className="text-sm text-gray-700">
            {language === 'en'
              ? 'Writs are legal remedies available under Article 32 (Supreme Court) and Article 226 (High Courts). The five main writs are: Habeas Corpus (personal liberty), Mandamus (public duty), Prohibition (prevent excess), Certiorari (quash orders), and Quo Warranto (challenge office).'
              : 'राइट्स अनु.32 (सर्वोच्च न्यायालय) और अनु.226 (उच्च न्यायालय) के तहत उपलब्ध कानूनी उपचार हैं। पांच मुख्य राइट्स हैं: हैबियस कॉर्पस (व्यक्तिगत स्वतंत्रता), मंडामस (सार्वजनिक कर्तव्य), प्रोहिबिशन (अतिक्रमण रोकना), सर्टिओरारी (आदेश रद्द करना), और क्वो वारंटो (पद पर प्रश्न)।'}
          </p>
        </motion.div>
      )}

      {/* Scenario */}
      <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
        <p className="text-gray-800 font-medium">{translation.story || translation.concept}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const isCorrectOption = opt.id === scenario.correctAnswer;
          const showCorrect = showFeedback && isCorrectOption;
          const showIncorrect = showFeedback && isSelected && !isCorrectOption;

          return (
            <motion.button
              key={opt.id}
              onClick={() => !showFeedback && setSelectedOption(opt.id)}
              disabled={showFeedback}
              whileHover={!showFeedback ? { scale: 1.02 } : {}}
              whileTap={!showFeedback ? { scale: 0.98 } : {}}
              className={`
                w-full p-4 rounded text-left transition-all
                ${isSelected && !showFeedback
                  ? 'bg-indigo-100 border-2 border-indigo-500'
                  : 'bg-white border-2 border-gray-200 hover:border-indigo-300'
                }
                ${showCorrect ? 'bg-green-100 border-green-500' : ''}
                ${showIncorrect ? 'bg-red-100 border-red-500' : ''}
                ${showFeedback ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{opt.text}</span>
                {showFeedback && isCorrectOption && (
                  <span className="text-green-600 text-xl">✓</span>
                )}
                {showFeedback && showIncorrect && (
                  <span className="text-red-600 text-xl">✗</span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Submit Button / Feedback */}
      {!showFeedback ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {language === 'en' ? 'Submit Answer' : 'उत्तर जमा करें'}
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <p className="font-semibold text-lg mb-2">
            {isCorrect
              ? (language === 'en' ? '✓ Correct! You earned the Writ Champion badge!' : '✓ सही! आपने राइट चैंपियन बैज अर्जित किया!')
              : (language === 'en' ? '✗ Incorrect' : '✗ गलत')}
          </p>
          <p className="text-sm text-gray-700">
            {isCorrect ? translation.feedbackCorrect : translation.feedbackIncorrect}
          </p>
          {isCorrect && (
            <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-sm font-semibold text-yellow-800">
                🏆 {language === 'en' ? 'Badge Unlocked: Writ Champion' : 'बैज अनलॉक: राइट चैंपियन'}
              </p>
            </div>
          )}
        </motion.div>
      )}

      {error && (
        <div className="mt-2 text-sm text-yellow-600">{error}</div>
      )}
    </div>
  );
};

export default WritQuest;
