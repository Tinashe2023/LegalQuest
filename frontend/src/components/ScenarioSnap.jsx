// src/components/ScenarioSnap.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllScenarios, getTranslation, getScenarioOptions } from '../utils/api';
import { SCENARIO_SNAP_CARDS } from '../data/fundamentalRightsData';

const ScenarioSnap = ({ language = 'en', onComplete }) => {
  const [scenarios, setScenarios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerMode, setTimerMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [learnMode, setLearnMode] = useState(false);
  const [reviewLater, setReviewLater] = useState(new Set());

  const TIMER_DURATION = 15; // seconds per card

  // Fetch scenarios from DB
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setLoading(true);
        const dbScenarios = await fetchAllScenarios();
        
        // Shuffle scenarios
        const shuffled = [...dbScenarios].sort(() => Math.random() - 0.5);
        setScenarios(shuffled.slice(0, 10)); // Use first 10 for the game
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch scenarios from DB, using fallback:', err);
        // Fallback to local data
        setScenarios(SCENARIO_SNAP_CARDS);
        setError('Using offline data');
      } finally {
        setLoading(false);
      }
    };
    
    loadScenarios();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!timerMode || !scenarios[currentIndex] || showFeedback) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(TIMER_DURATION);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, timerMode, showFeedback]);

  const handleTimeout = () => {
    setShowFeedback(true);
    setStreak(0);
    // Auto-advance after timeout
    setTimeout(() => {
      nextCard();
    }, 2000);
  };

  const currentScenario = scenarios[currentIndex];
  const translation = currentScenario ? getTranslation(currentScenario.translations || {}, language) : null;
  const options = currentScenario ? getScenarioOptions(currentScenario, language) : [];

  // Build multiple choice options (correct + distractors)
  const buildOptions = () => {
    if (!currentScenario || options.length === 0) return [];
    
    const correctOption = options.find(opt => opt.id === currentScenario.correctAnswer);
    if (!correctOption) return options;

    // Get distractors from other scenarios
    const otherScenarios = scenarios.filter(s => s.id !== currentScenario.id);
    const allOtherOptions = otherScenarios.flatMap(s => getScenarioOptions(s, language));
    
    // Pick 2-3 random distractors
    const distractors = [...allOtherOptions]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, allOtherOptions.length))
      .map(opt => ({ ...opt, isDistractor: true }));

    // Combine correct + distractors and shuffle
    const allOptions = [
      { ...correctOption, isCorrect: true },
      ...distractors
    ].sort(() => Math.random() - 0.5);

    return allOptions.slice(0, 4); // Max 4 options
  };

  const displayOptions = buildOptions();

  const handleSubmit = () => {
    if (!selectedOption || showFeedback) return;
    
    const isCorrect = selectedOption === currentScenario.correctAnswer;
    setShowFeedback(true);

    if (isCorrect) {
      const points = 10 + (streak > 0 ? Math.min(streak * 2, 10) : 0); // Bonus for streaks
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      onComplete && onComplete({ points, badge: streak >= 5 ? 'Snap Master' : null });
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setStreak(0);
    }
  };

  const nextCard = () => {
    if (currentIndex < scenarios.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setTimeLeft(timerMode ? TIMER_DURATION : null);
    } else {
      // Game complete
      onComplete && onComplete({ 
        points: score, 
        badge: score >= 80 ? 'Snap Champion' : null 
      });
      alert(language === 'en' ? 'Game complete!' : 'खेल समाप्त!');
    }
  };

  const toggleReviewLater = () => {
    const newSet = new Set(reviewLater);
    if (newSet.has(currentScenario.id)) {
      newSet.delete(currentScenario.id);
    } else {
      newSet.add(currentScenario.id);
    }
    setReviewLater(newSet);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 text-center transition-colors">
        <div className="animate-pulse text-gray-800 dark:text-gray-200">Loading scenarios...</div>
      </div>
    );
  }

  if (!currentScenario || !translation) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 text-center transition-colors">
        <p className="text-gray-800 dark:text-gray-200">{language === 'en' ? 'No scenarios available' : 'कोई परिदृश्य उपलब्ध नहीं'}</p>
      </div>
    );
  }

  const isCorrect = selectedOption === currentScenario.correctAnswer;
  const isReviewed = reviewLater.has(currentScenario.id);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          {language === 'en' ? 'Scenario Snap' : 'परिदृश्य स्नैप'}
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-600">{language === 'en' ? 'Score:' : 'स्कोर:'} </span>
            <span className="font-bold">{score}</span>
            {streak > 0 && (
              <span className="ml-2 text-orange-600">
                🔥 {streak} {language === 'en' ? 'streak' : 'स्ट्रीक'}
              </span>
            )}
          </div>
          <button
            onClick={() => setTimerMode(!timerMode)}
            className={`px-3 py-1 rounded text-sm ${
              timerMode ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            ⏱️ {timerMode ? (language === 'en' ? 'Timer ON' : 'टाइमर चालू') : (language === 'en' ? 'Timer OFF' : 'टाइमर बंद')}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{language === 'en' ? 'Card' : 'कार्ड'} {currentIndex + 1} / {scenarios.length}</span>
          {timeLeft !== null && (
            <span className={timeLeft <= 5 ? 'text-red-600 font-bold' : ''}>
              ⏱️ {timeLeft}s
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-indigo-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / scenarios.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card Flip Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-indigo-200">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-800">
                {language === 'en' ? 'Scenario:' : 'परिदृश्य:'}
              </h4>
              {learnMode && (
                <button
                  onClick={toggleReviewLater}
                  className={`text-sm px-2 py-1 rounded ${
                    isReviewed ? 'bg-yellow-200' : 'bg-gray-200'
                  }`}
                >
                  {isReviewed ? '⭐' : '☆'} {language === 'en' ? 'Review' : 'समीक्षा'}
                </button>
              )}
            </div>
            <p className="text-gray-700 mb-4">{translation.story || translation.concept}</p>

            {/* Options */}
            <div className="space-y-2">
              {displayOptions.map((opt, idx) => {
                const isSelected = selectedOption === opt.id;
                const isCorrectOption = opt.id === currentScenario.correctAnswer;
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
                      <span>{opt.text}</span>
                      {showFeedback && isCorrectOption && (
                        <span className="text-green-600">✓</span>
                      )}
                      {showFeedback && showIncorrect && (
                        <span className="text-red-600">✗</span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg mb-4 ${
            isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          <p className="font-semibold mb-2">
            {isCorrect
              ? (language === 'en' ? '✓ Correct!' : '✓ सही!')
              : (language === 'en' ? '✗ Incorrect' : '✗ गलत')}
          </p>
          <p className="text-sm text-gray-700">
            {isCorrect ? translation.feedbackCorrect : translation.feedbackIncorrect}
          </p>
          {translation.explanation && learnMode && (
            <div className="mt-2 p-2 bg-white rounded text-sm">
              <strong>{language === 'en' ? 'Explanation:' : 'व्याख्या:'}</strong> {translation.explanation}
            </div>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {!showFeedback ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || (timerMode && timeLeft === 0)}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {language === 'en' ? 'Check Answer' : 'उत्तर जांचें'}
          </button>
        ) : (
          <>
            <button
              onClick={nextCard}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {currentIndex < scenarios.length - 1
                ? (language === 'en' ? 'Next Card' : 'अगला कार्ड')
                : (language === 'en' ? 'Finish' : 'समाप्त')}
            </button>
            <button
              onClick={() => setLearnMode(!learnMode)}
              className={`px-4 py-2 rounded ${
                learnMode ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {learnMode ? (language === 'en' ? 'Learn Mode ON' : 'सीखना मोड चालू') : (language === 'en' ? 'Learn Mode' : 'सीखना मोड')}
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 text-sm text-yellow-600">{error}</div>
      )}
    </div>
  );
};

export default ScenarioSnap;
