import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllScenarios, getTranslation } from '../utils/api';
import { SNAKES_LADDERS_SCENARIOS } from '../data/fundamentalRightsData';

const BOARD_SIZE = 100;
const ROWS = 10;
const COLS = 10;

// Get cell position (row, col) from index
const getCellPosition = (index) => {
  const row = Math.floor(index / COLS);
  const col = row % 2 === 0 ? index % COLS : COLS - 1 - (index % COLS);
  return { row: ROWS - 1 - row, col }; // Flip vertically so 1 is at bottom
};

// Get pixel coordinates for a cell center
const getCellCoordinates = (index, cellSize) => {
  const { row, col } = getCellPosition(index);
  return {
    x: col * cellSize + cellSize / 2,
    y: row * cellSize + cellSize / 2
  };
};

// Extended board config with longer snakes and ladders
const DEFAULT_BOARD_CONFIG = [
  { from: 4, to: 14, type: 'ladder', scenarioId: null },
  { from: 9, to: 31, type: 'ladder', scenarioId: null },
  { from: 17, to: 7, type: 'snake', scenarioId: null },
  { from: 20, to: 38, type: 'ladder', scenarioId: null },
  { from: 28, to: 84, type: 'ladder', scenarioId: null },
  { from: 40, to: 59, type: 'ladder', scenarioId: null },
  { from: 51, to: 67, type: 'ladder', scenarioId: null },
  { from: 54, to: 34, type: 'snake', scenarioId: null },
  { from: 62, to: 19, type: 'snake', scenarioId: null },
  { from: 64, to: 60, type: 'snake', scenarioId: null },
  { from: 71, to: 91, type: 'ladder', scenarioId: null },
  { from: 87, to: 24, type: 'snake', scenarioId: null },
  { from: 93, to: 73, type: 'snake', scenarioId: null },
  { from: 95, to: 75, type: 'snake', scenarioId: null },
  { from: 99, to: 78, type: 'snake', scenarioId: null },
];

// Generate path for snake (wavy, curved)
const generateSnakePath = (from, to, cellSize) => {
  const start = getCellCoordinates(from, cellSize);
  const end = getCellCoordinates(to, cellSize);
  
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Create multiple curve points for wavy snake
  const segments = Math.max(3, Math.floor(distance / 100));
  let path = `M ${start.x} ${start.y}`;
  
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const t_prev = (i - 1) / segments;
    
    const x = start.x + dx * t;
    const y = start.y + dy * t;
    const x_prev = start.x + dx * t_prev;
    const y_prev = start.y + dy * t_prev;
    
    // Add wave effect
    const waveAmplitude = 20;
    const wave = Math.sin(t * Math.PI * 2) * waveAmplitude;
    
    const perpX = -dy / distance * wave;
    const perpY = dx / distance * wave;
    
    const cp1x = x_prev + perpX;
    const cp1y = y_prev + perpY;
    const cp2x = x + perpX;
    const cp2y = y + perpY;
    
    path += ` Q ${cp1x} ${cp1y}, ${x + perpX * 0.5} ${y + perpY * 0.5}`;
  }
  
  return path;
};

// Generate ladder elements
const generateLadderElements = (from, to, cellSize) => {
  const start = getCellCoordinates(from, cellSize);
  const end = getCellCoordinates(to, cellSize);
  
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  const offset = 6;
  const perpX = (-dy / distance) * offset;
  const perpY = (dx / distance) * offset;
  
  const numRungs = Math.max(4, Math.floor(distance / 30));
  
  return {
    left: { x1: start.x + perpX, y1: start.y + perpY, x2: end.x + perpX, y2: end.y + perpY },
    right: { x1: start.x - perpX, y1: start.y - perpY, x2: end.x - perpX, y2: end.y - perpY },
    rungs: Array.from({ length: numRungs }).map((_, i) => {
      const t = (i + 1) / (numRungs + 1);
      const x = start.x + dx * t;
      const y = start.y + dy * t;
      return { x1: x + perpX, y1: y + perpY, x2: x - perpX, y2: y - perpY };
    })
  };
};

