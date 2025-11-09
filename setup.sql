-- Drop and recreate database (safe for development)
DROP DATABASE IF EXISTS legal_quest;
CREATE DATABASE legal_quest;

-- Connect to the new database
\c legal_quest

-- Optional: Drop tables if they exist (prevents errors on re-run)
DROP TABLE IF EXISTS user_progress, scenario_options, scenario_translations, scenarios, module_translations, modules, users CASCADE;

-- Create tables
CREATE TABLE modules (
  id VARCHAR(50) PRIMARY KEY,
  icon VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE module_translations (
  id SERIAL PRIMARY KEY,
  module_id VARCHAR(50) REFERENCES modules(id) ON DELETE CASCADE,
  language_code VARCHAR(5),
  title VARCHAR(200),
  description TEXT,
  badge_name VARCHAR(100),
  UNIQUE(module_id, language_code)
);

CREATE TABLE scenarios (
  id VARCHAR(50) PRIMARY KEY,
  module_id VARCHAR(50) REFERENCES modules(id) ON DELETE CASCADE,
  correct_answer VARCHAR(5),
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scenario_translations (
  id SERIAL PRIMARY KEY,
  scenario_id VARCHAR(50) REFERENCES scenarios(id) ON DELETE CASCADE,
  language_code VARCHAR(5),
  concept VARCHAR(200),
  explanation TEXT,
  story TEXT,
  feedback_correct TEXT,
  feedback_incorrect TEXT,
  UNIQUE(scenario_id, language_code)
);

CREATE TABLE scenario_options (
  id SERIAL PRIMARY KEY,
  scenario_id VARCHAR(50) REFERENCES scenarios(id) ON DELETE CASCADE,
  option_id VARCHAR(5),
  language_code VARCHAR(5),
  option_text TEXT,
  UNIQUE(scenario_id, option_id, language_code)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]',
  completed_modules JSONB DEFAULT '{}',
  learned_concepts JSONB DEFAULT '[]'
);