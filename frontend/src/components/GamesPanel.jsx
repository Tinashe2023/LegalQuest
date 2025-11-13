// src/components/GamesPanel.jsx
import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import SnakesLadders from './SnakesLadders';
import ScenarioSnap from './ScenarioSnap';
import WheelOfRights from './WheelOfRights';
import WritQuest from './WritQuest';
import { FUNDAMENTAL_RIGHTS } from '../data/fundamentalRightsData';

const GamesPanel = ({ language='en', onProgress, setCurrentView, darkMode, setDarkMode }) => {
  const [selected, setSelected] = useState(null);

  const games = [
    { id: 'snakes', label: language === 'en' ? 'Snakes & Ladders' : 'साँप और सीढ़ियाँ', comp: <SnakesLadders language={language} darkMode={darkMode} onComplete={(r)=>onProgress && onProgress(r)} /> },
    { id: 'snap', label: language === 'en' ? 'Scenario Snap' : 'परिदृश्य स्नैप', comp: <ScenarioSnap language={language} darkMode={darkMode} onComplete={(r)=>onProgress && onProgress(r)} /> },
    { id: 'wheel', label: language === 'en' ? 'Wheel of Rights' : 'अधिकार पहिया', comp: <WheelOfRights language={language} darkMode={darkMode} onComplete={(r)=>onProgress && onProgress(r)} /> },
    { id: 'writ', label: language === 'en' ? 'Writ Quest' : 'राइट क्वेस्ट', comp: <WritQuest language={language} darkMode={darkMode} onComplete={(r)=>onProgress && onProgress(r)} /> }
  ];

  return (
    <div className="p-4 min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView ? setCurrentView('home') : window.history.back()}
            className="px-3 py-1 rounded bg-slate-200 dark:bg-gray-700 hover:bg-slate-300 dark:hover:bg-gray-600 text-sm font-semibold text-slate-800 dark:text-gray-100 transition-colors"
            aria-label="Back"
          >
            ← {language === 'en' ? 'Back' : 'वापस'}
          </button>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-gray-100 tracking-tight">{language === 'en' ? 'Games' : 'खेल'}</h2>
        </div>
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          )}
          <div className="text-sm font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide">{language === 'en' ? 'Play & Learn' : 'खेलें और सीखें'}</div>
        </div>
      </div>
      {!selected && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {games.map(g => (
            <button 
              key={g.id} 
              onClick={() => setSelected(g.id)} 
              className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-700 text-left hover:shadow-xl dark:hover:shadow-gray-600 transition-all border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/40"
            >
              <div className="font-bold text-slate-900 dark:text-gray-100 text-lg">{g.label}</div>
              <div className="text-sm text-slate-600 dark:text-gray-400 mt-1 uppercase tracking-wide">{g.id}</div>
            </button>
          ))}
        </div>
      )}

      <div>
        {selected ? (
          <>
            <button 
              onClick={() => setSelected(null)} 
              className="mb-4 px-3 py-1 bg-indigo-600 dark:bg-indigo-700 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              {language === 'en' ? 'Back to Games' : 'खेलों पर वापस'}
            </button>
            <div>{games.find(g => g.id === selected)?.comp}</div>
          </>
        ) : (
          <div className="text-base font-semibold text-slate-700 dark:text-gray-300">{language === 'en' ? 'Choose a game to play' : 'खेल चुनें'}</div>
        )}
      </div>
    </div>
  );
};

export default GamesPanel;
