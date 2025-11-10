// src/components/WheelOfRights.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchModules, fetchScenarios, getTranslation, getScenarioOptions } from '../utils/api';
import { WHEEL_QUESTIONS, FUNDAMENTAL_RIGHTS } from '../data/fundamentalRightsData';

const WheelOfRights = ({ language = 'en', onComplete }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [modules, setModules] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Categories for the wheel (based on modules or fallback)
  const categories = [
    { id: 'equality', name: language === 'en' ? 'Equality' : 'समानता', icon: '⚖️', color: 'from-blue-500 to-blue-700' },
    { id: 'freedom', name: language === 'en' ? 'Freedom' : 'स्वतंत्रता', icon: '🕊️', color: 'from-green-500 to-green-700' },
    { id: 'religion', name: language === 'en' ? 'Religion' : 'धर्म', icon: '🕉️', color: 'from-purple-500 to-purple-700' },
    { id: 'cultural', name: language === 'en' ? 'Cultural' : 'सांस्कृतिक', icon: '🎨', color: 'from-pink-500 to-pink-700' },
    { id: 'remedies', name: language === 'en' ? 'Remedies' : 'उपचार', icon: '📜', color: 'from-orange-500 to-orange-700' },
    { id: 'exploitation', name: language === 'en' ? 'Exploitation' : 'शोषण', icon: '🛡️', color: 'from-red-500 to-red-700' }
  ];

  // Fetch modules and scenarios
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const dbModules = await fetchModules();
        setModules(dbModules);
        
        // Fetch scenarios for each module
        const allScenarios = [];
        for (const module of dbModules) {
          try {
            const moduleScenarios = await fetchScenarios(module.id);
            allScenarios.push(...moduleScenarios.map(s => ({ ...s, moduleId: module.id })));
          } catch (err) {
            console.warn(`Failed to fetch scenarios for ${module.id}:`, err);
          }
        }
        setScenarios(allScenarios);
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch data from DB, using fallback:', err);
        setError('Using offline data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const spin = () => {
    if (spinning || loading) return;
    
    setSpinning(true);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setQuestion(null);
    setSelectedCategory(null);

    // Random rotation (multiple full spins + final position)
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const finalAngle = Math.random() * 360;
    const totalRotation = rotation + spins * 360 + finalAngle;
    
    setRotation(totalRotation);

    // Select category based on final position
    setTimeout(() => {
      const categoryIndex = Math.floor((finalAngle / 360) * categories.length) % categories.length;
      const category = categories[categoryIndex];
      setSelectedCategory(category);
      
      // Get question from scenarios or fallback
      const categoryScenarios = scenarios.filter(s => {
        const module = modules.find(m => m.id === s.moduleId);
        const translation = getTranslation(module?.translations || {}, language);
        return translation.title?.toLowerCase().includes(category.id) || 
               s.moduleId === category.id;
      });

      let selectedScenario = null;
      if (categoryScenarios.length > 0) {
        selectedScenario = categoryScenarios[Math.floor(Math.random() * categoryScenarios.length)];
      }

      // Fallback to local questions
      if (!selectedScenario && WHEEL_QUESTIONS[category.id]) {
        const localQuestions = WHEEL_QUESTIONS[category.id];
        const localQ = localQuestions[Math.floor(Math.random() * localQuestions.length)];
        setQuestion({
          id: 'local',
          translations: {
            [language]: {
              q: getTranslation(localQ, language).q,
              options: getTranslation(localQ, language).options,
              a: getTranslation(localQ, language).a
            }
          },
          correctAnswer: getTranslation(localQ, language).a,
          isLocal: true
        });
      } else if (selectedScenario) {
        setQuestion(selectedScenario);
      }

      setSpinning(false);
    }, 3000); // Match animation duration
  };

  const handleAnswer = (answerId) => {
    if (!question || showFeedback) return;
    
    setSelectedAnswer(answerId);
    setShowFeedback(true);
    
    const isCorrect = answerId === question.correctAnswer;
    if (isCorrect) {
      onComplete && onComplete({ points: 10, badge: null });
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 text-center transition-colors">
        <div className="animate-pulse text-gray-800 dark:text-gray-200">Loading wheel...</div>
      </div>
    );
  }

  const questionTranslation = question ? getTranslation(question.translations || {}, language) : null;
  const questionOptions = question ? (question.isLocal 
    ? questionTranslation.options 
    : getScenarioOptions(question, language)) : [];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 transition-colors">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        {language === 'en' ? 'Wheel of Rights' : 'अधिकार पहिया'}
      </h3>

      {/* Wheel */}
      <div className="flex justify-center mb-6">
        <div className="relative w-64 h-64">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className="relative w-full h-full"
          >
            {/* SVG Wheel */}
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <defs>
                {categories.map((cat, idx) => {
                  const angle = (360 / categories.length) * idx;
                  const largeArc = 360 / categories.length > 180 ? 1 : 0;
                  const x1 = 100 + 100 * Math.cos((angle * Math.PI) / 180);
                  const y1 = 100 + 100 * Math.sin((angle * Math.PI) / 180);
                  const x2 = 100 + 100 * Math.cos(((angle + 360 / categories.length) * Math.PI) / 180);
                  const y2 = 100 + 100 * Math.sin(((angle + 360 / categories.length) * Math.PI) / 180);
                  
                  return (
                    <path
                      key={cat.id}
                      d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={`url(#gradient-${idx})`}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </defs>
              {categories.map((cat, idx) => {
                const angle = (360 / categories.length) * idx + (360 / categories.length) / 2;
                const x = 100 + 70 * Math.cos((angle * Math.PI) / 180);
                const y = 100 + 70 * Math.sin((angle * Math.PI) / 180);
                
                return (
                  <g key={cat.id}>
                    <defs>
                      <linearGradient id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={cat.color.includes('blue') ? '#3B82F6' : 
                                                      cat.color.includes('green') ? '#10B981' :
                                                      cat.color.includes('purple') ? '#A855F7' :
                                                      cat.color.includes('pink') ? '#EC4899' :
                                                      cat.color.includes('orange') ? '#F97316' : '#EF4444'} />
                        <stop offset="100%" stopColor={cat.color.includes('blue') ? '#1E40AF' : 
                                                       cat.color.includes('green') ? '#047857' :
                                                       cat.color.includes('purple') ? '#7E22CE' :
                                                       cat.color.includes('pink') ? '#BE185D' :
                                                       cat.color.includes('orange') ? '#C2410C' : '#B91C1C'} />
                      </linearGradient>
                    </defs>
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-2xl fill-white font-bold"
                    >
                      {cat.icon}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>
          
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-red-600"></div>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <div className="text-center mb-6">
        <button
          onClick={spin}
          disabled={spinning}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {spinning 
            ? (language === 'en' ? 'Spinning...' : 'घूम रहा है...')
            : (language === 'en' ? 'Spin the Wheel' : 'पहिया घुमाएं')}
        </button>
      </div>

      {/* Selected Category */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-indigo-50 rounded text-center"
        >
          <div className="text-2xl mb-1">{selectedCategory.icon}</div>
          <div className="font-semibold">{selectedCategory.name}</div>
        </motion.div>
      )}

      {/* Question */}
      {question && questionTranslation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4"
        >
          <div className="p-4 bg-gray-50 rounded mb-4">
            <p className="font-semibold mb-3">{questionTranslation.q || questionTranslation.story || questionTranslation.concept}</p>
            
            <div className="space-y-2">
              {questionOptions.map((opt, idx) => {
                const optId = opt.id || opt;
                const optText = opt.text || opt;
                const isSelected = selectedAnswer === optId;
                const isCorrect = optId === question.correctAnswer;
                const showCorrect = showFeedback && isCorrect;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() => !showFeedback && handleAnswer(optId)}
                    disabled={showFeedback}
                    className={`
                      w-full p-3 rounded text-left transition-all
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
                      <span>{optText}</span>
                      {showFeedback && isCorrect && <span className="text-green-600">✓</span>}
                      {showFeedback && showIncorrect && <span className="text-red-600">✗</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-3 rounded ${
              selectedAnswer === question.correctAnswer ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className="font-semibold">
                {selectedAnswer === question.correctAnswer
                  ? (language === 'en' ? '✓ Correct! +10 points' : '✓ सही! +10 अंक')
                  : (language === 'en' ? '✗ Incorrect' : '✗ गलत')}
              </p>
              {questionTranslation.feedbackCorrect && selectedAnswer === question.correctAnswer && (
                <p className="text-sm mt-2">{questionTranslation.feedbackCorrect}</p>
              )}
              {questionTranslation.feedbackIncorrect && selectedAnswer !== question.correctAnswer && (
                <p className="text-sm mt-2">{questionTranslation.feedbackIncorrect}</p>
              )}
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

export default WheelOfRights;
