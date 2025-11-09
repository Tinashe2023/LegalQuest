const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET scenarios by module
router.get('/module/:moduleId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.correct_answer,
        s.order_index,
        json_object_agg(st.language_code,
          json_build_object(
            'concept', st.concept,
            'explanation', st.explanation,
            'story', st.story,
            'feedbackCorrect', st.feedback_correct,
            'feedbackIncorrect', st.feedback_incorrect,
            'options', (
              SELECT json_agg(json_build_object('id', option_id, 'text', option_text))
              FROM scenario_options
              WHERE scenario_id = s.id AND language_code = st.language_code
            )
          )
        ) as translations
      FROM scenarios s
      LEFT JOIN scenario_translations st ON s.id = st.scenario_id
      WHERE s.module_id = $1
      GROUP BY s.id, s.correct_answer, s.order_index
      ORDER BY s.order_index
    `, [req.params.moduleId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;