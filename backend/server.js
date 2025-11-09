const express = require('express');
const cors = require('cors');
require('dotenv').config();

const modulesRouter = require('./routes/modules');
const scenariosRouter = require('./routes/scenarios');
const { router: authRouter } = require('./routes/auth');
const progressRouter = require('./routes/progress');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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