const SnakesLadders = ({ language = 'en', onComplete }) => {
  const [position, setPosition] = useState(1);
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
  const cellSize = 60;

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
    const newPos = Math.min(position + diceValue, 100);
    const oldPos = position;
    
    setMoveHistory(prev => [...prev, { position: oldPos, score, diceValue }]);
    setPosition(newPos);
    
    const boardItem = boardConfig.find(item => item.from === newPos);
    
    if (boardItem) {
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
    } else if (newPos >= 100) {
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
    
    setTimeout(() => {
      setPosition(boardItem.to);
      
      if (boardItem.to >= 100) {
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
      handleSnakeLadder(boardItem, newPosition);
    } else {
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
    setPosition(1);
    setScore(0);
    setDice(null);
    setScenarioModal(null);
    setGameOver(false);
    setMoveHistory([]);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded shadow dark:shadow-gray-700 text-center transition-colors">
        <div className="animate-pulse text-gray-800 dark:text-gray-200">
          {language === 'en' ? 'Loading game...' : 'गेम लोड हो रहा है...'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
          {language === 'en' ? 'Constitutional Snakes & Ladders' : 'संवैधानिक साँप और सीढ़ियाँ'}
        </h3>

        {/* Game Stats */}
        <div className="flex justify-between items-center mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'en' ? 'Position:' : 'स्थिति:'}{' '}
            </span>
            <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">{position}</span>
            <span className="text-gray-500 dark:text-gray-400"> / 100</span>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {language === 'en' ? 'Score:' : 'स्कोर:'}{' '}
            </span>
            <span className="font-bold text-xl text-green-600 dark:text-green-400">{score}</span>
          </div>
          {moveHistory.length > 0 && (
            <button
              onClick={undoLastMove}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm text-gray-800 dark:text-gray-200 transition-colors"
            >
              {language === 'en' ? 'Undo' : 'पूर्ववत'}
            </button>
          )}
        </div>

        {/* Game Board */}
        <div className="relative mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg overflow-hidden transition-colors">
          <svg 
            width="100%" 
            height="100%"
            viewBox={`0 0 ${COLS * cellSize} ${ROWS * cellSize}`}
            className="w-full"
            style={{ maxWidth: '700px', margin: '0 auto', display: 'block' }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3"/>
              </filter>
            </defs>

            {/* Draw cells FIRST (background layer) */}
            {Array.from({ length: 100 }).map((_, index) => {
              const cellNumber = index + 1;
              const { row, col } = getCellPosition(cellNumber);
              const x = col * cellSize;
              const y = row * cellSize;
              const isActive = cellNumber === position;
              
              return (
                <g key={cellNumber}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={cellNumber === 100 ? '#10b981' : isActive ? '#6366f1' : (Math.floor(index / 10) + (index % 10)) % 2 === 0 ? '#f9fafb' : '#e5e7eb'}
                    stroke="#d1d5db"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 4}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fontWeight="600"
                    fill={isActive ? '#fff' : cellNumber === 100 ? '#fff' : '#374151'}
                  >
                    {cellNumber}
                  </text>
                </g>
              );
            })}

            {/* Draw snakes and ladders SECOND (foreground layer) */}
            <g className="snakes-ladders-layer">
              {boardConfig.map((item, idx) => {
                if (item.type === 'snake') {
                  const path = generateSnakePath(item.from, item.to, cellSize);
                  const head = getCellCoordinates(item.from, cellSize);
                  const tail = getCellCoordinates(item.to, cellSize);
                  
                  return (
                    <g key={`snake-${idx}`}>
                      {/* Snake body shadow */}
                      <path
                        d={path}
                        stroke="#059669"
                        strokeWidth="16"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.3"
                        transform="translate(2, 2)"
                      />
                      {/* Snake body main */}
                      <path
                        d={path}
                        stroke="#10b981"
                        strokeWidth="14"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Snake body scales */}
                      <path
                        d={path}
                        stroke="#34d399"
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Snake head */}
                      <circle
                        cx={head.x}
                        cy={head.y}
                        r="12"
                        fill="#dc2626"
                        stroke="#991b1b"
                        strokeWidth="2"
                      />
                      {/* Snake eyes */}
                      <circle cx={head.x - 4} cy={head.y - 2} r="2" fill="white" />
                      <circle cx={head.x + 4} cy={head.y - 2} r="2" fill="white" />
                      {/* Snake tail */}
                      <circle
                        cx={tail.x}
                        cy={tail.y}
                        r="6"
                        fill="#10b981"
                        stroke="#059669"
                        strokeWidth="2"
                      />
                    </g>
                  );
                } else {
                  const ladder = generateLadderElements(item.from, item.to, cellSize);
                  
                  return (
                    <g key={`ladder-${idx}`}>
                      {/* Ladder shadow */}
                      <line
                        x1={ladder.left.x1 + 2}
                        y1={ladder.left.y1 + 2}
                        x2={ladder.left.x2 + 2}
                        y2={ladder.left.y2 + 2}
                        stroke="#78350f"
                        strokeWidth="6"
                        strokeLinecap="round"
                        opacity="0.3"
                      />
                      <line
                        x1={ladder.right.x1 + 2}
                        y1={ladder.right.y1 + 2}
                        x2={ladder.right.x2 + 2}
                        y2={ladder.right.y2 + 2}
                        stroke="#78350f"
                        strokeWidth="6"
                        strokeLinecap="round"
                        opacity="0.3"
                      />
                      
                      {/* Ladder sides */}
                      <line
                        x1={ladder.left.x1}
                        y1={ladder.left.y1}
                        x2={ladder.left.x2}
                        y2={ladder.left.y2}
                        stroke="#92400e"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      <line
                        x1={ladder.right.x1}
                        y1={ladder.right.y1}
                        x2={ladder.right.x2}
                        y2={ladder.right.y2}
                        stroke="#92400e"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                      
                      {/* Ladder rungs */}
                      {ladder.rungs.map((rung, i) => (
                        <line
                          key={i}
                          x1={rung.x1}
                          y1={rung.y1}
                          x2={rung.x2}
                          y2={rung.y2}
                          stroke="#92400e"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      ))}
                    </g>
                  );
                }
              })}
            </g>

            {/* Player token on TOP */}
            {position > 0 && (
              <g>
                <circle
                  cx={getCellCoordinates(position, cellSize).x}
                  cy={getCellCoordinates(position, cellSize).y}
                  r="18"
                  fill="#fbbf24"
                  stroke="#f59e0b"
                  strokeWidth="3"
                  filter="url(#shadow)"
                />
                <text
                  x={getCellCoordinates(position, cellSize).x}
                  y={getCellCoordinates(position, cellSize).y + 5}
                  textAnchor="middle"
                  fontSize="20"
                >
                  🎯
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Dice Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={rollDice}
            disabled={gameOver || isRolling || loading}
            className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform transition hover:scale-105"
          >
            {isRolling ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-3xl inline-block"
              >
                🎲
              </motion.span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-3xl">🎲</span>
                <span>{language === 'en' ? 'Roll Dice' : 'पासा फेंकें'}</span>
              </span>
            )}
          </button>
          {dice && !isRolling && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl"
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
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full shadow-2xl transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  {scenarioModal.boardItem.type === 'ladder' 
                    ? <><span className="text-4xl">🪜</span> {language === 'en' ? 'Ladder Challenge!' : 'सीढ़ी चुनौती!'}</>
                    : <><span className="text-4xl">🐍</span> {language === 'en' ? 'Snake Challenge!' : 'साँप चुनौती!'}</>}
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
            className="mt-4 p-6 bg-green-50 dark:bg-green-900/30 rounded-lg text-center shadow-lg transition-colors"
          >
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-3xl font-bold mb-4 text-green-700 dark:text-green-400">
              {language === 'en' ? 'Congratulations! You Won!' : 'बधाई हो! आपने जीत लिया!'}
            </div>
            <div className="text-xl mb-4 text-gray-700 dark:text-gray-300">
              {language === 'en' ? 'Final Score:' : 'अंतिम स्कोर:'}{' '}
              <span className="font-bold text-green-600 dark:text-green-400">{score}</span>
            </div>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow transform transition hover:scale-105"
            >
              {language === 'en' ? 'Play Again' : 'फिर से खेलें'}
            </button>
          </motion.div>
        )}

        {error && (
          <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 text-center">
            {error}
          </div>
        )}
      </div>
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
      <p className="mb-6 text-gray-700 dark:text-gray-300 text-lg">
        {translation.story || translation.concept}
      </p>
      
      <div className="space-y-3 mb-6">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => !showFeedback && setSelectedOption(opt.id)}
            disabled={showFeedback}
            className={`
              w-full p-4 rounded-lg text-left transition-all font-medium
              ${selectedOption === opt.id 
                ? 'bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500 shadow-md' 
                : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-300'
              }
              ${showFeedback && opt.id === correctAnswer ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : ''}
              ${showFeedback && selectedOption === opt.id && opt.id !== correctAnswer ? 'bg-red-100 dark:bg-red-900/50 border-red-500' : ''}
              text-gray-800 dark:text-gray-200
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
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform transition hover:scale-105"
        >
          {language === 'en' ? 'Submit Answer' : 'उत्तर जमा करें'}
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${selectedOption === correctAnswer ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-500' : 'bg-red-50 dark:bg-red-900/30 border-2 border-red-500'}`}
        >
          <p className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">
            {selectedOption === correctAnswer 
              ? (language === 'en' ? '✓ Correct!' : '✓ सही!')
              : (language === 'en' ? '✗ Incorrect' : '✗ गलत')}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {selectedOption === correctAnswer ? translation.feedbackCorrect : translation.feedbackIncorrect}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default SnakesLadders;