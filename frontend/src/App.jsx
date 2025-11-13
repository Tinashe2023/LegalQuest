import React, { useState, useEffect } from 'react';
import { Trophy, BookOpen, Award, Star, ChevronRight, CheckCircle, XCircle, Home, User, Globe, Plus, Edit, Trash2, Save, Moon, Sun } from 'lucide-react';
import GamesPanel from './components/GamesPanel';
import BannerSlider from './components/shared/BannerSlider';
import Footer from './components/shared/Footer';

const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  hi: { name: 'हिन्दी', flag: '🇮🇳' },
  ta: { name: 'தமிழ்', flag: '🇮🇳' }
};

const AuthModal = ({ mode, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (mode === 'register') {
      if (formData.username.length < 3) {
        setError('Username must be at least 3 characters');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      // You could add more complex regex checks here for numbers, etc.
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (mode === 'register') {
        setFormData({ username: '', email: '', password: '' });
        setSuccess('Registration successful! Please check your email to verify your account.');
        setTimeout(() => {
          onClose('login');
        }, 3000);
      } else {
        localStorage.setItem('token', data.token);
        onSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
      // Show resend verification option if email not verified
      if (err.message.includes('verify your email')) {
        setShowResendVerification(true);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      setSuccess(data.message);
      setShowForgotPassword(false);
    } catch (err) {
      setError('Failed to send reset email');
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      setSuccess(data.message);
      setShowResendVerification(false);
    } catch (err) {
      setError('Failed to resend verification email');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-indigo-900 mb-6">
          {showForgotPassword ? 'Reset Password' : mode === 'login' ? 'Welcome Back!' : 'Join LegalQuest'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {showForgotPassword ? (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 border rounded-lg"
              required
            />
            <button
              onClick={handleForgotPassword}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Send Reset Link
            </button>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-3 text-indigo-600 font-semibold"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                  required
                />
              )}
              
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
              >
                {mode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            {mode === 'login' && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-indigo-600 text-sm hover:underline"
                >
                  Forgot Password?
                </button>
                
                {showResendVerification && (
                  <button
                    onClick={handleResendVerification}
                    className="block text-indigo-600 text-sm hover:underline"
                  >
                    Resend Verification Email
                  </button>
                )}
              </div>
            )}

            <p className="text-center mt-4 text-gray-600">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => onClose(mode === 'login' ? 'register' : 'login')}
                className="text-indigo-600 font-semibold"
              >
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
const PasswordResetForm = ({ token, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccess(data.message);
      setTimeout(() => {
        onSuccess();
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-indigo-900 mb-6">Reset Password</h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to false
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showAdmin, setShowAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [database, setDatabase] = useState({ modules: [], scenarios: [] });
 
  const [userProgress, setUserProgress] = useState({
    points: 0,
    badges: [],
    completedModules: {},
    myRights: []
  });
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const path = window.location.pathname; // This is fine, not an API URL

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/modules`)
      .then(res => res.json())
      .then(data => {
        setDatabase({
          modules: data.modules,
          scenarios: data.scenarios
        });
        
      })
      .catch(err => {
        console.error('Failed to fetch modules:', err);
        
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          fetchUserProgress(token);
        }
      })
      .catch(err => {
        console.error('Auth error:', err);
        localStorage.removeItem('token');
        setShowLogin(true);
      });
    } else {
      setShowLogin(true);
    }
  }, []);
  
  // Add this function after fetchUserProgress
  const saveUserProgress = async (progressData) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };
  
  
  useEffect(() => {
    // Make this useEffect ONLY handle email verification
    if (token && path.includes('/verify-email')) { 
      fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-email/${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem('token', data.token);
            setUser(data.user);
            alert('Email verified successfully! Welcome to LegalQuest!');
            fetchUserProgress(data.token);
            // Clear URL params
            window.history.replaceState({}, document.title, '/'); 
          }
        })
        .catch(err => {
          alert('Verification failed. Please try again.');
          window.history.replaceState({}, document.title, '/'); // Also clear on fail
        });
    }
  }, [token, path]); // Add dependencies

  useEffect(() => {
    const onPop = (e) => {
      // if no state, fallback to hash-based or default to 'home'
      const state = e.state || (window.location.hash ? { view: window.location.hash.replace('#','') } : null);
      if (state && state.view) {
        setCurrentView(state.view);
      } else {
        // if user used back to leave #games, go to home
        setCurrentView('home');
      }
    };

    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Apply dark mode class to document root
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (path.includes('/reset-password') && token) {
    return (
      <PasswordResetForm 
        token={token} 
        onSuccess={() => {
          alert('Password reset successfully! Please log in.');
          // On success, redirect to the home page (which will show the login modal)
          window.location.href = '/'; 
        }} 
      />
    );
  }


  const fetchUserProgress = (token) => {
 fetch(`${import.meta.env.VITE_API_URL}/api/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      setUserProgress({
        points: data.points || 0,
        badges: data.badges || [],
        completedModules: data.completed_modules || {},
        myRights: data.learned_concepts || []
      });
    })
    .catch(err => console.error('Progress fetch error:', err));
  };

  const getTranslation = (translationsObj) => {
    return translationsObj[language] || translationsObj['en'];
  };

  const getCurrentModule = () => {
    return database.modules.find(m => m.id === selectedModule);
  };

  const getCurrentScenarioData = () => {
    const module = getCurrentModule();
    if (!module) return null;
    const scenarioId = module.scenarios[currentScenario];
    return database.scenarios.find(s => s.id === scenarioId);
  };

  const handleModuleSelect = (moduleId) => {
    setSelectedModule(moduleId);
    setCurrentScenario(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setCurrentView('learn');
  };

  const handleAnswerSelect = (optionId) => {
    if (showFeedback) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const scenario = getCurrentScenarioData();
    const isCorrect = selectedAnswer === scenario.correctAnswer;
    
    setShowFeedback(true);
    
    if (isCorrect) {
      const translation = getTranslation(scenario.translations);
      const newProgress = {
        ...userProgress,
        points: userProgress.points + 10,
        myRights: [...new Set([...userProgress.myRights, translation.concept])]
      };
      
      setUserProgress(newProgress);
      
      // 💾 Save to database
      saveUserProgress({
        points: newProgress.points,
        badges: newProgress.badges,
        completed_modules: newProgress.completedModules,
        learned_concepts: newProgress.myRights
      });
    }
  };

  const handleNextScenario = () => {
    const module = getCurrentModule();
    
    if (currentScenario < module.scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      const translation = getTranslation(module.translations);
      if (!userProgress.badges.includes(translation.badge)) {
        const newProgress = {
          ...userProgress,
          badges: [...userProgress.badges, translation.badge],
          points: userProgress.points + 50,
          completedModules: {
            ...userProgress.completedModules,
            [selectedModule]: true
          }
        };
        
        setUserProgress(newProgress);
        
        // 💾 Save to database
        saveUserProgress({
          points: newProgress.points,
          badges: newProgress.badges,
          completed_modules: newProgress.completedModules,
          learned_concepts: newProgress.myRights
        });
      }
      setCurrentView('complete');
    }
  };

  const AdminPanel = () => {
    const [newModuleForm, setNewModuleForm] = useState({
      id: '',
      icon: '📚',
      en_title: '',
      en_description: '',
      en_badge: ''
    });

    const handleAddModule = async () => {
      const newModule = {
        id: newModuleForm.id,
        icon: newModuleForm.icon,
        translations: {
          en: {
            title: newModuleForm.en_title,
            description: newModuleForm.en_description,
            badge: newModuleForm.en_badge
          }
        }
      };
    
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/modules`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newModule)
        });
    
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add module');
        }
    
        // Refresh modules from database
        const modulesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/modules`);
        const modulesData = await modulesRes.json();
        setDatabase({
          modules: modulesData.modules,
          scenarios: modulesData.scenarios
        });
    
        // Clear form
        setNewModuleForm({
          id: '',
          icon: '📚',
          en_title: '',
          en_description: '',
          en_badge: ''
        });
    
        alert('Module added successfully!');
    
      } catch (err) {
        console.error('Failed to add module:', err);
        alert(`Error: ${err.message}`);
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Admin Panel - Content Management</h1>
            <button
              onClick={() => setShowAdmin(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to App
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Plus className="w-6 h-6 mr-2 text-green-600" />
              Add New Module
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Module ID (e.g., 'rti')"
                value={newModuleForm.id}
                onChange={(e) => setNewModuleForm({...newModuleForm, id: e.target.value})}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Icon (emoji)"
                value={newModuleForm.icon}
                onChange={(e) => setNewModuleForm({...newModuleForm, icon: e.target.value})}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Title (English)"
                value={newModuleForm.en_title}
                onChange={(e) => setNewModuleForm({...newModuleForm, en_title: e.target.value})}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Badge Name (English)"
                value={newModuleForm.en_badge}
                onChange={(e) => setNewModuleForm({...newModuleForm, en_badge: e.target.value})}
                className="p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Description (English)"
                value={newModuleForm.en_description}
                onChange={(e) => setNewModuleForm({...newModuleForm, en_description: e.target.value})}
                className="p-2 border rounded col-span-2"
              />
              <button
                onClick={handleAddModule}
                disabled={!newModuleForm.id || !newModuleForm.en_title}
                className="col-span-2 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
              >
                Add Module
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Existing Modules</h2>
            <div className="space-y-4">
              {database.modules.map(module => {
                const trans = getTranslation(module.translations);
                return (
                  <div key={module.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{module.icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-800">{trans.title}</h3>
                          <p className="text-sm text-gray-600">{trans.description}</p>
                          <p className="text-xs text-indigo-600 mt-1">
                            {module.scenarios.length} scenarios • Badge: {trans.badge}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HomeView = () => (
    <div className={`min-h-screen flex flex-col transition-colors ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-900 text-white'}`}>
      <header className="relative flex flex-col flex-1">
        <div className="absolute inset-0">
          <BannerSlider 
            slides={[]} 
            autoplayInterval={5000}
            showControls={true}
            fullBleed
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <nav className="flex items-center justify-between px-6 lg:px-12 py-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-lg">LegalQuest</h1>
              <p className="text-sm lg:text-base font-medium text-slate-100/90 drop-shadow">
                Learn Your Rights Through Play
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shadow"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-300" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-100" />
                )}
              </button>

              <div className="flex items-center gap-2 bg-white/15 px-4 py-2 rounded-lg shadow backdrop-blur">
                <User className="w-5 h-5 text-white/90" />
                <span className="font-semibold">{user?.username}</span>
              </div>

              <button
                onClick={() => { window.history.pushState({ view: 'games' }, '', '#games'); setCurrentView('games'); setSelectedModule(null); }}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg shadow transition-colors">
                {language === 'en' ? 'Games' : 'खेल'}
              </button>

              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-lg shadow transition-colors">
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                  setShowLogin(true);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-lg shadow transition-colors">
                Logout
              </button>
            </div>
          </nav>

          <div className="flex-1 flex items-center">
            <div className="px-6 lg:px-12 pb-20 max-w-4xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
                Discover Your Legal Adventure
              </h2>
              <p className="mt-5 text-lg md:text-xl text-slate-100/90 max-w-3xl drop-shadow">
                Travel through interactive stories, master your rights, and collect badges as you defend justice in everyday situations across India.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setCurrentView('games');
                    window.history.pushState({ view: 'games' }, '', '#games');
                  }}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-full shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  Start Playing
                </button>
                <button
                  onClick={() => {
                    const moduleSection = document.getElementById('modules-section');
                    if (moduleSection) {
                      moduleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-full shadow-lg transition-transform hover:-translate-y-0.5 backdrop-blur"
                >
                  Explore Modules
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={`flex-1 ${darkMode ? 'bg-gray-950 text-gray-100' : 'bg-slate-50 text-slate-900'}`}>
        <div className="max-w-6xl mx-auto px-6 lg:px-12 -mt-16 relative z-20 pb-16 space-y-10">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-gray-800/60 p-6 lg:p-8 transition-colors">
            <div className="flex items-center justify-between flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span className="font-semibold text-slate-800 dark:text-gray-200 uppercase tracking-wide text-xs">Language</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(LANGUAGES).map(([code, lang]) => (
                  <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={`px-4 py-2 rounded-full font-semibold transition-all ${
                      language === code
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-gray-800/60 p-6 lg:p-8 transition-colors">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-indigo-50 dark:bg-indigo-900/40 rounded-xl py-6 shadow-inner">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-yellow-500 dark:text-yellow-300 mr-2" />
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{userProgress.points}</span>
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide">Points</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/40 rounded-xl py-6 shadow-inner">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-purple-500 dark:text-purple-300 mr-2" />
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{userProgress.badges.length}</span>
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide">Badges</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/40 rounded-xl py-6 shadow-inner">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-blue-500 dark:text-blue-300 mr-2" />
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{userProgress.myRights.length}</span>
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wide">Rights Learned</p>
              </div>
            </div>
          </div>

          <section id="modules-section">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">Choose a Module</h2>
            <div className="grid gap-6">
              {database.modules.map(module => {
                const isCompleted = userProgress.completedModules[module.id];
                const progress = isCompleted ? 100 : 0;
                const translation = getTranslation(module.translations);
                
                return (
                  <div
                    key={module.id}
                    onClick={() => handleModuleSelect(module.id)}
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg dark:shadow-gray-800/60 p-6 cursor-pointer hover:shadow-2xl dark:hover:shadow-gray-700 transition-all hover:-translate-y-1"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="text-5xl">{module.icon}</div>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            {translation.title}
                            {isCompleted && <CheckCircle className="w-6 h-6 text-green-500 dark:text-green-300" />}
                          </h3>
                          <p className="text-slate-600 dark:text-gray-300 mt-1">{translation.description}</p>
                          <p className="text-indigo-600 dark:text-indigo-300 text-sm mt-2 font-semibold">🏆 Earn: {translation.badge}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-7 h-7 text-indigo-400 dark:text-indigo-300 flex-shrink-0" />
                    </div>
                    
                    <div className="mt-6 bg-slate-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-indigo-500 dark:bg-indigo-400 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          
          {userProgress.myRights.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-gray-800/60 p-6 lg:p-8 transition-colors">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-300" />
                My Rights Handbook
              </h3>
              <div className="flex flex-wrap gap-3">
                {userProgress.myRights.map((right, idx) => (
                  <span key={idx} className="bg-indigo-500/10 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200 px-4 py-2 rounded-full text-sm font-semibold">
                    {right}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer language={language} darkMode={darkMode} />
    </div>
  );

  const LearnView = () => {
    const module = getCurrentModule();
    const scenario = getCurrentScenarioData();
    
    if (!module || !scenario) return null;

    const moduleTranslation = getTranslation(module.translations);
    const scenarioTranslation = getTranslation(scenario.translations);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </button>
            <div className="text-sm text-indigo-600 font-semibold">
              {currentScenario + 1} / {module.scenarios.length}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">{module.icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{moduleTranslation.title}</h2>
                <p className="text-indigo-600 text-sm">Learning: {scenarioTranslation.concept}</p>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700 leading-relaxed">{scenarioTranslation.explanation}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">📖 Scenario:</h3>
              <p className="text-gray-700 leading-relaxed">{scenarioTranslation.story}</p>
            </div>

            <div className="space-y-3 mb-6">
              {scenarioTranslation.options.map(option => {
                const isSelected = selectedAnswer === option.id;
                const showCorrect = showFeedback && option.id === scenario.correctAnswer;
                const showIncorrect = showFeedback && isSelected && option.id !== scenario.correctAnswer;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(option.id)}
                    disabled={showFeedback}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      showCorrect
                        ? 'bg-green-100 border-2 border-green-500'
                        : showIncorrect
                        ? 'bg-red-100 border-2 border-red-500'
                        : isSelected
                        ? 'bg-indigo-100 border-2 border-indigo-500'
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-indigo-300'
                    } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{option.text}</span>
                      {showCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                      {showIncorrect && <XCircle className="w-6 h-6 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className={`rounded-xl p-6 mb-6 ${selectedAnswer === scenario.correctAnswer ? 'bg-green-50' : 'bg-orange-50'}`}>
                <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                  {selectedAnswer === scenario.correctAnswer ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      Well Done! +10 Points
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-orange-600 mr-2" />
                      Not Quite
                    </>
                  )}
                </h4>
                <p className="text-gray-700">
                  {selectedAnswer === scenario.correctAnswer ? scenarioTranslation.feedbackCorrect : scenarioTranslation.feedbackIncorrect}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {!showFeedback ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    selectedAnswer
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextScenario}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center"
                >
                  {currentScenario < module.scenarios.length - 1 ? 'Next Scenario' : 'Complete Module'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CompleteView = () => {
    const module = getCurrentModule();
    const moduleTranslation = getTranslation(module.translations);
    const isNewBadge = userProgress.badges[userProgress.badges.length - 1] === moduleTranslation.badge;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Module Complete!</h2>
            <p className="text-xl text-gray-600 mb-8">
              You've mastered {moduleTranslation.title}
            </p>

            {isNewBadge && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 mb-8">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">New Badge Earned!</h3>
                <p className="text-3xl font-bold text-indigo-600">{moduleTranslation.badge}</p>
                <p className="text-green-600 font-semibold mt-4">+50 Bonus Points!</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-indigo-50 rounded-xl p-6">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800">{userProgress.points}</p>
                <p className="text-gray-600 text-sm">Total Points</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800">{userProgress.badges.length}</p>
                <p className="text-gray-600 text-sm">Badges Earned</p>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('home')}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all text-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showLogin && (
        <AuthModal 
          mode={authMode} 
          onClose={(newMode) => setAuthMode(newMode)}
          onSuccess={(userData) => {
            setUser(userData);
            setShowLogin(false);
            const token = localStorage.getItem('token');
            fetchUserProgress(token);
          }}
        />
      )}
      
      {!showLogin && (
        <>
          {showAdmin && user?.role === 'admin' ? (
            <AdminPanel />
          ) : (
            <>
              {currentView === 'home' && <HomeView />}
              {currentView === 'learn' && <LearnView />}
              {currentView === 'complete' && <CompleteView />}
              
              {/* Games view */}
              {currentView === 'games' && (
                <div className="min-h-screen flex flex-col">
                  <div className="max-w-4xl mx-auto p-6 flex-1">
                    <GamesPanel
                      language={language}
                      onProgress={(result) => {
                        // update progress state defensively
                        setUserProgress(prev => {
                          const newBadges = new Set([...(prev.badges || []), ...(result.badge ? [result.badge] : [])].filter(Boolean));
                          const newPoints = (prev.points || 0) + (result.points || 0);
                          const updated = { ...prev, points: newPoints, badges: Array.from(newBadges) };
                          // Save to server if user logged in
                          saveUserProgress({
                            points: updated.points,
                            badges: updated.badges,
                            completed_modules: updated.completedModules,
                            learned_concepts: updated.myRights
                          });
                          return updated;
                        });
                      }}
                    setCurrentView={setCurrentView}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                  />
                  </div>
                  <Footer language={language} darkMode={darkMode} />
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default App;