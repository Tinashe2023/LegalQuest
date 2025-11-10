// src/components/SnakesLadders.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllScenarios, getTranslation } from '../utils/api';
import { SNAKES_LADDERS_SCENARIOS } from '../data/fundamentalRightsData';

const BOARD_SIZE = 30;
const ROWS = 5;
const COLS = 6;

// Board position mapping (cell index -> {x, y} coordinates)
const getCellPosition = (index) => {
  const row = Math.floor(index / COLS);
  const col = row % 2 === 0 ? index % COLS : COLS - 1 - (index % COLS);
  return { row, col };
};

// Snake and ladder positions (can be configured or fetched from DB)
// Format: { from: cellIndex, to: cellIndex, type: 'snake' | 'ladder', scenarioId: string }
const DEFAULT_BOARD_CONFIG = [
  { from: 3, to: 12, type: 'ladder', scenarioId: null },
  { from: 7, to: 2, type: 'snake', scenarioId: null },
  { from: 15, to: 25, type: 'ladder', scenarioId: null },
  { from: 20, to: 8, type: 'snake', scenarioId: null },
  { from: 22, to: 28, type: 'ladder', scenarioId: null },
  { from: 27, to: 18, type: 'snake', scenarioId: null },
];

const SnakesLadders = ({ language = 'en', onComplete }) => {
  const [position, setPosition] = useState(0);
  const [score, setScore] = useState(0);
  const [dice, setDice] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [scenarioModal, setScenarioModal] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boardConfig, setBoardConfig] = useState(DEFAULT_BOARD_CONFIG);
  const [moveHistory, setMoveHistory] = useState([]);

  // Fetch scenarios from DB
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setLoading(true);
        const dbScenarios = await fetchAllScenarios();
        setScenarios(dbScenarios);
        
        // Map scenarios to board positions (assign scenarios to snake/ladder cells)
        const config = DEFAULT_BOARD_CONFIG.map((item, idx) => ({
          ...item,
          scenarioId: dbScenarios[idx % dbScenarios.length]?.id || null
        }));
        setBoardConfig(config);
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch scenarios from DB, using fallback:', err);
        // Fallback to local data
        const fallbackScenarios = Object.values(SNAKES_LADDERS_SCENARIOS).flat();
        setScenarios(fallbackScenarios);
        setError('Using offline data');
      } finally {
        setLoading(false);
      }
    };
    
    loadScenarios();
  }, []);

  const rollDice = () => {
    if (gameOver || isRolling || loading) return;
    
    setIsRolling(true);
    // Animate dice roll
    const rollInterval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
    }, 100);
    
    setTimeout(() => {
      clearInterval(rollInterval);
      const value = Math.floor(Math.random() * 6) + 1;
      setDice(value);
      setIsRolling(false);
      movePlayer(value);
    }, 1000);
  };

  const movePlayer = (diceValue) => {
    const newPos = Math.min(position + diceValue, BOARD_SIZE - 1);
    const oldPos = position;
    
    // Save move to history for undo
    setMoveHistory(prev => [...prev, { position: oldPos, score, diceValue }]);
    
    setPosition(newPos);
    
    // Check for snake/ladder
    const boardItem = boardConfig.find(item => item.from === newPos);
    
    if (boardItem) {
      // Show scenario modal
      const scenario = scenarios.find(s => s.id === boardItem.scenarioId) || 
                      scenarios[newPos % scenarios.length];
      
      if (scenario) {
        setScenarioModal({
          scenario,
          boardItem,
          newPosition: newPos
        });
      } else {
        // No scenario, just move
        handleSnakeLadder(boardItem, newPos);
      }
    } else if (newPos >= BOARD_SIZE - 1) {
      // Game won!
      setGameOver(true);
      onComplete && onComplete({ 
        points: score + 50, 
        badge: 'Constitutional Champion',
        completed_module: null
      });
    }
  };

  const handleSnakeLadder = (boardItem, currentPos) => {
    const translation = getTranslation(boardItem.scenario?.translations || {}, language);
    const isLadder = boardItem.type === 'ladder';
    const pointsDelta = isLadder ? 10 : -5;
    
    setScore(prev => Math.max(0, prev + pointsDelta));
    
    // Animate movement
    setTimeout(() => {
      setPosition(boardItem.to);
      
      if (isLadder) {
        // Confetti effect (visual feedback)
        // You can add a confetti library here if desired
      }
      
      if (boardItem.to >= BOARD_SIZE - 1) {
        setGameOver(true);
        onComplete && onComplete({ 
          points: score + pointsDelta + 50, 
          badge: 'Constitutional Champion',
          completed_module: null
        });
      }
    }, 500);
  };

  const handleScenarioAnswer = (isCorrect) => {
    const { boardItem, newPosition } = scenarioModal;
    const isLadder = boardItem.type === 'ladder';
    
    if (isCorrect && isLadder) {
      handleSnakeLadder(boardItem, newPosition);
    } else if (!isCorrect && !isLadder) {
      // Wrong answer on snake - move down
      handleSnakeLadder(boardItem, newPosition);
    } else {
      // Correct on snake or wrong on ladder - no movement
      const pointsDelta = isCorrect ? 5 : -2;
      setScore(prev => Math.max(0, prev + pointsDelta));
    }
    
    setScenarioModal(null);
  };

  const undoLastMove = () => {
    if (moveHistory.length === 0) return;
    const lastMove = moveHistory[moveHistory.length - 1];
    setPosition(lastMove.position);
    setScore(lastMove.score);
    setMoveHistory(prev => prev.slice(0, -1));
  };

  const resetGame = () => {
    setPosition(0);
    setScore(0);
    setDice(null);
    setScenarioModal(null);
    setGameOver(false);
    setMoveHistory([]);
  };

  const getCellContent = (index) => {
    const item = boardConfig.find(i => i.from === index || i.to === index);
    if (!item) return null;
    
    if (item.from === index) {
      return item.type === 'ladder' ? '🪜' : '🐍';
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 text-center transition-colors">
        <div className="animate-pulse text-gray-800 dark:text-gray-200">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 transition-colors">
      <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        {language === 'en' ? 'Constitutional Snakes & Ladders' : 'संवैधानिक साँप और सीढ़ियाँ'}
      </h3>

      {/* Game Stats */}
      <div className="flex justify-between items-center mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded transition-colors">
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'en' ? 'Position:' : 'स्थिति:'} </span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{position} / {BOARD_SIZE - 1}</span>
        </div>
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'en' ? 'Score:' : 'स्कोर:'} </span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{score}</span>
        </div>
        {moveHistory.length > 0 && (
          <button
            onClick={undoLastMove}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            {language === 'en' ? 'Undo' : 'पूर्ववत'}
          </button>
        )}
      </div>

      {/* Game Board */}
      <div className="relative mb-4 bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg">
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: BOARD_SIZE }).map((_, index) => {
            const { row, col } = getCellPosition(index);
            const cellIndex = row * COLS + (row % 2 === 0 ? col : COLS - 1 - col);
            const isActive = cellIndex === position;
            const cellContent = getCellContent(cellIndex);
            
            return (
              <div
                key={cellIndex}
                className={`
                  aspect-square border-2 rounded flex items-center justify-center text-xs font-semibold
                  ${isActive ? 'bg-indigo-500 text-white border-indigo-700' : 'bg-white border-gray-300'}
                  ${cellIndex === BOARD_SIZE - 1 ? 'bg-green-500 text-white' : ''}
                  relative
                `}
                title={cellIndex === BOARD_SIZE - 1 ? (language === 'en' ? 'Finish!' : 'समाप्त!') : `Cell ${cellIndex + 1}`}
              >
                <span>{cellIndex + 1}</span>
                {cellContent && (
                  <span className="absolute top-0 right-0 text-lg">{cellContent}</span>
                )}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-indigo-500 rounded flex items-center justify-center"
                  >
                    <span className="text-white text-lg">🎯</span>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dice */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={rollDice}
          disabled={gameOver || isRolling}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isRolling ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-2xl"
            >
              🎲
            </motion.div>
          ) : (
            <>
              <span className="text-2xl">🎲</span>
              <span>{language === 'en' ? 'Roll Dice' : 'पासा फेंकें'}</span>
            </>
          )}
        </button>
        {dice && !isRolling && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-4xl"
          >
            {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice - 1]}
          </motion.div>
        )}
      </div>

      {/* Scenario Modal */}
      <AnimatePresence>
        {scenarioModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setScenarioModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-lg font-bold mb-3">
                {scenarioModal.boardItem.type === 'ladder' 
                  ? (language === 'en' ? '🪜 Ladder Challenge!' : '🪜 सीढ़ी चुनौती!')
                  : (language === 'en' ? '🐍 Snake Challenge!' : '🐍 साँप चुनौती!')}
              </h4>
              
              <ScenarioQuestion
                scenario={scenarioModal.scenario}
                language={language}
                onAnswer={handleScenarioAnswer}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      {gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-green-50 rounded text-center"
        >
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-lg font-bold mb-2">
            {language === 'en' ? 'You finished!' : 'आपने पूरा किया!'}
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {language === 'en' ? 'Play Again' : 'फिर से खेलें'}
          </button>
        </motion.div>
      )}

      {error && (
        <div className="mt-2 text-sm text-yellow-600">{error}</div>
      )}
    </div>
  );
};

