## Legal Quest – Project Outline

> A gamified learning platform to teach constitutional rights and remedies.


### Overview
Legal Quest combines interactive games and scenario-based quizzes to help learners understand fundamental rights, constitutional remedies, and related legal concepts. The app supports multiple languages and provides instant feedback, scoring, and badges.


### Tech Stack
- **Frontend**
  - React 19 (Vite)
  - Framer Motion (animations)
  - Tailwind CSS 4 (utility-first styling; dark mode via `class`)
- **Backend**
  - Node.js + Express
  - PostgreSQL (via `pg`)
  - JWT authentication (`jsonwebtoken`)
  - Email delivery (`nodemailer`) for verification/password reset
  - Env management (`dotenv`)
  - CORS, cookie parsing


### Key Features
- **Interactive Games**
  - Writ Quest: identify the correct constitutional writ via scenario MCQs.
  - Scenario Snap: timed scenario cards with streak bonuses and learn mode.
  - Wheel of Rights and Snakes & Ladders variations for rights learning.
- **Multilingual Content**
  - Scenarios and modules with translations (e.g., `en`, `hi`).
- **Learning Feedback**
  - Correct/incorrect feedback, explanations, badges, and score tracking.
- **User Accounts and Progress**
  - Registration, login, email verification, password reset.
  - Progress stored in `user_progress` (points, badges, completed modules).
- **Modular Content Model**
  - Modules with translated titles/descriptions.
  - Scenarios with translated stories/options and correct answers.


### Repository Structure
```
legal-quest/
  backend/
    routes/ (auth, modules, scenarios, progress)
    server.js
    db.js
    utils/ (emailService.js)
  frontend/
    src/
      components/ (GamesPanel, ScenarioSnap, WritQuest, WheelOfRights, SnakesLadders, shared/*)
      data/ (fundamentalRightsData.js)
      utils/ (api.js)
    tailwind.config.js
    vite.config.js
  setup.sql
```


### Database Schema (PostgreSQL)
- `modules` and `module_translations`
- `scenarios`, `scenario_translations`, `scenario_options`
- `users` (augmented at runtime by auth routes for verification/reset tokens)
- `user_progress` (JSONB fields for badges/completions)

See `setup.sql` for full DDL. The backend query builders aggregate translations and options into JSON per language.


### API Summary
- `GET /api/health` – health check
- `GET /api/modules` – modules with translations; also returns all scenarios with translation mapping
- `GET /api/scenarios/module/:moduleId` – scenarios (with translations/options) for a module
- `POST /api/auth/register` – register user (email verification is sent)
- `GET /api/auth/verify-email/:token` – verify email
- `POST /api/auth/resend-verification` – resend verification email
- `POST /api/auth/login` – login, returns JWT
- `GET /api/auth/me` – current user info (JWT required)
- `GET /api/progress` – get or initialize user progress (JWT required)
- `PUT /api/progress` – update user progress (JWT required)


### Frontend Highlights
- Vite + React app with Tailwind 4
- Dark mode via `class` strategy
- Framer Motion for micro-interactions and card transitions
- Data access via `src/utils/api.js` (points to `http://localhost:3000/api` by default)


### Local Development
1) Backend
- Set environment variables (see below).
- Install and run:
```bash
cd legal-quest/backend
npm install
npm run dev
```

2) Frontend
```bash
cd legal-quest/frontend
npm install
npm run dev
```
Frontend runs on Vite dev server; backend default is `http://localhost:3000`. Update `API_BASE` in `frontend/src/utils/api.js` if needed.


### Environment Variables (Backend)
Provide a `.env` file in `legal-quest/backend`:
```
PORT=3000
JWT_SECRET=change-me-in-prod
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=legal_quest
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Legal Quest <no-reply@example.com>"
```


### Build and Production
- Frontend: `npm run build` (Vite) to generate static assets.
- Backend: `npm start` (Express). Serve frontend via a static host (or proxy through Express/nginx).


### Security and Validation
- Password hashing via `bcryptjs`
- JWT-based sessions
- Basic input validation in auth routes
- CORS enabled for frontend dev

### Roadmap / Future Enhancements
- Role-based content management UI for adding modules/scenarios
- More languages and accessibility improvements
- Offline-first content caching
- Analytics and adaptive difficulty
- Improved moderation and reporting


### Getting Help
Please open issues with steps to reproduce, logs, and environment details.



