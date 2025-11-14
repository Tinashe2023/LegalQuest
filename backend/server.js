const express = require('express');
require('dotenv').config();

const modulesRouter = require('./routes/modules');
const scenariosRouter = require('./routes/scenarios');
const { router: authRouter } = require('./routes/auth');
const progressRouter = require('./routes/progress');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const cors = require('cors');
app.use(cors({
  origin: [
    'https://legalquest-frontend.onrender.com', // Your Live Frontend (Copy this EXACTLY)
    'http://localhost:5173',                  // Your Local Frontend (Keep this for testing)
    'http://localhost:3000'                   // Just in case
  ],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/modules', modulesRouter);
app.use('/api/scenarios', scenariosRouter);
app.use('/api/auth', authRouter);
app.use('/api/progress', progressRouter);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});