// Scenario Question Component
const ScenarioQuestion = ({ scenario, language, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const translation = getTranslation(scenario.translations || {}, language);
  const options = translation.options || [];
  const correctAnswer = scenario.correctAnswer;

  const handleSubmit = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === correctAnswer;
    setShowFeedback(true);
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 2000);
  };

  return (
    <div>
      <p className="mb-4 text-gray-700 dark:text-gray-300">{translation.story || translation.concept}</p>
      
      <div className="space-y-2 mb-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => !showFeedback && setSelectedOption(opt.id)}
            disabled={showFeedback}
            className={`
              w-full p-3 rounded text-left transition-all
              ${selectedOption === opt.id 
                ? 'bg-indigo-100 border-2 border-indigo-500' 
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
              ${showFeedback && opt.id === correctAnswer ? 'bg-green-100 border-green-500' : ''}
              ${showFeedback && selectedOption === opt.id && opt.id !== correctAnswer ? 'bg-red-100 border-red-500' : ''}
            `}
          >
            {opt.text}
          </button>
        ))}
      </div>

      {!showFeedback ? (
        <button
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {language === 'en' ? 'Submit Answer' : 'उत्तर जमा करें'}
        </button>
      ) : (
        <div className={`p-3 rounded ${selectedOption === correctAnswer ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className="font-semibold">
            {selectedOption === correctAnswer
              ? (language === 'en' ? '✓ Correct!' : '✓ सही!')
              : (language === 'en' ? '✗ Incorrect' : '✗ गलत')}
          </p>
          <p className="text-sm mt-2">
            {selectedOption === correctAnswer ? translation.feedbackCorrect : translation.feedbackIncorrect}
          </p>
        </div>
      )}
    </div>
  );
};

export default SnakesLadders;
