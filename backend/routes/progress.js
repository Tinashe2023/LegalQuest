const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('./auth');

// Get user progress
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_progress WHERE user_id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      // Create initial progress if doesn't exist
      const newProgress = await pool.query(
        'INSERT INTO user_progress (user_id) VALUES ($1) RETURNING *',
        [req.user.userId]
      );
      return res.json(newProgress.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user progress
router.put('/', verifyToken, async (req, res) => {
  const { points, badges, completed_modules, learned_concepts } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE user_progress 
       SET points = $1, badges = $2, completed_modules = $3, learned_concepts = $4, updated_at = NOW()
       WHERE user_id = $5
       RETURNING *`,
      [points, JSON.stringify(badges), JSON.stringify(completed_modules), JSON.stringify(learned_concepts), req.user.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;