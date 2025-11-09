const express = require('express');
const router = express.Router();
const pool = require('../db');

// Lightweight endpoint - only module info, no scenarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id, 
        m.icon,
        json_object_agg(mt.language_code, 
          json_build_object(
            'title', mt.title,
            'description', mt.description,
            'badge', mt.badge_name
          )
        ) as translations,
        (SELECT COUNT(*) FROM scenarios WHERE module_id = m.id) as scenario_count
      FROM modules m
      LEFT JOIN module_translations mt ON m.id = mt.module_id
      GROUP BY m.id, m.icon
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;